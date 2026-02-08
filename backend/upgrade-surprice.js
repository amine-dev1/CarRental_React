import { query } from './src/db.js';

async function update() {
    try {
        // 1. Update plan
        await query('UPDATE enterprises SET plan = $1 WHERE name ILIKE $2', ['Pro', '%SURPRICE CAR%']);
        console.log('✅ Plan updated to Pro for SURPRICE CAR');

        // 2. Allow null rental_id
        await query('ALTER TABLE payments ALTER COLUMN rental_id DROP NOT NULL');
        console.log('✅ Modified payments table: rental_id is now optional');

        // 3. Find enterprise ID
        const ent = await query('SELECT id FROM enterprises WHERE name ILIKE $1', ['%SURPRICE CAR%']);
        if (ent.rows.length === 0) {
            console.log('❌ Enterprise not found');
            return;
        }
        const entId = ent.rows[0].id;

        // 4. Record payment (200.00 = 20000 cents)
        await query('INSERT INTO payments (enterprise_id, amount_cents, method) VALUES ($1, $2, $3)', [entId, 20000, 'transfer']);
        console.log('✅ Recorded payment of 200 Euro/Dollar');

    } catch (err) {
        console.error('❌ Error during database update:', err);
    } finally {
        process.exit();
    }
}

update();
