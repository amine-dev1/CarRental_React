import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function listAllUsers() {
    try {
        console.log('📋 Liste complète des utilisateurs enregistrés dans la base :\n');
        
        const result = await pool.query(`
            SELECT u.email, u.role, u.full_name, e.name as enterprise_name
            FROM users u
            LEFT JOIN enterprises e ON u.enterprise_id = e.id
            ORDER BY u.role, u.email ASC
        `);
        
        console.table(result.rows);
    } catch (err) {
        console.error(err.message);
    } finally {
        await pool.end();
    }
}

listAllUsers();
