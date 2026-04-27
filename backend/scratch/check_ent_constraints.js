import { pool } from '../src/db.js';

async function checkConstraints() {
    const client = await pool.connect();
    try {
        const constraints = await client.query(`
            SELECT conname, contype 
            FROM pg_constraint 
            WHERE conrelid = 'enterprises'::regclass AND conname LIKE '%customer_id%'
        `);
        console.log('Constraints:', constraints.rows);

        const indexes = await client.query(`
            SELECT indexname, indexdef 
            FROM pg_indexes 
            WHERE tablename = 'enterprises' AND indexdef LIKE '%customer_id%'
        `);
        console.log('Indexes:', indexes.rows);

        // Also check if there's a unique constraint on gateway_customer_id
        const constraints2 = await client.query(`
            SELECT conname, contype 
            FROM pg_constraint 
            WHERE conrelid = 'enterprises'::regclass AND conname LIKE '%gateway%'
        `);
        console.log('Constraints Gateway:', constraints2.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        process.exit(0);
    }
}

checkConstraints();
