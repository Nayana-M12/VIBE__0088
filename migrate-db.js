import 'dotenv/config';
import pkg from 'pg';
const { Client } = pkg;

async function migrate() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  
  try {
    await client.connect();
    console.log('🔄 Starting migration from EcoBits to EcoBits...\n');
    
    const migrations = [
      { sql: 'ALTER TABLE users RENAME COLUMN points TO eco_bits', table: 'users' },
      { sql: 'ALTER TABLE energy_records RENAME COLUMN points_earned TO eco_bits_earned', table: 'energy_records' },
      { sql: 'ALTER TABLE water_records RENAME COLUMN points_earned TO eco_bits_earned', table: 'water_records' },
      { sql: 'ALTER TABLE eco_routes RENAME COLUMN points_earned TO eco_bits_earned', table: 'eco_routes' },
      { sql: 'ALTER TABLE posts RENAME COLUMN points_earned TO eco_bits_earned', table: 'posts' },
      { sql: 'ALTER TABLE scratch_cards RENAME COLUMN points_cost TO eco_bits_cost', table: 'scratch_cards' },
      { sql: 'ALTER TABLE coupons RENAME COLUMN points_cost TO eco_bits_cost', table: 'coupons' },
    ];
    
    for (const { sql, table } of migrations) {
      try {
        await client.query(sql);
        console.log(`✅ ${table}: Renamed column`);
      } catch (error) {
        if (error.message.includes('does not exist')) {
          console.log(`⏭️  ${table}: Already migrated`);
        } else {
          console.error(`❌ ${table}: ${error.message}`);
        }
      }
    }
    
    console.log('\n✅ Migration complete!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await client.end();
  }
}

migrate();
