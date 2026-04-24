import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkPendingCols() {
    try {
        const cols = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'pending_registrations'`);
        console.table(cols.rows);
        
        const data = await pool.query(`SELECT * FROM pending_registrations LIMIT 5`);
        console.table(data.rows);
    } catch (err) {
        console.error(err.message);
    } finally {
        await pool.end();
    }
}

checkPendingCols();
