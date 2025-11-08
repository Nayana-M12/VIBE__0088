// Referenced from javascript_log_in_with_replit and javascript_database blueprints
import {
  users,
  posts,
  energyRecords,
  waterRecords,
  ecoRoutes,
  scratchCards,
  userScratchCards,
  coupons,
  userCoupons,
  postLikes,
  postComments,
  userFollows,
  proofDocuments,
  type User,
  type UpsertUser,
  type InsertPost,
  type Post,
  type InsertEnergyRecord,
  type EnergyRecord,
  type InsertWaterRecord,
  type WaterRecord,
  type InsertEcoRoute,
  type EcoRoute,
  type ScratchCard,
  type InsertScratchCard,
  type UserScratchCard,
  type InsertUserScratchCard,
  type Coupon,
  type InsertCoupon,
  type UserCoupon,
  type InsertUserCoupon,
  type InsertPostLike,
  type PostLike,
  type InsertPostComment,
  type PostComment,
  type InsertUserFollow,
  type UserFollow,
  type ProofDocument,
  type InsertProofDocument,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserEcoBits(userId: string, EcoBitsDelta: number, carbonSavedDelta?: number, waterSavedDelta?: number): Promise<void>;
  
  // Posts operations
  createPost(post: InsertPost): Promise<Post>;
  updatePost(postId: string, data: Partial<InsertPost>): Promise<Post>;
  deletePost(postId: string): Promise<void>;
  getAllPosts(): Promise<any[]>;
  
  // Energy operations
  createEnergyRecord(record: InsertEnergyRecord): Promise<EnergyRecord>;
  getUserEnergyRecords(userId: string): Promise<EnergyRecord[]>;
  
  // Water operations
  createWaterRecord(record: InsertWaterRecord): Promise<WaterRecord>;
  getUserWaterRecords(userId: string): Promise<WaterRecord[]>;
  
  // Eco routes operations
  createEcoRoute(route: InsertEcoRoute): Promise<EcoRoute>;
  getUserEcoRoutes(userId: string): Promise<EcoRoute[]>;
  
  // Scratch cards operations
  getAllScratchCards(): Promise<ScratchCard[]>;
  createUserScratchCard(data: InsertUserScratchCard): Promise<UserScratchCard>;
  getUserScratchCards(userId: string): Promise<any[]>;
  updateScratchCard(id: string, prize: string): Promise<void>;
  
  // Coupons operations
  getAllCoupons(): Promise<Coupon[]>;
  createUserCoupon(data: InsertUserCoupon): Promise<UserCoupon>;
  getUserCoupons(userId: string): Promise<any[]>;
  
  // Social features - Post likes
  likePost(userId: string, postId: string): Promise<PostLike | null>;
  unlikePost(userId: string, postId: string): Promise<void>;
  getPostLikeCount(postId: string): Promise<number>;
  hasUserLikedPost(userId: string, postId: string): Promise<boolean>;
  
  // Social features - Post comments
  createComment(data: InsertPostComment): Promise<any>;
  getPostComments(postId: string): Promise<any[]>;
  
  // Social features - User follows (connection requests)
  sendConnectionRequest(followerId: string, followingId: string): Promise<UserFollow>;
  acceptConnectionRequest(requestId: string): Promise<void>;
  rejectConnectionRequest(requestId: string): Promise<void>;
  cancelConnectionRequest(followerId: string, followingId: string): Promise<void>;
  getConnectionStatus(followerId: string, followingId: string): Promise<string | null>; // "pending", "accepted", null
  getPendingRequests(userId: string): Promise<any[]>;
  getFollowerCount(userId: string): Promise<number>;
  getFollowingCount(userId: string): Promise<number>;
  
  // Leaderboard
  getLeaderboard(): Promise<{
    byEcoBits: User[];
    byCarbonSaved: User[];
    byWaterSaved: User[];
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserEcoBits(userId: string, EcoBitsDelta: number, carbonSavedDelta: number = 0, waterSavedDelta: number = 0): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;
    
    await db
      .update(users)
      .set({
        ecoBits: user.ecoBits + EcoBitsDelta,
        totalCarbonSaved: user.totalCarbonSaved + carbonSavedDelta,
        totalWaterSaved: user.totalWaterSaved + waterSavedDelta,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  // Posts operations
  async createPost(postData: InsertPost): Promise<Post> {
    const [post] = await db.insert(posts).values(postData).returning();
    return post;
  }

  async updatePost(postId: string, data: Partial<InsertPost>): Promise<Post> {
    const [post] = await db
      .update(posts)
      .set(data)
      .where(eq(posts.id, postId))
      .returning();
    return post;
  }

  async deletePost(postId: string): Promise<void> {
    const result = await db.delete(posts).where(eq(posts.id, postId)).returning();
    console.log("Delete result:", result.length > 0 ? "Post deleted" : "Post not found");
    return;
  }

  async getAllPosts(): Promise<any[]> {
    const results = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        content: posts.content,
        achievementType: posts.achievementType,
        mediaUrl: posts.mediaUrl,
        mediaType: posts.mediaType,
        carbonSaved: posts.carbonSaved,
        waterSaved: posts.waterSaved,
        ecoBitsEarned: posts.ecoBitsEarned,
        likes: posts.likes,
        createdAt: posts.createdAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .orderBy(desc(posts.createdAt));
    
    return results.map(r => ({
      ...r,
      user: r.user,
    }));
  }

  // Energy operations
  async createEnergyRecord(recordData: InsertEnergyRecord): Promise<EnergyRecord> {
    const [record] = await db.insert(energyRecords).values(recordData).returning();
    return record;
  }

  async getUserEnergyRecords(userId: string): Promise<EnergyRecord[]> {
    return await db
      .select()
      .from(energyRecords)
      .where(eq(energyRecords.userId, userId))
      .orderBy(desc(energyRecords.createdAt));
  }

  // Water operations
  async createWaterRecord(recordData: InsertWaterRecord): Promise<WaterRecord> {
    const [record] = await db.insert(waterRecords).values(recordData).returning();
    return record;
  }

  async getUserWaterRecords(userId: string): Promise<WaterRecord[]> {
    return await db
      .select()
      .from(waterRecords)
      .where(eq(waterRecords.userId, userId))
      .orderBy(desc(waterRecords.createdAt));
  }

  // Eco routes operations
  async createEcoRoute(routeData: InsertEcoRoute): Promise<EcoRoute> {
    const [route] = await db.insert(ecoRoutes).values(routeData).returning();
    return route;
  }

  async getUserEcoRoutes(userId: string): Promise<EcoRoute[]> {
    return await db
      .select()
      .from(ecoRoutes)
      .where(eq(ecoRoutes.userId, userId))
      .orderBy(desc(ecoRoutes.createdAt));
  }

  // Scratch cards operations
  async getAllScratchCards(): Promise<ScratchCard[]> {
    return await db
      .select()
      .from(scratchCards)
      .where(eq(scratchCards.isActive, true))
      .orderBy(scratchCards.ecoBitsCost);
  }

  async createUserScratchCard(data: InsertUserScratchCard): Promise<UserScratchCard> {
    const [userCard] = await db.insert(userScratchCards).values(data).returning();
    return userCard;
  }

  async getUserScratchCards(userId: string): Promise<any[]> {
    const results = await db
      .select({
        id: userScratchCards.id,
        userId: userScratchCards.userId,
        scratchCardId: userScratchCards.scratchCardId,
        isScratched: userScratchCards.isScratched,
        prize: userScratchCards.prize,
        redeemedAt: userScratchCards.redeemedAt,
        scratchCard: {
          id: scratchCards.id,
          name: scratchCards.name,
          description: scratchCards.description,
          category: scratchCards.category,
          ecoBitsCost: scratchCards.ecoBitsCost,
        },
      })
      .from(userScratchCards)
      .leftJoin(scratchCards, eq(userScratchCards.scratchCardId, scratchCards.id))
      .where(eq(userScratchCards.userId, userId))
      .orderBy(desc(userScratchCards.redeemedAt));
    
    return results.map(r => ({
      ...r,
      scratchCard: r.scratchCard,
    }));
  }

  async updateScratchCard(id: string, prize: string): Promise<void> {
    await db
      .update(userScratchCards)
      .set({ isScratched: true, prize })
      .where(eq(userScratchCards.id, id));
  }

  // Coupons operations
  async getAllCoupons(): Promise<Coupon[]> {
    return await db
      .select()
      .from(coupons)
      .where(eq(coupons.isActive, true))
      .orderBy(coupons.ecoBitsCost);
  }

  async createUserCoupon(data: InsertUserCoupon): Promise<UserCoupon> {
    const [userCoupon] = await db.insert(userCoupons).values(data).returning();
    return userCoupon;
  }

  async getUserCoupons(userId: string): Promise<any[]> {
    const results = await db
      .select({
        id: userCoupons.id,
        userId: userCoupons.userId,
        couponId: userCoupons.couponId,
        isUsed: userCoupons.isUsed,
        redeemedAt: userCoupons.redeemedAt,
        coupon: {
          id: coupons.id,
          name: coupons.name,
          description: coupons.description,
          discountPercentage: coupons.discountPercentage,
          brandName: coupons.brandName,
          category: coupons.category,
          ecoBitsCost: coupons.ecoBitsCost,
          validUntil: coupons.validUntil,
        },
      })
      .from(userCoupons)
      .leftJoin(coupons, eq(userCoupons.couponId, coupons.id))
      .where(eq(userCoupons.userId, userId))
      .orderBy(desc(userCoupons.redeemedAt));
    
    return results.map(r => ({
      ...r,
      coupon: r.coupon,
    }));
  }

  // Social features - Post likes
  async likePost(userId: string, postId: string): Promise<PostLike | null> {
    try {
      const [like] = await db.insert(postLikes).values({ userId, postId }).returning();
      await db.update(posts).set({ likes: sql`${posts.likes} + 1` }).where(eq(posts.id, postId));
      return like;
    } catch (error: any) {
      if (error.code === '23505') {
        const [existing] = await db.select().from(postLikes).where(
          and(eq(postLikes.userId, userId), eq(postLikes.postId, postId))
        );
        return existing || null;
      }
      throw error;
    }
  }

  async unlikePost(userId: string, postId: string): Promise<void> {
    const result = await db.delete(postLikes).where(and(eq(postLikes.userId, userId), eq(postLikes.postId, postId))).returning();
    if (result.length > 0) {
      await db.update(posts).set({ likes: sql`GREATEST(${posts.likes} - 1, 0)` }).where(eq(posts.id, postId));
    }
  }

  async getPostLikeCount(postId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(postLikes).where(eq(postLikes.postId, postId));
    return Number(result[0]?.count ?? 0);
  }

  async hasUserLikedPost(userId: string, postId: string): Promise<boolean> {
    const [like] = await db
      .select()
      .from(postLikes)
      .where(and(eq(postLikes.userId, userId), eq(postLikes.postId, postId)));
    return !!like;
  }

  // Social features - Post comments
  async createComment(data: InsertPostComment): Promise<any> {
    const [comment] = await db.insert(postComments).values(data).returning();
    const [user] = await db.select().from(users).where(eq(users.id, data.userId));
    return { ...comment, user };
  }

  async getPostComments(postId: string): Promise<any[]> {
    const results = await db
      .select({
        id: postComments.id,
        userId: postComments.userId,
        postId: postComments.postId,
        content: postComments.content,
        createdAt: postComments.createdAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(postComments)
      .leftJoin(users, eq(postComments.userId, users.id))
      .where(eq(postComments.postId, postId))
      .orderBy(desc(postComments.createdAt));
    
    return results.map(r => ({ ...r, user: r.user }));
  }

  // Social features - User follows (connection requests)
  async sendConnectionRequest(followerId: string, followingId: string): Promise<UserFollow> {
    const [follow] = await db.insert(userFollows).values({ 
      followerId, 
      followingId,
      status: 'pending'
    }).returning();
    return follow;
  }

  async acceptConnectionRequest(requestId: string): Promise<void> {
    await db
      .update(userFollows)
      .set({ status: 'accepted', respondedAt: new Date() })
      .where(eq(userFollows.id, requestId));
  }

  async rejectConnectionRequest(requestId: string): Promise<void> {
    await db
      .update(userFollows)
      .set({ status: 'rejected', respondedAt: new Date() })
      .where(eq(userFollows.id, requestId));
  }

  async cancelConnectionRequest(followerId: string, followingId: string): Promise<void> {
    await db.delete(userFollows).where(
      and(
        eq(userFollows.followerId, followerId), 
        eq(userFollows.followingId, followingId)
      )
    );
  }

  async getConnectionStatus(followerId: string, followingId: string): Promise<string | null> {
    const [follow] = await db
      .select()
      .from(userFollows)
      .where(and(
        eq(userFollows.followerId, followerId), 
        eq(userFollows.followingId, followingId)
      ));
    return follow?.status || null;
  }

  async getPendingRequests(userId: string): Promise<any[]> {
    const results = await db
      .select({
        id: userFollows.id,
        followerId: userFollows.followerId,
        followingId: userFollows.followingId,
        status: userFollows.status,
        createdAt: userFollows.createdAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          ecoBits: users.ecoBits,
        },
      })
      .from(userFollows)
      .leftJoin(users, eq(userFollows.followerId, users.id))
      .where(and(
        eq(userFollows.followingId, userId),
        eq(userFollows.status, 'pending')
      ))
      .orderBy(desc(userFollows.createdAt));
    
    return results.map(r => ({ ...r, user: r.user }));
  }

  async getFollowerCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(userFollows)
      .where(and(
        eq(userFollows.followingId, userId),
        eq(userFollows.status, 'accepted')
      ));
    return Number(result[0]?.count ?? 0);
  }

  async getFollowingCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(userFollows)
      .where(and(
        eq(userFollows.followerId, userId),
        eq(userFollows.status, 'accepted')
      ));
    return Number(result[0]?.count ?? 0);
  }

  // Leaderboard
  async getLeaderboard(): Promise<{
    byEcoBits: User[];
    byCarbonSaved: User[];
    byWaterSaved: User[];
  }> {
    const safeFields = {
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      profileImageUrl: users.profileImageUrl,
      ecoBits: users.ecoBits,
      totalCarbonSaved: users.totalCarbonSaved,
      totalWaterSaved: users.totalWaterSaved,
    };

    const [byEcoBits, byCarbonSaved, byWaterSaved] = await Promise.all([
      db.select(safeFields).from(users).orderBy(desc(users.ecoBits)).limit(10),
      db.select(safeFields).from(users).orderBy(desc(users.totalCarbonSaved)).limit(10),
      db.select(safeFields).from(users).orderBy(desc(users.totalWaterSaved)).limit(10),
    ]);

    return { byEcoBits, byCarbonSaved, byWaterSaved };
  }

  // Proof Documents operations
  async getUserProofDocuments(userId: string) {
    return await db
      .select()
      .from(proofDocuments)
      .where(eq(proofDocuments.userId, userId))
      .orderBy(desc(proofDocuments.uploadedAt));
  }

  async createProofDocument(data: any) {
    const [proof] = await db.insert(proofDocuments).values(data).returning();
    return proof;
  }

  async verifyProofDocument(proofId: string, status: string, verifierId: string, rejectionReason?: string) {
    const [proof] = await db
      .update(proofDocuments)
      .set({
        verificationStatus: status,
        verifiedAt: new Date(),
        verifiedBy: verifierId,
        rejectionReason: rejectionReason || null,
      })
      .where(eq(proofDocuments.id, proofId))
      .returning();
    return proof;
  }

  async getAllPendingProofs() {
    return await db
      .select()
      .from(proofDocuments)
      .where(eq(proofDocuments.verificationStatus, 'pending'))
      .orderBy(desc(proofDocuments.uploadedAt));
  }
}

export const storage = new DatabaseStorage();
