import { pool } from '../src/db.js';

async function checkEnts() {
    const client = await pool.connect();
    try {
        const res = await client.query(`SELECT id, name, gateway_customer_id FROM enterprises ORDER BY created_at DESC LIMIT 10`);
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        process.exit(0);
    }
}

checkEnts();
