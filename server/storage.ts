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
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserPoints(userId: string, pointsDelta: number, carbonSavedDelta?: number, waterSavedDelta?: number): Promise<void>;
  
  // Posts operations
  createPost(post: InsertPost): Promise<Post>;
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
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
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

  async updateUserPoints(userId: string, pointsDelta: number, carbonSavedDelta: number = 0, waterSavedDelta: number = 0): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;
    
    await db
      .update(users)
      .set({
        points: user.points + pointsDelta,
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

  async getAllPosts(): Promise<any[]> {
    const results = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        content: posts.content,
        achievementType: posts.achievementType,
        carbonSaved: posts.carbonSaved,
        waterSaved: posts.waterSaved,
        pointsEarned: posts.pointsEarned,
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
      .orderBy(scratchCards.pointsCost);
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
          pointsCost: scratchCards.pointsCost,
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
      .orderBy(coupons.pointsCost);
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
          pointsCost: coupons.pointsCost,
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
}

export const storage = new DatabaseStorage();
