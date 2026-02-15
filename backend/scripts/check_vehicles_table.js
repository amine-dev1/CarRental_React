import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkVehiclesTable() {
    try {
        console.log('🔍 Checking vehicles table structure...\n');
        
        const result = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'vehicles'
            ORDER BY ordinal_position
        `);
        
        console.log('Columns in vehicles table:\n');
        result.rows.forEach((col) => {
            console.log(`  ${col.column_name.padEnd(20)} ${col.data_type.padEnd(20)} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
        
        // Check existing vehicles count
        const count = await pool.query('SELECT COUNT(*) FROM vehicles');
        console.log(`\n📊 Total vehicles in database: ${count.rows[0].count}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkVehiclesTable();
