import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function listDirectors() {
    try {
        console.log('🔍 Extraction des comptes Director de la base de données...\n');
        
        const result = await pool.query(`
            SELECT u.id, u.email, u.role, u.full_name, e.name as enterprise_name, e.plan
            FROM users u
            LEFT JOIN enterprises e ON u.enterprise_id = e.id
            WHERE u.role = 'director'
            ORDER BY e.name ASC
        `);
        
        if (result.rows.length === 0) {
            console.log('❌ Aucun compte Director trouvé dans la base.');
        } else {
            console.log(`✅ ${result.rows.length} comptes Director trouvés :\n`);
            result.rows.forEach(row => {
               console.log(`- Email: ${row.email}`);
               console.log(`  Nom: ${row.full_name || 'N/A'}`);
               console.log(`  Entreprise: ${row.enterprise_name || 'N/A'}`);
               console.log(`  Plan: ${row.plan || 'N/A'}`);
               console.log('-------------------');
            });
        }
    } catch (err) {
        console.error('❌ Erreur lors de la lecture de la base :', err.message);
    } finally {
        await pool.end();
    }
}

listDirectors();
