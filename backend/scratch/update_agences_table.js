import { pool } from '../src/db.js';

async function updateTable() {
    const client = await pool.connect();
    try {
        const res = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name='agences'`);
        const columns = res.rows.map(r => r.column_name);
        console.log("Columns:", columns);
        
        if (!columns.includes('country')) {
            console.log("Adding country column...");
            await client.query(`ALTER TABLE agences ADD COLUMN country text;`);
            console.log("Column added.");
        } else {
            console.log("Column 'country' already exists.");
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        process.exit(0);
    }
}

updateTable();
