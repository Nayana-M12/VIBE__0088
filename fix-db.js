import 'dotenv/config';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fixDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Fixing database columns...\n');
    
    // Check if columns exist
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name IN ('points', 'eco_bits')
    `;
    
    const result = await client.query(checkQuery);
    const columns = result.rows.map(r => r.column_name);
    
    console.log('Current columns:', columns);
    
    if (columns.includes('points') && !columns.includes('eco_bits')) {
      console.log('\n✅ Renaming points to eco_bits...');
      
      await client.query('ALTER TABLE users RENAME COLUMN points TO eco_bits');
      await client.query('ALTER TABLE energy_records RENAME COLUMN points_earned TO eco_bits_earned');
      await client.query('ALTER TABLE water_records RENAME COLUMN points_earned TO eco_bits_earned');
      await client.query('ALTER TABLE eco_routes RENAME COLUMN points_earned TO eco_bits_earned');
      await client.query('ALTER TABLE posts RENAME COLUMN points_earned TO eco_bits_earned');
      await client.query('ALTER TABLE scratch_cards RENAME COLUMN points_cost TO eco_bits_cost');
      await client.query('ALTER TABLE coupons RENAME COLUMN points_cost TO eco_bits_cost');
      
      console.log('✅ All columns renamed successfully!');
    } else if (columns.includes('eco_bits')) {
      console.log('✅ Database already migrated!');
    } else {
      console.log('❌ Unexpected state. Please check database manually.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

fixDatabase();
