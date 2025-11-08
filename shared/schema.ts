import { sql } from 'drizzle-orm';
import {
  index,
  uniqueIndex,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  real,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  ecoBits: integer("eco_bits").notNull().default(0),
  totalCarbonSaved: real("total_carbon_saved").notNull().default(0),
  totalWaterSaved: real("total_water_saved").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Posts - social feed for sharing sustainability achievements
export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  achievementType: varchar("achievement_type").notNull(), // "energy", "water", "route", "general"
  mediaUrl: text("media_url"), // URL to uploaded image/video
  mediaType: varchar("media_type"), // "image" or "video"
  carbonSaved: real("carbon_saved"),
  waterSaved: real("water_saved"),
  ecoBitsEarned: integer("eco_bits_earned"),
  likes: integer("likes").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
});

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

// Energy consumption records
export const energyRecords = pgTable("energy_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  month: varchar("month").notNull(), // "2025-01"
  billAmount: real("bill_amount").notNull(),
  consumption: real("consumption").notNull(), // kWh
  predictedWastage: real("predicted_wastage"),
  wastagePercentage: real("wastage_percentage"),
  aiInsights: text("ai_insights"),
  ecoBitsEarned: integer("eco_bits_earned").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEnergyRecordSchema = createInsertSchema(energyRecords).omit({
  id: true,
  createdAt: true,
  predictedWastage: true,
  wastagePercentage: true,
  aiInsights: true,
});

export type InsertEnergyRecord = z.infer<typeof insertEnergyRecordSchema>;
export type EnergyRecord = typeof energyRecords.$inferSelect;

// Water consumption records
export const waterRecords = pgTable("water_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  month: varchar("month").notNull(), // "2025-01"
  billAmount: real("bill_amount").notNull(),
  consumption: real("consumption").notNull(), // liters
  efficiencyScore: integer("efficiency_score"), // 0-100
  aiInsights: text("ai_insights"),
  ecoBitsEarned: integer("eco_bits_earned").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWaterRecordSchema = createInsertSchema(waterRecords).omit({
  id: true,
  createdAt: true,
  efficiencyScore: true,
  aiInsights: true,
});

export type InsertWaterRecord = z.infer<typeof insertWaterRecordSchema>;
export type WaterRecord = typeof waterRecords.$inferSelect;

// Eco routes taken by users
export const ecoRoutes = pgTable("eco_routes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  startLocation: varchar("start_location").notNull(),
  endLocation: varchar("end_location").notNull(),
  distance: real("distance").notNull(), // km
  carbonSaved: real("carbon_saved").notNull(), // kg CO2
  ecoBitsEarned: integer("eco_bits_earned").notNull().default(0),
  routeType: varchar("route_type").notNull(), // "eco", "standard"
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEcoRouteSchema = createInsertSchema(ecoRoutes).omit({
  id: true,
  createdAt: true,
});

export type InsertEcoRoute = z.infer<typeof insertEcoRouteSchema>;
export type EcoRoute = typeof ecoRoutes.$inferSelect;

// Scratch cards available to users
export const scratchCards = pgTable("scratch_cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(), // "home_decor", "personal_essentials"
  ecoBitsCost: integer("eco_bits_cost").notNull(),
  imageUrl: varchar("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertScratchCardSchema = createInsertSchema(scratchCards).omit({
  id: true,
  createdAt: true,
});

export type InsertScratchCard = z.infer<typeof insertScratchCardSchema>;
export type ScratchCard = typeof scratchCards.$inferSelect;

// User scratch card redemptions
export const userScratchCards = pgTable("user_scratch_cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  scratchCardId: varchar("scratch_card_id").notNull().references(() => scratchCards.id),
  isScratched: boolean("is_scratched").notNull().default(false),
  prize: varchar("prize"),
  redeemedAt: timestamp("redeemed_at").defaultNow(),
});

export const insertUserScratchCardSchema = createInsertSchema(userScratchCards).omit({
  id: true,
  redeemedAt: true,
});

export type InsertUserScratchCard = z.infer<typeof insertUserScratchCardSchema>;
export type UserScratchCard = typeof userScratchCards.$inferSelect;

// Discount coupons
export const coupons = pgTable("coupons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  tier: varchar("tier").notNull(), // "golden", "platinum", "platinum_premium"
  discountPercentage: integer("discount_percentage").notNull(),
  brandName: varchar("brand_name").notNull(),
  category: varchar("category").notNull(), // "products", "courses"
  ecoBitsCost: integer("eco_bits_cost").notNull(),
  validUntil: timestamp("valid_until").notNull(),
  eventType: varchar("event_type"), // "world_warrior_drive", "earth_impact_fest", "green_diwali_fiesta"
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCouponSchema = createInsertSchema(coupons).omit({
  id: true,
  createdAt: true,
});

export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type Coupon = typeof coupons.$inferSelect;

// User coupon redemptions
export const userCoupons = pgTable("user_coupons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  couponId: varchar("coupon_id").notNull().references(() => coupons.id),
  isUsed: boolean("is_used").notNull().default(false),
  redeemedAt: timestamp("redeemed_at").defaultNow(),
});

export const insertUserCouponSchema = createInsertSchema(userCoupons).omit({
  id: true,
  redeemedAt: true,
});

export type InsertUserCoupon = z.infer<typeof insertUserCouponSchema>;
export type UserCoupon = typeof userCoupons.$inferSelect;

// Post likes
export const postLikes = pgTable("post_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  postId: varchar("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  uniqueIndex("unique_post_likes_user_post").on(table.userId, table.postId),
]);

export const insertPostLikeSchema = createInsertSchema(postLikes).omit({
  id: true,
  createdAt: true,
});

export type InsertPostLike = z.infer<typeof insertPostLikeSchema>;
export type PostLike = typeof postLikes.$inferSelect;

// Post comments
export const postComments = pgTable("post_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  postId: varchar("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPostCommentSchema = createInsertSchema(postComments).omit({
  id: true,
  createdAt: true,
});

export type InsertPostComment = z.infer<typeof insertPostCommentSchema>;
export type PostComment = typeof postComments.$inferSelect;

// User follows (connection requests)
export const userFollows = pgTable("user_follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  followerId: varchar("follower_id").notNull().references(() => users.id, { onDelete: "cascade" }), // Person sending request
  followingId: varchar("following_id").notNull().references(() => users.id, { onDelete: "cascade" }), // Person receiving request
  status: varchar("status").notNull().default("pending"), // "pending", "accepted", "rejected"
  createdAt: timestamp("created_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
});

export const insertUserFollowSchema = createInsertSchema(userFollows).omit({
  id: true,
  createdAt: true,
});

export type InsertUserFollow = z.infer<typeof insertUserFollowSchema>;
export type UserFollow = typeof userFollows.$inferSelect;

// Proof documents for verification
export const proofDocuments = pgTable("proof_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  postId: varchar("post_id").references(() => posts.id, { onDelete: "cascade" }),
  proofType: varchar("proof_type").notNull(), // "transport_ticket", "carpool_receipt", etc.
  fileUrl: text("file_url").notNull(),
  fileName: varchar("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  verificationStatus: varchar("verification_status").notNull().default("pending"), // "pending", "approved", "rejected", "auto_approved"
  verifiedAt: timestamp("verified_at"),
  verifiedBy: varchar("verified_by"),
  rejectionReason: text("rejection_reason"),
  ecoBitsAwarded: integer("eco_bits_awarded").notNull().default(0),
  metadata: jsonb("metadata"), // Additional info like date, amount, vendor
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const insertProofDocumentSchema = createInsertSchema(proofDocuments).omit({
  id: true,
  uploadedAt: true,
  verifiedAt: true,
});

export type InsertProofDocument = z.infer<typeof insertProofDocumentSchema>;
export type ProofDocument = typeof proofDocuments.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  energyRecords: many(energyRecords),
  waterRecords: many(waterRecords),
  ecoRoutes: many(ecoRoutes),
  userScratchCards: many(userScratchCards),
  userCoupons: many(userCoupons),
  proofDocuments: many(proofDocuments),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  postLikes: many(postLikes),
  postComments: many(postComments),
  proofDocuments: many(proofDocuments),
}));

export const energyRecordsRelations = relations(energyRecords, ({ one }) => ({
  user: one(users, {
    fields: [energyRecords.userId],
    references: [users.id],
  }),
}));

export const waterRecordsRelations = relations(waterRecords, ({ one }) => ({
  user: one(users, {
    fields: [waterRecords.userId],
    references: [users.id],
  }),
}));

export const ecoRoutesRelations = relations(ecoRoutes, ({ one }) => ({
  user: one(users, {
    fields: [ecoRoutes.userId],
    references: [users.id],
  }),
}));

export const userScratchCardsRelations = relations(userScratchCards, ({ one }) => ({
  user: one(users, {
    fields: [userScratchCards.userId],
    references: [users.id],
  }),
  scratchCard: one(scratchCards, {
    fields: [userScratchCards.scratchCardId],
    references: [scratchCards.id],
  }),
}));

export const userCouponsRelations = relations(userCoupons, ({ one }) => ({
  user: one(users, {
    fields: [userCoupons.userId],
    references: [users.id],
  }),
  coupon: one(coupons, {
    fields: [userCoupons.couponId],
    references: [coupons.id],
  }),
}));

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  user: one(users, {
    fields: [postLikes.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [postLikes.postId],
    references: [posts.id],
  }),
}));

export const postCommentsRelations = relations(postComments, ({ one }) => ({
  user: one(users, {
    fields: [postComments.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [postComments.postId],
    references: [posts.id],
  }),
}));

export const userFollowsRelations = relations(userFollows, ({ one }) => ({
  follower: one(users, {
    fields: [userFollows.followerId],
    references: [users.id],
  }),
  following: one(users, {
    fields: [userFollows.followingId],
    references: [users.id],
  }),
}));

export const proofDocumentsRelations = relations(proofDocuments, ({ one }) => ({
  user: one(users, {
    fields: [proofDocuments.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [proofDocuments.postId],
    references: [posts.id],
  }),
}));
