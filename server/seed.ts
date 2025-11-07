import { db } from "./db";
import { scratchCards, coupons } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  // Seed scratch cards
  const scratchCardData = [
    {
      name: "Eco Home Essentials",
      description: "Eco-friendly cleaning products bundle",
      category: "home_decor",
      pointsCost: 50,
      isActive: true,
    },
    {
      name: "Bamboo Basics",
      description: "Set of bamboo kitchen utensils",
      category: "home_decor",
      pointsCost: 75,
      isActive: true,
    },
    {
      name: "Green Living Pack",
      description: "Reusable bags and containers set",
      category: "personal_essentials",
      pointsCost: 60,
      isActive: true,
    },
    {
      name: "Sustainable Self-Care",
      description: "Organic personal care items",
      category: "personal_essentials",
      pointsCost: 80,
      isActive: true,
    },
  ];

  for (const card of scratchCardData) {
    await db.insert(scratchCards).values(card).onConflictDoNothing();
  }

  // Seed coupons
  const couponData = [
    {
      name: "EcoStore Premium",
      description: "25% off on all eco-friendly products",
      discountPercentage: 25,
      brandName: "EcoStore",
      category: "products",
      pointsCost: 200,
      validUntil: new Date("2026-12-31"),
      eventType: null,
      isActive: true,
    },
    {
      name: "GreenTech Gadgets",
      description: "20% off on energy-efficient appliances",
      discountPercentage: 20,
      brandName: "GreenTech",
      category: "products",
      pointsCost: 250,
      validUntil: new Date("2026-12-31"),
      eventType: null,
      isActive: true,
    },
    {
      name: "Sustainability Course - World Environment Day",
      description: "50% off on online sustainability certification",
      discountPercentage: 50,
      brandName: "EcoAcademy",
      category: "courses",
      pointsCost: 300,
      validUntil: new Date("2025-06-05"),
      eventType: "world_environment_day",
      isActive: true,
    },
    {
      name: "App Festival Special",
      description: "30% off on eco-lifestyle masterclass",
      discountPercentage: 30,
      brandName: "Green Living Institute",
      category: "courses",
      pointsCost: 250,
      validUntil: new Date("2025-12-31"),
      eventType: "app_festival",
      isActive: true,
    },
  ];

  for (const coupon of couponData) {
    await db.insert(coupons).values(coupon).onConflictDoNothing();
  }

  console.log("Database seeded successfully!");
}

seed()
  .catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
