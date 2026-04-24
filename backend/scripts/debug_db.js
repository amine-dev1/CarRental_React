import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function debugDatabase() {
    try {
        console.log('--- Tables in database ---');
        const tables = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
        console.table(tables.rows);
        
        console.log('\n--- Count by Role ---');
        const roles = await pool.query(`SELECT role, COUNT(*) FROM users GROUP BY role`);
        console.table(roles.rows);

        console.log('\n--- Recent Enterprises ---');
        const ents = await pool.query(`SELECT id, name, plan, created_at FROM enterprises ORDER BY created_at DESC LIMIT 5`);
        console.table(ents.rows);

    } catch (err) {
        console.error(err.message);
    } finally {
        await pool.end();
    }
}

debugDatabase();
