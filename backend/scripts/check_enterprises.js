import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkEnterprises() {
    try {
        console.log('🔍 Checking enterprises in database...\n');
        
        const result = await pool.query(`
            SELECT 
                e.id,
                e.name,
                e.address,
                e.plan,
                e.status,
                e.created_at,
                (SELECT COUNT(*) FROM users WHERE enterprise_id = e.id AND role = 'director') as directors_count,
                (SELECT COUNT(*) FROM users WHERE enterprise_id = e.id AND role = 'agent') as agents_count,
                (SELECT COUNT(*) FROM vehicles WHERE enterprise_id = e.id) as vehicles_count
            FROM enterprises e
            ORDER BY e.created_at DESC
        `);
        
        if (result.rows.length === 0) {
            console.log('❌ No enterprises found in database\n');
        } else {
            console.log(`✅ Found ${result.rows.length} enterprise(s):\n`);
            
            result.rows.forEach((ent, idx) => {
                console.log(`${idx + 1}. ${ent.name}`);
                console.log(`   📍 Address: ${ent.address || 'N/A'}`);
                console.log(`   📋 Plan: ${ent.plan}`);
                console.log(`   🔄 Status: ${ent.status}`);
                console.log(`   👥 Directors: ${ent.directors_count}`);
                console.log(`   👨‍💼 Agents: ${ent.agents_count}`);
                console.log(`   🚗 Vehicles: ${ent.vehicles_count}`);
                console.log(`   📅 Created: ${ent.created_at}`);
                console.log('');
            });
        }
        
        // Also check users to see which director emails exist
        console.log('👤 Checking director accounts...\n');
        const users = await pool.query(`
            SELECT u.email, u.role, e.name as enterprise_name, e.plan
            FROM users u
            JOIN enterprises e ON u.enterprise_id = e.id
            WHERE u.role = 'director'
            ORDER BY e.plan DESC
        `);
        
        if (users.rows.length > 0) {
            users.rows.forEach((user) => {
                console.log(`📧 ${user.email}`);
                console.log(`   Enterprise: ${user.enterprise_name}`);
                console.log(`   Plan: ${user.plan}`);
                console.log('');
            });
        } else {
            console.log('❌ No director accounts found\n');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkEnterprises();
