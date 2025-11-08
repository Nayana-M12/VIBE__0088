import 'dotenv/config';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting migration from points to EcoBits...\n');
    
    // Rename columns
    const migrations = [
      'ALTER TABLE users RENAME COLUMN points TO eco_bits',
      'ALTER TABLE energy_records RENAME COLUMN points_earned TO eco_bits_earned',
      'ALTER TABLE water_records RENAME COLUMN points_earned TO eco_bits_earned',
      'ALTER TABLE eco_routes RENAME COLUMN points_earned TO eco_bits_earned',
      'ALTER TABLE posts RENAME COLUMN points_earned TO eco_bits_earned',
      'ALTER TABLE scratch_cards RENAME COLUMN points_cost TO eco_bits_cost',
      'ALTER TABLE coupons RENAME COLUMN points_cost TO eco_bits_cost',
    ];
    
    for (const sql of migrations) {
      try {
        await client.query(sql);
        console.log(`✅ ${sql}`);
      } catch (error) {
        if (error.message.includes('does not exist')) {
          console.log(`⏭️  Skipped (already migrated): ${sql}`);
        } else {
          throw error;
        }
      }
    }
    
    console.log('\n✅ Migration complete!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
