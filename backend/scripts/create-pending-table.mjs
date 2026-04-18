import { query } from '../src/db.js';

try {
    await query(`
        CREATE TABLE IF NOT EXISTS pending_registrations (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            email text UNIQUE NOT NULL,
            data jsonb NOT NULL,
            created_at timestamptz NOT NULL DEFAULT now()
        )
    `);
    console.log('✅ Table pending_registrations created successfully');
} catch (e) {
    console.error('❌ Error:', e.message);
} finally {
    process.exit(0);
}
