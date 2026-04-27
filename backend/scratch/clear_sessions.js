import { pool } from '../src/db.js';

async function clearData() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const resPending = await client.query('DELETE FROM pending_registrations');
        console.log(`Deleted ${resPending.rowCount} pending registrations.`);

        // Get enterprise IDs of all test accounts
        const users = await client.query(`SELECT enterprise_id FROM users WHERE role != 'superadmin' AND enterprise_id IS NOT NULL`);
        const enterpriseIds = users.rows.map(u => u.enterprise_id);

        if (enterpriseIds.length > 0) {
            // Delete child records first
            await client.query(`DELETE FROM rentals WHERE enterprise_id = ANY($1)`, [enterpriseIds]);
            await client.query(`DELETE FROM reservations WHERE enterprise_id = ANY($1)`, [enterpriseIds]);
            await client.query(`DELETE FROM reclamations WHERE enterprise_id = ANY($1)`, [enterpriseIds]);
            await client.query(`DELETE FROM customers WHERE enterprise_id = ANY($1)`, [enterpriseIds]);
            await client.query(`DELETE FROM vehicles WHERE enterprise_id = ANY($1)`, [enterpriseIds]);
            // Add other tables if necessary

            const resUsers = await client.query(`DELETE FROM users WHERE enterprise_id = ANY($1)`, [enterpriseIds]);
            console.log(`Deleted ${resUsers.rowCount} test users.`);

            const resEnts = await client.query(`DELETE FROM enterprises WHERE id = ANY($1)`, [enterpriseIds]);
            console.log(`Deleted ${resEnts.rowCount} test enterprises.`);
        }

        // Clean any orphans
        const orphanEnts = await client.query(`
            SELECT id FROM enterprises e 
            WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.enterprise_id = e.id)
        `);
        
        if (orphanEnts.rows.length > 0) {
            const orphanIds = orphanEnts.rows.map(e => e.id);
            await client.query(`DELETE FROM rentals WHERE enterprise_id = ANY($1)`, [orphanIds]);
            await client.query(`DELETE FROM reservations WHERE enterprise_id = ANY($1)`, [orphanIds]);
            await client.query(`DELETE FROM reclamations WHERE enterprise_id = ANY($1)`, [orphanIds]);
            await client.query(`DELETE FROM customers WHERE enterprise_id = ANY($1)`, [orphanIds]);
            await client.query(`DELETE FROM vehicles WHERE enterprise_id = ANY($1)`, [orphanIds]);
            
            const resOrphans = await client.query(`DELETE FROM enterprises WHERE id = ANY($1)`, [orphanIds]);
            console.log(`Deleted ${resOrphans.rowCount} orphan enterprises.`);
        }

        await client.query('COMMIT');
        console.log('✅ All test sessions and accounts cleared successfully.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error:', err);
    } finally {
        client.release();
        process.exit(0);
    }
}

clearData();
