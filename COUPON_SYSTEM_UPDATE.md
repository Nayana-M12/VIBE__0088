# Rewards System Update - Coupons & Scratch Cards

## Overview
Updated the complete rewards system with:
- Three-tier discount coupon structure
- Enhanced scratch cards with Zepto, Bioq, and Naava prizes

## Coupon Tiers

### 🥇 Golden Tier (60-150 EcoBits, 10-15% discount)
**Platforms:**
- **Okai** - Sustainable daily essentials
- **Vilvah** - Natural skincare and organic beauty
- **Blinkit** - Organic groceries and sustainable products
- **Slurrp Farm** - Organic kids nutrition and natural food
- **Certification Courses** - Sustainability and green business courses for students

**EcoBits Range:** 60-150
**Discount Range:** 10-15%

### 🥈 Platinum Tier (160-250 EcoBits, 15-20% discount)
**Platforms:**
- **Amazon** - Eco-friendly products and sustainable home essentials
- **Nykaa** - Natural beauty and chemical-free skincare
- **Savana** - Sustainable fashion and eco-friendly lifestyle
- **Souled Store** - Sustainable streetwear and eco-friendly clothing

**EcoBits Range:** 160-250
**Discount Range:** 15-20%

### 💎 Platinum Premium Tier (260-400+ EcoBits, 20-25% discount)
**Platforms:**
- **IKEA** - Sustainable furniture and eco-friendly home decor
- **Forest Essentials** - Ayurvedic beauty and luxury natural skincare
- **Minimalist** - Science-based clean beauty and advanced skincare

**EcoBits Range:** 260-400+
**Discount Range:** 20-25%

## Special Occasion Coupons (Platinum Premium Only)

### 🌍 World Warrior Drive
**Dates:** March 20-22
**Brands:** IKEA, Forest Essentials
**Discount:** 25%
**EcoBits:** 350-360

### 🌱 Earth Impact Fest
**Dates:** June 3-5
**Brands:** IKEA, Minimalist
**Discount:** 25%
**EcoBits:** 340-345

### 🪔 Green Diwali Fiesta
**Dates:** November 20-22
**Brands:** IKEA, Forest Essentials
**Discount:** 25%
**EcoBits:** 355-365

## Scratch Cards

### Platforms
- **Zepto** - Eco-friendly products, sustainable home essentials, organic groceries
- **Bioq** - Natural products, organic groceries, wellness range, bamboo products
- **Naava** - Organic range, chemical-free products, natural skincare

### Prize Types
- **Discounts:** 5%, 7%, 8%, 10% off on various eco-friendly products
- **Free Items:** Reusable shopping bags, organic snacks, sample packs
- **Free Services:** Free delivery on eco-products

### EcoBits Cost
- **Range:** 10-50 EcoBits
- **Total Cards:** 8 different scratch cards

## Database Changes

### Schema Updates
- Added `tier` field to coupons table: `"golden"`, `"platinum"`, `"platinum_premium"`
- Updated `eventType` field to support new events:
  - `world_warrior_drive`
  - `earth_impact_fest`
  - `green_diwali_fiesta`

### Seed Data
- **Total Coupons:** 45+
- **Golden Tier:** 10 coupons
- **Platinum Tier:** 12 coupons
- **Platinum Premium:** 9 regular + 6 special occasion coupons

## Backend Updates

### Route Handler Changes
- Updated `checkSeasonalAvailability()` function with new event dates
- Updated availability messages for special occasion coupons
- Enhanced error messages with specific event date ranges

## To Apply Changes

Run these commands in the GreenIntelligence-1 directory:

```bash
# Push schema changes to database
npm run db:push

# Seed the database with new coupons
npm run seed
# OR
node clear-and-seed.js
```

## User Experience

Users can now:
1. Browse coupons organized by tier (Golden, Platinum, Platinum Premium)
2. See clear EcoBits costs and discount percentages
3. Access special occasion coupons during specific date ranges
4. Redeem coupons for their favorite eco-friendly brands
5. Get certification courses at discounted rates (Golden tier)

## Files Modified
- `shared/schema.ts` - Added tier field to coupons table
- `server/seed.ts` - Complete coupon data overhaul with 45+ coupons
- `server/routes.ts` - Updated seasonal availability logic
