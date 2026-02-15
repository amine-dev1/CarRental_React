import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function updateSuperadminName() {
  const client = await pool.connect();
  try {
    console.log("🔄 Mise à jour du nom du superadmin...");

    const result = await client.query(`
      UPDATE users
      SET full_name = 'Amine Abouelouafa El Idrissi'
      WHERE role = 'superadmin'
      RETURNING id, email, full_name;
    `);

    if (result.rowCount === 0) {
      console.log("⚠️ Aucune modification effectuée. Aucun superadmin trouvé.");
    } else {
      console.log("✅ Nom mis à jour avec succès pour les utilisateurs suivants :");
      result.rows.forEach(user => {
        console.log(`- ${user.email} : ${user.full_name}`);
      });
    }
  } catch (err) {
    console.error("❌ Erreur lors de la mise à jour :", err);
  } finally {
    client.release();
    await pool.end();
  }
}

updateSuperadminName();
