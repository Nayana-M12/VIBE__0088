import 'dotenv/config';
import { Pool } from '@neondatabase/serverless';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function clearAndSeed() {
  const client = await pool.connect();
  
  try {
    console.log('🗑️  Clearing old rewards data...\n');
    
    // Delete old data
    await client.query('DELETE FROM user_coupons');
    await client.query('DELETE FROM user_scratch_cards');
    await client.query('DELETE FROM coupons');
    await client.query('DELETE FROM scratch_cards');
    
    console.log('✅ Old data cleared!\n');
    console.log('🌱 Seeding new rewards...\n');
    
    client.release();
    await pool.end();
    
    // Run the seed script
    const { stdout, stderr } = await execAsync('npx tsx server/seed.ts');
    console.log(stdout);
    if (stderr) console.error(stderr);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

clearAndSeed();
