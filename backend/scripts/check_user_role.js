import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function findUser() {
    try {
        const email = 'elidrissiamine74@gmail.com';
        const result = await pool.query(`SELECT email, role, full_name FROM users WHERE email = $1`, [email]);
        console.table(result.rows);
    } catch (err) {
        console.error(err.message);
    } finally {
        await pool.end();
    }
}

findUser();
