import { db } from "./db";
import { scratchCards, coupons } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  // Seed scratch cards with EcoBits between 10-50
  // Prizes from: Zepto, Bioq, Naava
  const scratchCardData = [
    {
      name: "Eco Home Starter",
      description: "Win discounts on Zepto eco-friendly cleaning products",
      category: "home_decor",
      ecoBitsCost: 10,
      isActive: true,
    },
    {
      name: "Bamboo Basics",
      description: "Win discounts on Bioq bamboo kitchen essentials",
      category: "home_decor",
      ecoBitsCost: 15,
      isActive: true,
    },
    {
      name: "Green Living Pack",
      description: "Win free reusable bags from Zepto",
      category: "personal_essentials",
      ecoBitsCost: 20,
      isActive: true,
    },
    {
      name: "Sustainable Self-Care",
      description: "Win discounts on Naava organic personal care",
      category: "personal_essentials",
      ecoBitsCost: 25,
      isActive: true,
    },
    {
      name: "Zero Waste Kit",
      description: "Win discounts on Zepto zero-waste essentials",
      category: "home_decor",
      ecoBitsCost: 30,
      isActive: true,
    },
    {
      name: "Organic Wellness",
      description: "Win discounts on Bioq organic groceries & wellness",
      category: "home_decor",
      ecoBitsCost: 35,
      isActive: true,
    },
    {
      name: "Natural Beauty Box",
      description: "Win discounts on Naava chemical-free skincare",
      category: "personal_essentials",
      ecoBitsCost: 40,
      isActive: true,
    },
    {
      name: "Premium Eco Bundle",
      description: "Win premium discounts across Zepto, Bioq & Naava",
      category: "home_decor",
      ecoBitsCost: 50,
      isActive: true,
    },
  ];

  for (const card of scratchCardData) {
    await db.insert(scratchCards).values(card).onConflictDoNothing();
  }

  // Seed coupons with new tier system
  const couponData = [
    // ===== GOLDEN TIER (60-150 EcoBits, 10-15% discount) =====
    // Okai
    {
      name: "Okai Eco Essentials",
      description: "10% off on sustainable daily essentials",
      tier: "golden",
      discountPercentage: 10,
      brandName: "Okai",
      category: "products",
      ecoBitsCost: 60,
      validUntil: new Date("2026-12-31"),
      eventType: null,
      isActive: true,
    },
    {
      name: "Okai Green Living",
      description: "15% off on eco-friendly home products",
      tier: "golden",
      discountPercentage: 15,
      brandName: "Okai",
      category: "products",
      ecoBitsCost: 90,
      validUntil: new Date("2026-12-31"),
      eventType: null,
      isActive: true,
    },
    
    // Vilvah
    {
      name: "Vilvah Natural Care",
      description: "10% off on natural skincare products",
      tier: "golden",
      discountPercentage: 10,
      brandName: "Vilvah",
      category: "products",
      ecoBitsCost: 65,
      validUntil: new Date("2026-12-31"),
      eventType: null,
      isActive: true,
    },
    {
      name: "Vilvah Organic Beauty",
      description: "15% off on organic beauty range",
      tier: "golden",
      discountPercentage: 15,
      brandName: "Vilvah",
      category: "products",
      ecoBitsCost: 95,
      validUntil: new Date("2026-12-31"),
      eventType: null,
      isActive: true,
    },
    
    // Blinkit
    {
      name: "Blinkit Eco Groceries",
      description: "10% off on organic groceries",
      tier: "golden",
      discountPercentage: 10,
      brandName: "Blinkit",
      category: "products",
      ecoBitsCost: 70,
      validUntil: new Date("2026-12-31"),
      eventType: null,
      isActive: true,
    },
    {
      name: "Blinkit Green Basket",
      description: "15% off on sustainable products",
      tier: "golden",
      discountPercentage: 15,
      brandName: "Blinkit",
      category: "products",
      ecoBitsCost: 100,
      validUntil: new Date("2026-12-31"),
      eventType: null,
      isActive: true,
    },
    
    // Slurrp Farm
    {
      name: "Slurrp Farm Healthy Snacks",
      description: "12% off on organic kids nutrition",
      tier: "golden",
      discountPercentage: 12,
      brandName: "Slurrp Farm",
      category: "products",
      ecoBitsCost: 80,
      validUntil: new Date("2026-12-31"),
      eventType: null,
      isActive: true,
    },
    {
      name: "Slurrp Farm Complete Range",
      description: "15% off on all natural food products",
      tier: "golden",
      discountPercentage: 15,
      brandName: "Slurrp Farm",
      category: "products",
      ecoBitsCost: 110,
      validUntil: new Date("2026-12-31"),
      eventType: null,
      isActive: true,
    },
    
    // Certification Courses
    {
      name: "Sustainability Basics Course",
      description: "10% off on beginner sustainability certification",
      tier: "golden",
      discountPercentage: 10,
      brandName: "EcoLearn",
      category: "courses",
      ecoBitsCost: 120,
      validUntil: new Date("2026-12-31"),
      eventType: null,
      isActive: true,
    },
    {
      name: "Green Business Certificate",
      description: "15% off on eco-business certification course",
      tier: "golden",
      discountPercentage: 15,
      brandName: "GreenEdu",
      category: "courses",
      ecoBitsCost: 150,
      validUntil: new Date("2026-12-31"),
      eventType: null,
      isActive: true,
    },
    
    // ===== PLATINUM TIER (160-250 EcoBits, 15-20% discount) =====
    // Amazon
    {
      name: "Amazon Eco Products",
      description: "15% off on eco-friendly products",
      tier: "platinum",
      discountPercentage: 15,
      brandName: "Amazon",
      category: "products",
      ecoBitsCost: 160,
      validUntil: new Date("2026-12-31"),
      eventType: null,
      isActive: true,
    },
    {
      name: "Amazon Green Living",
      description: "18% off on sustainable home essentials",
      tier: "platinum",
      discountPercentage: 18,
      brandName: "Amazon",
      category: "products",
      ecoBitsCost: 200,
      validUntil: new Date("2026-12-31"),
      eventType: null,
      isActive: true,
    },
    {
      name: "Amazon Premium Eco",
      description: "20% off on premium sustainable products",
      tier: "platinum",
      discountPercentage: 20,
      brandName: "Amazon",
      category: "products",
      ecoBitsCost: 240,
      validUntil: new Date("2026-12-31"),
      eventType: null,
      isActive: true,
    },
    
    // Nykaa
    {
      name: "Nykaa Natural Beauty",
      description: "15% off on natural beauty products",
      tier: "platinum",
      discountPercentage: 15,
      brandName: "Nykaa",
      category: "products",
      ecoBitsCost: 165,
      validUntil: new Date("2026-12-31"),
      eventType: null,
      isActive: true,
    },
    {
      name: "Nykaa Eco Skincare",
      description: "18% off on chemical-free skincare",
      tier: "platinum",
      discountPercentage: 18,
      brandName: "Nykaa",
      category: "products",
      ecoBitsCost: 205,
      validUntil: new Date("2026-12-31"),
      eventType: null,
      isActive: true,
    },
    {
      name: "Nykaa Organic Collection",
      description: "20% off on full organic beauty range",
      tier: "platinum",
      discountPercentage: 20,
      brandName: "Nykaa",
      category: "products",
      ecoBitsCost: 245,
      validUntil: new Date("2026-12-31"),
      eventType: null,
      isActive: true,
    },
    
    // Savana
    {
      name: "Savana Eco Fashion",
      description: "15% off on sustainable clothing",
      tier: "platinum",
      discountPercentage: 15,
      brandName: "Savana",
      category: "products",
      ecoBitsCost: 170,
      validUntil: new Date("2026-12-31"),
      eventType: null,
      isActive: true,
    },
    {
      name: "Savana Green Lifestyle",
      description: "18% off on eco-friendly lifestyle products",
      tier: "platinum",
      discountPercentage: 18,
      brandName: "Savana",
      category: "products",
      ecoBitsCost: 210,
      validUntil: new Date("2026-12-31"),
      eventType: null,
      isActive: true,
    },
    {
      name: "Savana Premium Collection",
      description: "20% off on premium sustainable fashion",
      tier: "platinum",
      discountPercentage: 20,
      brandName: "Savana",
      category: "products",
      ecoBitsCost: 250,
      validUntil: new Date("2026-12-31"),
      eventType: null,
      isActive: true,
    },
    
    // Souled Store
    {
      name: "Souled Store Eco Apparel",
      description: "15% off on sustainable streetwear",
      tier: "platinum",
      discountPercentage: 15,
      brandName: "Souled Store",
      category: "products",
      ecoBitsCost: 175,
      validUntil: new Date("2026-12-31"),
      eventType: null,
      isActive: true,
    },
    {
      name: "Souled Store Green Fashion",
      description: "18% off on eco-friendly clothing",
      tier: "platinum",
      discountPercentage: 18,
      brandName: "Souled Store",
      category: "products",
      ecoBitsCost: 215,
      validUntil: new Date("2026-12-31"),
      eventType: null,
      isActive: true,
    },
    {
      name: "Souled Store Complete Range",
      description: "20% off on all sustainable products",
      tier: "platinum",
      discountPercentage: 20,
      brandName: "Souled Store",
      category: "products",
      ecoBitsCost: 250,
      validUntil: new Date("2026-12-31"),
      eventType: null,
      isActive: true,
    },
    
    // ===== PLATINUM PREMIUM TIER (260-400+ EcoBits, 20-25% discount) =====
    // IKEA
    {
      name: "IKEA Sustainable Home",
      description: "20% off on eco-friendly furniture",
      tier: "platinum_premium",
      discountPercentage: 20,
      brandName: "IKEA",
      category: "products",
      ecoBitsCost: 260,
      validUntil: new Date("2026-12-31"),
      eventType: null,
      isActive: true,
    },
    {
      name: "IKEA Green Living Collection",
      description: "23% off on sustainable home essentials",
      tier: "platinum_premium",
      discountPercentage: 23,
      brandName: "IKEA",
      category: "products",
      ecoBitsCost: 330,
      validUntil: new Date("2026-12-31"),
      eventType: null,
      isActive: true,
    },
    {
      name: "IKEA Premium Eco Range",
      description: "25% off on premium sustainable furniture",
      tier: "platinum_premium",
      discountPercentage: 25,
      brandName: "IKEA",
      category: "products",
      ecoBitsCost: 400,
      validUntil: new Date("2026-12-31"),
      eventType: null,
      isActive: true,
    },
    
    // Forest Essentials
    {
      name: "Forest Essentials Natural Luxury",
      description: "20% off on ayurvedic beauty products",
      tier: "platinum_premium",
      discountPercentage: 20,
      brandName: "Forest Essentials",
      category: "products",
      ecoBitsCost: 270,
      validUntil: new Date("2026-12-31"),
      eventType: null,
      isActive: true,
    },
    {
      name: "Forest Essentials Premium Care",
      description: "23% off on luxury natural skincare",
      tier: "platinum_premium",
      discountPercentage: 23,
      brandName: "Forest Essentials",
      category: "products",
      ecoBitsCost: 340,
      validUntil: new Date("2026-12-31"),
      eventType: null,
      isActive: true,
    },
    {
      name: "Forest Essentials Complete Collection",
      description: "25% off on full ayurvedic range",
      tier: "platinum_premium",
      discountPercentage: 25,
      brandName: "Forest Essentials",
      category: "products",
      ecoBitsCost: 410,
      validUntil: new Date("2026-12-31"),
      eventType: null,
      isActive: true,
    },
    
    // Minimalist
    {
      name: "Minimalist Science-Based Skincare",
      description: "20% off on clean beauty products",
      tier: "platinum_premium",
      discountPercentage: 20,
      brandName: "Minimalist",
      category: "products",
      ecoBitsCost: 265,
      validUntil: new Date("2026-12-31"),
      eventType: null,
      isActive: true,
    },
    {
      name: "Minimalist Complete Routine",
      description: "23% off on full skincare range",
      tier: "platinum_premium",
      discountPercentage: 23,
      brandName: "Minimalist",
      category: "products",
      ecoBitsCost: 335,
      validUntil: new Date("2026-12-31"),
      eventType: null,
      isActive: true,
    },
    {
      name: "Minimalist Premium Collection",
      description: "25% off on advanced skincare solutions",
      tier: "platinum_premium",
      discountPercentage: 25,
      brandName: "Minimalist",
      category: "products",
      ecoBitsCost: 405,
      validUntil: new Date("2026-12-31"),
      eventType: null,
      isActive: true,
    },
    
    // ===== SPECIAL OCCASION COUPONS =====
    // World Warrior Drive (March 20-22)
    {
      name: "World Warrior Drive - IKEA Special",
      description: "25% off on sustainable furniture during World Warrior Drive",
      tier: "platinum_premium",
      discountPercentage: 25,
      brandName: "IKEA",
      category: "products",
      ecoBitsCost: 350,
      validUntil: new Date("2026-03-22"),
      eventType: "world_warrior_drive",
      isActive: true,
    },
    {
      name: "World Warrior Drive - Forest Essentials",
      description: "25% off on ayurvedic products during World Warrior Drive",
      tier: "platinum_premium",
      discountPercentage: 25,
      brandName: "Forest Essentials",
      category: "products",
      ecoBitsCost: 360,
      validUntil: new Date("2026-03-22"),
      eventType: "world_warrior_drive",
      isActive: true,
    },
    
    // Earth Impact Fest (June 3-5)
    {
      name: "Earth Impact Fest - IKEA Exclusive",
      description: "25% off on eco-furniture during Earth Impact Fest",
      tier: "platinum_premium",
      discountPercentage: 25,
      brandName: "IKEA",
      category: "products",
      ecoBitsCost: 340,
      validUntil: new Date("2026-06-05"),
      eventType: "earth_impact_fest",
      isActive: true,
    },
    {
      name: "Earth Impact Fest - Minimalist Special",
      description: "25% off on clean beauty during Earth Impact Fest",
      tier: "platinum_premium",
      discountPercentage: 25,
      brandName: "Minimalist",
      category: "products",
      ecoBitsCost: 345,
      validUntil: new Date("2026-06-05"),
      eventType: "earth_impact_fest",
      isActive: true,
    },
    
    // Green Diwali Fiesta (November 20-22)
    {
      name: "Green Diwali - IKEA Festive",
      description: "25% off on sustainable home decor for Green Diwali",
      tier: "platinum_premium",
      discountPercentage: 25,
      brandName: "IKEA",
      category: "products",
      ecoBitsCost: 355,
      validUntil: new Date("2026-11-22"),
      eventType: "green_diwali_fiesta",
      isActive: true,
    },
    {
      name: "Green Diwali - Forest Essentials Gift",
      description: "25% off on luxury gift sets for Green Diwali",
      tier: "platinum_premium",
      discountPercentage: 25,
      brandName: "Forest Essentials",
      category: "products",
      ecoBitsCost: 365,
      validUntil: new Date("2026-11-22"),
      eventType: "green_diwali_fiesta",
      isActive: true,
    },
  ];

  for (const coupon of couponData) {
    await db.insert(coupons).values(coupon).onConflictDoNothing();
  }

  console.log("✅ Database seeded successfully!");
  console.log(`   - ${scratchCardData.length} scratch cards (10-50 EcoBits)`);
  console.log(`     • Platforms: Zepto, Bioq, Naava`);
  console.log(`     • Prizes: 5-10% discounts, free items, free delivery`);
  console.log(`   - ${couponData.length} coupons across 3 tiers:`);
  console.log(`     • Golden (60-150 EB, 10-15%): Okai, Vilvah, Blinkit, Slurrp Farm, Courses`);
  console.log(`     • Platinum (160-250 EB, 15-20%): Amazon, Nykaa, Savana, Souled Store`);
  console.log(`     • Platinum Premium (260-400+ EB, 20-25%): IKEA, Forest Essentials, Minimalist`);
  console.log(`     • Special Events: World Warrior Drive, Earth Impact Fest, Green Diwali Fiesta`);
}

seed()
  .catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
