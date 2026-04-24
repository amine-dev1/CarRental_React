import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkPending() {
    try {
        console.log('--- Pending Registrations ---');
        const pending = await pool.query(`SELECT email, status, created_at FROM pending_registrations`);
        console.table(pending.rows);
    } catch (err) {
        console.error(err.message);
    } finally {
        await pool.end();
    }
}

checkPending();
