-- Migrate from points to EcoBits
-- Run this SQL in your Neon database console

-- Rename columns in users table
ALTER TABLE users RENAME COLUMN points TO eco_bits;

-- Rename columns in energy_records table
ALTER TABLE energy_records RENAME COLUMN points_earned TO eco_bits_earned;

-- Rename columns in water_records table
ALTER TABLE water_records RENAME COLUMN points_earned TO eco_bits_earned;

-- Rename columns in eco_routes table
ALTER TABLE eco_routes RENAME COLUMN points_earned TO eco_bits_earned;

-- Rename columns in posts table
ALTER TABLE posts RENAME COLUMN points_earned TO eco_bits_earned;

-- Rename columns in scratch_cards table
ALTER TABLE scratch_cards RENAME COLUMN points_cost TO eco_bits_cost;

-- Rename columns in coupons table
ALTER TABLE coupons RENAME COLUMN points_cost TO eco_bits_cost;

-- Verify changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name LIKE '%eco%';
