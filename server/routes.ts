// Referenced from javascript_log_in_with_replit blueprint
import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { setupLocalAuth, isAuthenticated } from "./localAuth";
import { analyzeEnergyUsage, analyzeWaterUsage, chatWithAdvisor } from "./openai";
import { insertPostSchema, insertEnergyRecordSchema, insertWaterRecordSchema, insertEcoRouteSchema, insertPostCommentSchema } from "@shared/schema";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for videos
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only images and videos are allowed"));
    }
  },
});

// Helper function to check seasonal coupon availability
function checkSeasonalAvailability(eventType: string, now: Date): boolean {
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();
  
  // World Warrior Drive: March 20-22
  if (eventType === 'world_warrior_drive') {
    return month === 3 && day >= 20 && day <= 22;
  }
  
  // Earth Impact Fest: June 3-5
  if (eventType === 'earth_impact_fest') {
    return month === 6 && day >= 3 && day <= 5;
  }
  
  // Green Diwali Fiesta: November 20-22
  if (eventType === 'green_diwali_fiesta') {
    return month === 11 && day >= 20 && day <= 22;
  }
  
  return true; // Non-seasonal coupons are always available
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware - using local auth for development
  setupLocalAuth(app);

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

  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));

  app.post('/api/posts', isAuthenticated, upload.single('media'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { content, achievementType } = req.body;
      
      let mediaUrl = null;
      let mediaType = null;
      
      if (req.file) {
        mediaUrl = `/uploads/${req.file.filename}`;
        mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
      }
      
      // Calculate ecoBits based on achievement type
      const { calculateEcoBitsByAchievement } = await import('./ecoBitsCalculator');
      const reward = calculateEcoBitsByAchievement(achievementType || 'general');
      
      const postData = {
        userId,
        content,
        achievementType: achievementType || 'general',
        mediaUrl,
        mediaType,
        ecoBitsEarned: reward.ecoBits,
      };
      
      const post = await storage.createPost(postData);
      
      // Award ecoBits to user
      if (reward.ecoBits > 0) {
        await storage.updateUserEcoBits(userId, reward.ecoBits);
      }
      
      res.json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(400).json({ message: "Failed to create post" });
    }
  });

  app.patch('/api/posts/:postId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { postId } = req.params;
      const { content } = req.body;
      
      if (!content || !content.trim()) {
        return res.status(400).json({ message: "Content is required" });
      }
      
      // Get the post to check ownership
      const posts = await storage.getAllPosts();
      const post = posts.find(p => p.id === postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      if (post.userId !== userId) {
        return res.status(403).json({ message: "You can only edit your own posts" });
      }
      
      // Update the post
      const updatedPost = await storage.updatePost(postId, { content: content.trim() });
      
      res.json(updatedPost);
    } catch (error) {
      console.error("Error updating post:", error);
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  app.delete('/api/posts/:postId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { postId } = req.params;
      
      console.log("Delete request - User ID:", userId, "Post ID:", postId);
      
      // Get the post to check ownership and media
      const posts = await storage.getAllPosts();
      const post = posts.find(p => p.id === postId);
      
      console.log("Found post:", post ? `ID: ${post.id}, Owner: ${post.userId}` : "Not found");
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      if (post.userId !== userId) {
        console.log("Permission denied - Post owner:", post.userId, "Current user:", userId);
        return res.status(403).json({ message: "You can only delete your own posts" });
      }
      
      // Delete media file if exists
      if ((post as any).mediaUrl) {
        try {
          const filePath = path.join(process.cwd(), (post as any).mediaUrl);
          console.log("Attempting to delete file:", filePath);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log("File deleted successfully");
          } else {
            console.log("File not found on disk");
          }
        } catch (fileError) {
          console.error("Error deleting file:", fileError);
          // Continue with post deletion even if file deletion fails
        }
      }
      
      // Delete the post from database (cascade will handle likes and comments)
      await storage.deletePost(postId);
      console.log("Post deletion completed");
      
      res.json({ message: "Post deleted successfully", success: true });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ message: "Failed to delete post", error: String(error) });
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

  // Social features - Connection requests
  app.post('/api/users/:userId/follow', isAuthenticated, async (req: any, res) => {
    try {
      const followerId = req.user.claims.sub;
      const { userId: followingId } = req.params;
      
      console.log("Connection request - Follower:", followerId, "Following:", followingId);
      
      if (followerId === followingId) {
        return res.status(400).json({ message: "Cannot connect with yourself" });
      }
      
      const status = await storage.getConnectionStatus(followerId, followingId);
      console.log("Current status:", status);
      
      if (status === 'pending' || status === 'accepted') {
        // Cancel/remove connection
        console.log("Cancelling connection...");
        await storage.cancelConnectionRequest(followerId, followingId);
        console.log("Connection cancelled, returning null");
        res.json({ status: null });
      } else {
        // Send connection request
        console.log("Sending new connection request...");
        const result = await storage.sendConnectionRequest(followerId, followingId);
        console.log("Connection request created:", result);
        res.json({ status: 'pending' });
      }
    } catch (error: any) {
      console.error("Error toggling connection:", error);
      console.error("Error details:", error.message, error.stack);
      res.status(500).json({ message: error.message || "Failed to toggle connection" });
    }
  });

  app.post('/api/connection-requests/:requestId/accept', isAuthenticated, async (req: any, res) => {
    try {
      const { requestId } = req.params;
      await storage.acceptConnectionRequest(requestId);
      res.json({ message: "Connection request accepted" });
    } catch (error) {
      console.error("Error accepting request:", error);
      res.status(500).json({ message: "Failed to accept request" });
    }
  });

  app.post('/api/connection-requests/:requestId/reject', isAuthenticated, async (req: any, res) => {
    try {
      const { requestId } = req.params;
      await storage.rejectConnectionRequest(requestId);
      res.json({ message: "Connection request rejected" });
    } catch (error) {
      console.error("Error rejecting request:", error);
      res.status(500).json({ message: "Failed to reject request" });
    }
  });

  app.get('/api/connection-requests/pending', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requests = await storage.getPendingRequests(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      res.status(500).json({ message: "Failed to fetch pending requests" });
    }
  });

  app.get('/api/users/:userId/follow-stats', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const { userId } = req.params;
      
      const [followerCount, followingCount, connectionStatus] = await Promise.all([
        storage.getFollowerCount(userId),
        storage.getFollowingCount(userId),
        storage.getConnectionStatus(currentUserId, userId),
      ]);
      
      res.json({ 
        followerCount, 
        followingCount, 
        connectionStatus, // "pending", "accepted", null
        isFollowing: connectionStatus === 'accepted' 
      });
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

      // Calculate ecoBits based on energy consumption
      const { calculateEcoBitsForEnergy } = await import('./ecoBitsCalculator');
      const ecoBitsEarned = calculateEcoBitsForEnergy(data.consumption);

      const record = await storage.createEnergyRecord({
        ...data,
        predictedWastage: analysis.predictedWastage,
        wastagePercentage: analysis.wastagePercentage,
        aiInsights: analysis.insights,
        ecoBitsEarned,
      });

      // Update user ecoBits
      await storage.updateUserEcoBits(userId, ecoBitsEarned);

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

      // Calculate ecoBits based on water consumption
      const { calculateEcoBitsForWater } = await import('./ecoBitsCalculator');
      const ecoBitsEarned = calculateEcoBitsForWater(data.consumption);

      // Calculate water saved (compared to average)
      const avgConsumption = 18000; // liters per month
      const waterSaved = Math.max(0, avgConsumption - data.consumption);

      const record = await storage.createWaterRecord({
        ...data,
        efficiencyScore: analysis.efficiencyScore,
        aiInsights: analysis.insights,
        ecoBitsEarned,
      });

      // Update user ecoBits and water saved
      await storage.updateUserEcoBits(userId, ecoBitsEarned, 0, waterSaved);

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
      const { startLocation, endLocation } = req.body;
      
      if (!startLocation || !endLocation) {
        return res.status(400).json({ message: "Start and end locations are required" });
      }

      const { calculateEcoRoutes } = await import('./mapbox');
      const routes = await calculateEcoRoutes(startLocation, endLocation);
      
      res.json({ routes });
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

      // Update user ecoBits and carbon saved
      await storage.updateUserEcoBits(userId, data.ecoBitsEarned, data.carbonSaved);

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
      const userId = req.user.claims.sub;
      const cards = await storage.getAllScratchCards();
      const userCards = await storage.getUserScratchCards(userId);
      
      // Mark cards as redeemed if user already has them
      const redeemedCardIds = new Set(userCards.map(uc => uc.scratchCardId));
      const cardsWithStatus = cards.map(card => ({
        ...card,
        isRedeemed: redeemedCardIds.has(card.id),
      }));
      
      res.json(cardsWithStatus);
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

      // Check if user already redeemed this card
      const userCards = await storage.getUserScratchCards(userId);
      const alreadyRedeemed = userCards.some(uc => uc.scratchCardId === scratchCardId);
      
      if (alreadyRedeemed) {
        return res.status(400).json({ message: "You have already redeemed this scratch card" });
      }

      const user = await storage.getUser(userId);
      const cards = await storage.getAllScratchCards();
      const card = cards.find(c => c.id === scratchCardId);

      if (!card) {
        return res.status(404).json({ message: "Scratch card not found" });
      }

      if (!user || user.ecoBits < card.ecoBitsCost) {
        return res.status(400).json({ message: "Insufficient ecoBits" });
      }

      // Deduct ecoBits
      await storage.updateUserEcoBits(userId, -card.ecoBitsCost);

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

      // Generate random prize from eco-friendly platforms: Zepto, Bioq, Naava
      const prizes = [
        // Zepto prizes
        "5% off on Zepto eco-friendly products",
        "7% off on Zepto sustainable home essentials",
        "10% off on Zepto organic groceries",
        "Free reusable shopping bag from Zepto",
        "5% off on zero-waste essentials (Zepto)",
        "8% off on Zepto natural cleaning products",
        "Free delivery on Zepto eco-products",
        
        // Naava prizes
        "5% off on Naava organic range",
        "7% off on Naava chemical-free products",
        "10% off on Naava natural skincare",
        "5% off on eco-friendly cleaning products (Naava)",
        "8% off on Naava sustainable home care",
        "Free sample pack from Naava",
        
        // Bioq prizes
        "5% off on Bioq natural products",
        "7% off on Bioq organic groceries",
        "10% off on Bioq wellness range",
        "5% off on bamboo products (Bioq)",
        "8% off on Bioq eco-friendly essentials",
        "Free organic snack from Bioq",
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
      const userId = req.user.claims.sub;
      const coupons = await storage.getAllCoupons();
      const userCoupons = await storage.getUserCoupons(userId);
      const now = new Date();
      
      // Mark coupons as redeemed if user already has them
      const redeemedCouponIds = new Set(userCoupons.map(uc => uc.couponId));
      
      // Add availability status to each coupon
      const eventMessages: Record<string, string> = {
        'world_warrior_drive': 'Available March 20-22 (World Warrior Drive)',
        'earth_impact_fest': 'Available June 3-5 (Earth Impact Fest)',
        'green_diwali_fiesta': 'Available November 20-22 (Green Diwali Fiesta)'
      };
      
      const couponsWithAvailability = coupons.map(coupon => ({
        ...coupon,
        isRedeemed: redeemedCouponIds.has(coupon.id),
        isAvailable: coupon.eventType ? checkSeasonalAvailability(coupon.eventType, now) : true,
        availabilityMessage: coupon.eventType ? eventMessages[coupon.eventType] : null
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

      // Check if user already redeemed this coupon
      const userCoupons = await storage.getUserCoupons(userId);
      const alreadyRedeemed = userCoupons.some(uc => uc.couponId === couponId);
      
      if (alreadyRedeemed) {
        return res.status(400).json({ message: "You have already claimed this coupon" });
      }

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
          const eventNames: Record<string, string> = {
            'world_warrior_drive': 'World Warrior Drive (March 20-22)',
            'earth_impact_fest': 'Earth Impact Fest (June 3-5)',
            'green_diwali_fiesta': 'Green Diwali Fiesta (November 20-22)'
          };
          return res.status(400).json({ 
            message: `This coupon is only available during ${eventNames[coupon.eventType] || coupon.eventType}` 
          });
        }
      }

      // Check if coupon is still valid
      if (coupon.validUntil && new Date(coupon.validUntil) < now) {
        return res.status(400).json({ message: "This coupon has expired" });
      }

      if (!user || user.ecoBits < coupon.ecoBitsCost) {
        return res.status(400).json({ message: "Insufficient ecoBits" });
      }

      // Deduct ecoBits
      await storage.updateUserEcoBits(userId, -coupon.ecoBitsCost);

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

  // Mapbox token endpoint
  app.get('/api/mapbox-token', isAuthenticated, async (req: any, res) => {
    try {
      const token = process.env.MAPBOX_ACCESS_TOKEN || '';
      res.json({ token });
    } catch (error) {
      console.error("Error fetching mapbox token:", error);
      res.status(500).json({ message: "Failed to fetch mapbox token" });
    }
  });

  // Proof Documents routes
  app.get('/api/proof-documents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const proofs = await storage.getUserProofDocuments(userId);
      res.json(proofs);
    } catch (error) {
      console.error("Error fetching proof documents:", error);
      res.status(500).json({ message: "Failed to fetch proof documents" });
    }
  });

  app.post('/api/proof-documents', isAuthenticated, upload.single('proof'), async (req: any, res) => {
    try {
      console.log("=== Proof submission started ===");
      const userId = req.user.claims.sub;
      const { proofType, description, metadata } = req.body;
      console.log("User ID:", userId);
      console.log("Proof Type:", proofType);
      console.log("File:", req.file ? req.file.originalname : "No file");

      if (!req.file) {
        console.log("ERROR: No file uploaded");
        return res.status(400).json({ message: "Proof file is required" });
      }

      // Validate proof file
      const { validateProofFile, calculateProofEcoBits, canAutoApprove } = await import('./proofVerification');
      const validation = validateProofFile(req.file);
      
      if (!validation.valid) {
        console.log("ERROR: File validation failed:", validation.error);
        return res.status(400).json({ message: validation.error });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      const ecoBitsAwarded = calculateProofEcoBits(proofType, metadata ? JSON.parse(metadata) : undefined);
      
      // Check if can auto-approve
      const autoApprove = canAutoApprove(proofType, userId);
      const verificationStatus = autoApprove ? 'auto_approved' : 'pending';

      console.log("EcoBits to award:", ecoBitsAwarded);
      console.log("Verification status:", verificationStatus);

      const proofData = {
        userId,
        proofType,
        fileUrl,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        verificationStatus,
        ecoBitsAwarded,
        metadata: metadata ? JSON.parse(metadata) : null,
        verifiedAt: autoApprove ? new Date() : undefined,
      };

      console.log("Creating proof document...");
      const proof = await storage.createProofDocument(proofData);
      console.log("Proof created:", proof.id);

      // Award ecoBits if auto-approved
      if (autoApprove) {
        console.log("Auto-approved! Awarding ecoBits...");
        await storage.updateUserEcoBits(userId, ecoBitsAwarded);
        console.log("EcoBits awarded successfully");
      }

      console.log("=== Proof submission completed successfully ===");
      res.json(proof);
    } catch (error: any) {
      console.error("=== ERROR submitting proof ===");
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      res.status(400).json({ message: error.message || "Failed to submit proof" });
    }
  });

  app.patch('/api/proof-documents/:proofId/verify', isAuthenticated, async (req: any, res) => {
    try {
      const { proofId } = req.params;
      const { status, rejectionReason } = req.body;
      const verifierId = req.user.claims.sub;

      const proof = await storage.verifyProofDocument(proofId, status, verifierId, rejectionReason);

      // Award ecoBits if approved
      if (status === 'approved' && proof) {
        await storage.updateUserEcoBits(proof.userId, proof.ecoBitsAwarded);
      }

      res.json(proof);
    } catch (error) {
      console.error("Error verifying proof:", error);
      res.status(500).json({ message: "Failed to verify proof" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
