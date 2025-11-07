// Referenced from javascript_log_in_with_replit blueprint
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { analyzeEnergyUsage, analyzeWaterUsage, chatWithAdvisor } from "./openai";
import { insertPostSchema, insertEnergyRecordSchema, insertWaterRecordSchema, insertEcoRouteSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Posts routes
  app.get('/api/posts', isAuthenticated, async (req: any, res) => {
    try {
      const posts = await storage.getAllPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.post('/api/posts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postData = insertPostSchema.parse({ ...req.body, userId });
      const post = await storage.createPost(postData);
      res.json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(400).json({ message: "Failed to create post" });
    }
  });

  // Energy routes
  app.get('/api/energy', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const records = await storage.getUserEnergyRecords(userId);
      res.json(records);
    } catch (error) {
      console.error("Error fetching energy records:", error);
      res.status(500).json({ message: "Failed to fetch energy records" });
    }
  });

  app.post('/api/energy/analyze', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertEnergyRecordSchema.parse({ ...req.body, userId });
      
      // AI analysis
      const analysis = await analyzeEnergyUsage({
        month: data.month,
        billAmount: data.billAmount,
        consumption: data.consumption,
      });

      // Calculate points: lower bill = more points
      // Base points: 10, bonus points for low consumption
      const avgConsumption = 900; // kWh per month average
      const percentageBelow = ((avgConsumption - data.consumption) / avgConsumption) * 100;
      const pointsEarned = Math.max(5, Math.round(10 + percentageBelow * 0.5));

      const record = await storage.createEnergyRecord({
        ...data,
        predictedWastage: analysis.predictedWastage,
        wastagePercentage: analysis.wastagePercentage,
        aiInsights: analysis.insights,
        pointsEarned,
      });

      // Update user points
      await storage.updateUserPoints(userId, pointsEarned);

      res.json(record);
    } catch (error) {
      console.error("Error analyzing energy:", error);
      res.status(400).json({ message: "Failed to analyze energy data" });
    }
  });

  // Water routes
  app.get('/api/water', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const records = await storage.getUserWaterRecords(userId);
      res.json(records);
    } catch (error) {
      console.error("Error fetching water records:", error);
      res.status(500).json({ message: "Failed to fetch water records" });
    }
  });

  app.post('/api/water/analyze', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertWaterRecordSchema.parse({ ...req.body, userId });
      
      // AI analysis
      const analysis = await analyzeWaterUsage({
        month: data.month,
        billAmount: data.billAmount,
        consumption: data.consumption,
      });

      // Calculate points based on efficiency score
      const pointsEarned = Math.round(analysis.efficiencyScore / 5);

      // Calculate water saved (compared to average)
      const avgConsumption = 18000; // liters per month
      const waterSaved = Math.max(0, avgConsumption - data.consumption);

      const record = await storage.createWaterRecord({
        ...data,
        efficiencyScore: analysis.efficiencyScore,
        aiInsights: analysis.insights,
        pointsEarned,
      });

      // Update user points and water saved
      await storage.updateUserPoints(userId, pointsEarned, 0, waterSaved);

      res.json(record);
    } catch (error) {
      console.error("Error analyzing water:", error);
      res.status(400).json({ message: "Failed to analyze water data" });
    }
  });

  // Routes routes
  app.get('/api/routes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const routes = await storage.getUserEcoRoutes(userId);
      res.json(routes);
    } catch (error) {
      console.error("Error fetching routes:", error);
      res.status(500).json({ message: "Failed to fetch routes" });
    }
  });

  app.post('/api/routes/calculate', isAuthenticated, async (req: any, res) => {
    try {
      // Mock route calculation (in real app, would use mapping API)
      res.json({ success: true });
    } catch (error) {
      console.error("Error calculating routes:", error);
      res.status(400).json({ message: "Failed to calculate routes" });
    }
  });

  app.post('/api/routes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertEcoRouteSchema.parse({ ...req.body, userId });
      
      const route = await storage.createEcoRoute(data);

      // Update user points and carbon saved
      await storage.updateUserPoints(userId, data.pointsEarned, data.carbonSaved);

      res.json(route);
    } catch (error) {
      console.error("Error creating route:", error);
      res.status(400).json({ message: "Failed to create route" });
    }
  });

  // AI Advisor routes
  app.post('/api/advisor/chat', isAuthenticated, async (req: any, res) => {
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Message is required" });
      }

      const response = await chatWithAdvisor(message);
      res.json({ response });
    } catch (error) {
      console.error("Error in advisor chat:", error);
      res.status(500).json({ message: "Failed to get advisor response" });
    }
  });

  // Rewards routes - Scratch Cards
  app.get('/api/rewards/scratch-cards', isAuthenticated, async (req: any, res) => {
    try {
      const cards = await storage.getAllScratchCards();
      res.json(cards);
    } catch (error) {
      console.error("Error fetching scratch cards:", error);
      res.status(500).json({ message: "Failed to fetch scratch cards" });
    }
  });

  app.get('/api/rewards/my-scratch-cards', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cards = await storage.getUserScratchCards(userId);
      res.json(cards);
    } catch (error) {
      console.error("Error fetching user scratch cards:", error);
      res.status(500).json({ message: "Failed to fetch user scratch cards" });
    }
  });

  app.post('/api/rewards/redeem-scratch-card', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { scratchCardId } = req.body;

      const user = await storage.getUser(userId);
      const cards = await storage.getAllScratchCards();
      const card = cards.find(c => c.id === scratchCardId);

      if (!card) {
        return res.status(404).json({ message: "Scratch card not found" });
      }

      if (!user || user.points < card.pointsCost) {
        return res.status(400).json({ message: "Insufficient points" });
      }

      // Deduct points
      await storage.updateUserPoints(userId, -card.pointsCost);

      // Create user scratch card
      const userCard = await storage.createUserScratchCard({
        userId,
        scratchCardId,
        isScratched: false,
      });

      res.json(userCard);
    } catch (error) {
      console.error("Error redeeming scratch card:", error);
      res.status(500).json({ message: "Failed to redeem scratch card" });
    }
  });

  app.post('/api/rewards/scratch', isAuthenticated, async (req: any, res) => {
    try {
      const { userCardId } = req.body;

      // Generate random prize
      const prizes = [
        "10% off eco-friendly cleaning products",
        "15% off bamboo toothbrushes",
        "Free reusable shopping bag",
        "20% off organic cotton towels",
        "$5 gift card for sustainable products",
      ];
      const prize = prizes[Math.floor(Math.random() * prizes.length)];

      await storage.updateScratchCard(userCardId, prize);

      res.json({ prize });
    } catch (error) {
      console.error("Error scratching card:", error);
      res.status(500).json({ message: "Failed to scratch card" });
    }
  });

  // Rewards routes - Coupons
  app.get('/api/rewards/coupons', isAuthenticated, async (req: any, res) => {
    try {
      const coupons = await storage.getAllCoupons();
      res.json(coupons);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      res.status(500).json({ message: "Failed to fetch coupons" });
    }
  });

  app.get('/api/rewards/my-coupons', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const coupons = await storage.getUserCoupons(userId);
      res.json(coupons);
    } catch (error) {
      console.error("Error fetching user coupons:", error);
      res.status(500).json({ message: "Failed to fetch user coupons" });
    }
  });

  app.post('/api/rewards/redeem-coupon', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { couponId } = req.body;

      const user = await storage.getUser(userId);
      const allCoupons = await storage.getAllCoupons();
      const coupon = allCoupons.find(c => c.id === couponId);

      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }

      if (!user || user.points < coupon.pointsCost) {
        return res.status(400).json({ message: "Insufficient points" });
      }

      // Deduct points
      await storage.updateUserPoints(userId, -coupon.pointsCost);

      // Create user coupon
      const userCoupon = await storage.createUserCoupon({
        userId,
        couponId,
        isUsed: false,
      });

      res.json(userCoupon);
    } catch (error) {
      console.error("Error redeeming coupon:", error);
      res.status(500).json({ message: "Failed to redeem coupon" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
