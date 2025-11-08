import 'dotenv/config';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkDatabase() {
  try {
    console.log('Connecting to database...\n');
    
    // Check users
    const usersResult = await pool.query('SELECT * FROM users ORDER BY created_at DESC LIMIT 10');
    console.log('=== USERS ===');
    console.log(`Total users: ${usersResult.rows.length}`);
    usersResult.rows.forEach(user => {
      console.log(`- ${user.first_name} ${user.last_name} (${user.email})`);
      console.log(`  Points: ${user.points}, Carbon Saved: ${user.total_carbon_saved}kg, Water Saved: ${user.total_water_saved}L`);
    });
    
    // Check posts
    const postsResult = await pool.query('SELECT COUNT(*) as count FROM posts');
    console.log(`\n=== POSTS ===`);
    console.log(`Total posts: ${postsResult.rows[0].count}`);
    
    // Check energy records
    const energyResult = await pool.query('SELECT COUNT(*) as count FROM energy_records');
    console.log(`\n=== ENERGY RECORDS ===`);
    console.log(`Total records: ${energyResult.rows[0].count}`);
    
    // Check water records
    const waterResult = await pool.query('SELECT COUNT(*) as count FROM water_records');
    console.log(`\n=== WATER RECORDS ===`);
    console.log(`Total records: ${waterResult.rows[0].count}`);
    
    // Check eco routes
    const routesResult = await pool.query('SELECT COUNT(*) as count FROM eco_routes');
    console.log(`\n=== ECO ROUTES ===`);
    console.log(`Total routes: ${routesResult.rows[0].count}`);
    
    // Check scratch cards
    const scratchResult = await pool.query('SELECT COUNT(*) as count FROM scratch_cards');
    console.log(`\n=== SCRATCH CARDS ===`);
    console.log(`Total cards: ${scratchResult.rows[0].count}`);
    
    // Check coupons
    const couponsResult = await pool.query('SELECT COUNT(*) as count FROM coupons');
    console.log(`\n=== COUPONS ===`);
    console.log(`Total coupons: ${couponsResult.rows[0].count}`);
    
    console.log('\n✅ Database check complete!');
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await pool.end();
  }
}

checkDatabase();
