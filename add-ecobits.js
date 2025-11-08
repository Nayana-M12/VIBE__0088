import 'dotenv/config';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function addEcoBits() {
  const client = await pool.connect();
  
  try {
    // Give the user 500 EcoBits
    await client.query(`
      UPDATE users 
      SET eco_bits = 500 
      WHERE email = 'nayanashashankk12@gmail.com'
    `);
    
    console.log('✅ Added 500 EcoBits to your account!');
    
    // Show current balance
    const result = await client.query(`
      SELECT email, eco_bits 
      FROM users 
      WHERE email = 'nayanashashankk12@gmail.com'
    `);
    
    console.log('\nYour balance:', result.rows[0]);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

addEcoBits();
