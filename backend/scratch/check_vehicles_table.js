import { pool } from '../src/db.js';

async function checkTable() {
    const client = await pool.connect();
    try {
        const res = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name='vehicles'`);
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        process.exit(0);
    }
}

checkTable();
