import { query, pool } from '../src/db.js';

async function fixPhoneConstraint() {
    const client = await pool.connect();
    try {
        // 1. Check existing constraints
        const constraints = await client.query(`
            SELECT conname, contype 
            FROM pg_constraint 
            WHERE conrelid = 'users'::regclass AND conname LIKE '%phone%'
        `);
        console.log('Current phone constraints:', constraints.rows);

        // 2. Check existing indexes
        const indexes = await client.query(`
            SELECT indexname, indexdef 
            FROM pg_indexes 
            WHERE tablename = 'users' AND indexdef LIKE '%phone%'
        `);
        console.log('Current phone indexes:', indexes.rows);

        // 3. Drop the unique constraint on phone
        if (constraints.rows.length > 0) {
            for (const c of constraints.rows) {
                console.log(`Dropping constraint: ${c.conname}`);
                await client.query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS "${c.conname}"`);
            }
        }

        // 4. Drop any unique index on phone
        if (indexes.rows.length > 0) {
            for (const idx of indexes.rows) {
                if (idx.indexdef.includes('UNIQUE')) {
                    console.log(`Dropping index: ${idx.indexname}`);
                    await client.query(`DROP INDEX IF EXISTS "${idx.indexname}"`);
                }
            }
        }

        // 5. Normalize empty strings to NULL
        const updated = await client.query(`UPDATE users SET phone = NULL WHERE phone = '' OR phone IS NOT NULL AND TRIM(phone) = ''`);
        console.log(`Normalized ${updated.rowCount} empty phone values to NULL`);

        // 6. Create a partial unique index (unique only when phone is NOT NULL)
        await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS users_phone_unique ON users(phone) WHERE phone IS NOT NULL`);
        console.log('Created partial unique index on phone (excludes NULLs)');

        console.log('\n✅ Phone constraint fixed successfully!');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        process.exit(0);
    }
}

fixPhoneConstraint();
