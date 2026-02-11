import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function addReclamationsTable() {
  const client = await pool.connect();
  try {
    console.log("🔄 Creating reclamations table...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS reclamations (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        enterprise_id uuid NOT NULL REFERENCES enterprises(id) ON DELETE CASCADE,
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        subject text NOT NULL,
        message text NOT NULL,
        attachment_url text,
        status text NOT NULL DEFAULT 'pending',
        priority text NOT NULL DEFAULT 'medium',
        response text,
        responded_at timestamptz,
        resolved_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    console.log("✅ Reclamations table created");

    console.log("🔄 Creating indexes...");
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_reclamations_enterprise ON reclamations(enterprise_id);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_reclamations_user ON reclamations(user_id);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_reclamations_status ON reclamations(status);
    `);

    console.log("✅ Indexes created successfully");
    console.log("✅ Migration completed successfully!");

  } catch (err) {
    console.error("❌ Error creating reclamations table:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

addReclamationsTable();
