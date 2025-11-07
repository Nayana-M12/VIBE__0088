// Referenced from javascript_log_in_with_replit blueprint
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { analyzeEnergyUsage, analyzeWaterUsage, chatWithAdvisor } from "./openai";
import { insertPostSchema, insertEnergyRecordSchema, insertWaterRecordSchema, insertEcoRouteSchema, insertPostCommentSchema } from "@shared/schema";

// Helper function to check seasonal coupon availability
function checkSeasonalAvailability(eventType: string, now: Date): boolean {
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();
  
  // World Environment Day: June 5 (available June 1-10)
  if (eventType === 'world_environment_day') {
    return month === 6 && day >= 1 && day <= 10;
  }
  
  // App Festival Day: December 31 (available December 25-31)
  if (eventType === 'app_festival') {
    return month === 12 && day >= 25 && day <= 31;
  }
  
  return true; // Non-seasonal coupons are always available
}

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

  // Social features - Post likes
  app.post('/api/posts/:postId/like', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { postId } = req.params;
      
      const hasLiked = await storage.hasUserLikedPost(userId, postId);
      if (hasLiked) {
        await storage.unlikePost(userId, postId);
        res.json({ liked: false });
      } else {
        await storage.likePost(userId, postId);
        res.json({ liked: true });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  app.get('/api/posts/:postId/likes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { postId } = req.params;
      
      const count = await storage.getPostLikeCount(postId);
      const hasLiked = await storage.hasUserLikedPost(userId, postId);
      
      res.json({ count, hasLiked });
    } catch (error) {
      console.error("Error fetching like data:", error);
      res.status(500).json({ message: "Failed to fetch like data" });
    }
  });

  // Social features - Post comments
  app.post('/api/posts/:postId/comments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { postId } = req.params;
      
      const commentData = insertPostCommentSchema.parse({
        userId,
        postId,
        content: req.body.content,
      });
      
      const comment = await storage.createComment(commentData);
      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(400).json({ message: "Failed to create comment" });
    }
  });

  app.get('/api/posts/:postId/comments', isAuthenticated, async (req: any, res) => {
    try {
      const { postId } = req.params;
      const comments = await storage.getPostComments(postId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Social features - User follows
  app.post('/api/users/:userId/follow', isAuthenticated, async (req: any, res) => {
    try {
      const followerId = req.user.claims.sub;
      const { userId: followingId } = req.params;
      
      if (followerId === followingId) {
        return res.status(400).json({ message: "Cannot follow yourself" });
      }
      
      const isFollowing = await storage.isFollowing(followerId, followingId);
      if (isFollowing) {
        await storage.unfollowUser(followerId, followingId);
        res.json({ following: false });
      } else {
        await storage.followUser(followerId, followingId);
        res.json({ following: true });
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      res.status(500).json({ message: "Failed to toggle follow" });
    }
  });

  app.get('/api/users/:userId/follow-stats', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const { userId } = req.params;
      
      const [followerCount, followingCount, isFollowing] = await Promise.all([
        storage.getFollowerCount(userId),
        storage.getFollowingCount(userId),
        storage.isFollowing(currentUserId, userId),
      ]);
      
      res.json({ followerCount, followingCount, isFollowing });
    } catch (error) {
      console.error("Error fetching follow stats:", error);
      res.status(500).json({ message: "Failed to fetch follow stats" });
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
      const now = new Date();
      
      // Add availability status to each coupon
      const couponsWithAvailability = coupons.map(coupon => ({
        ...coupon,
        isAvailable: coupon.eventType ? checkSeasonalAvailability(coupon.eventType, now) : true,
        availabilityMessage: coupon.eventType 
          ? (coupon.eventType === 'world_environment_day' 
              ? 'Available June 1-10 (World Environment Day)' 
              : 'Available December 25-31 (App Festival Day)')
          : null
      }));
      
      res.json(couponsWithAvailability);
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

      // Check seasonal availability for special event coupons
      const now = new Date();
      if (coupon.eventType) {
        const isAvailable = checkSeasonalAvailability(coupon.eventType, now);
        if (!isAvailable) {
          return res.status(400).json({ 
            message: `This coupon is only available during ${coupon.eventType === 'world_environment_day' ? 'World Environment Day (June 5)' : 'App Festival Day (December 31)'}` 
          });
        }
      }

      // Check if coupon is still valid
      if (coupon.validUntil && new Date(coupon.validUntil) < now) {
        return res.status(400).json({ message: "This coupon has expired" });
      }

      if (!user || user.points < coupon.pointsCost) {
        return res.status(400).json({ message: "Insufficient points" });
      }

      // Deduct points
      await storage.updateUserPoints(userId, -coupon.pointsCost);

      // Generate unique coupon code
      const couponCode = `ECO-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

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

  // Leaderboard routes
  app.get('/api/leaderboard', isAuthenticated, async (req: any, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
