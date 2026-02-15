import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkReclamationsTable() {
  const client = await pool.connect();
  try {
    // Check if table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'reclamations'
      );
    `);
    
    console.log("✅ Table exists:", tableCheck.rows[0].exists);
    
    // Get columns
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'reclamations'
      ORDER BY ordinal_position;
    `);
    
    console.log("\n📋 Table columns:");
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULLABLE'}`);
    });

  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

checkReclamationsTable();
