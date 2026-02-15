import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkSuperadmin() {
    try {
        console.log('👤 Checking superadmin account...\n');
        
        const result = await pool.query(`
            SELECT id, email, role, full_name
            FROM users
            WHERE role = 'superadmin'
        `);
        
        if (result.rows.length === 0) {
            console.log('❌ No superadmin account found\n');
        } else {
            console.log(`✅ Found ${result.rows.length} superadmin account(s):\n`);
            result.rows.forEach((user) => {
                console.log(`📧 Email: ${user.email}`);
                console.log(`👤 Name: ${user.full_name || 'N/A'}`);
                console.log(`🎖️  Role: ${user.role}`);
                console.log('');
            });
        }
        
        // Now let's check the test enterprises specifically
        console.log('\n📋 Test Enterprises Status:\n');
        
        const testEnterprises = await pool.query(`
            SELECT 
                e.id,
                e.name,
                e.address,
                e.plan,
                e.status,
                (SELECT email FROM users WHERE enterprise_id = e.id AND role = 'director' LIMIT 1) as director_email,
                (SELECT COUNT(*) FROM users WHERE enterprise_id = e.id AND role = 'director') as directors_count,
                (SELECT COUNT(*) FROM users WHERE enterprise_id = e.id AND role = 'agent') as agents_count,
                (SELECT COUNT(*) FROM vehicles WHERE enterprise_id = e.id) as vehicles_count
            FROM enterprises e
            WHERE 
                e.name IN ('AutoRent Free', 'ProRent Solutions', 'EliteRent Enterprise')
                OR EXISTS (
                    SELECT 1 FROM users u 
                    WHERE u.enterprise_id = e.id 
                    AND u.email IN ('free@director.com', 'pro@director.com', 'enterprise@director.com')
                )
            ORDER BY 
                CASE e.plan 
                    WHEN 'Enterprise' THEN 1
                    WHEN 'Pro' THEN 2
                    WHEN 'Free' THEN 3
                END
        `);
        
        if (testEnterprises.rows.length === 0) {
            console.log('❌ Test enterprises not found!\n');
            console.log('You need to create them or they may have different names.\n');
        } else {
            testEnterprises.rows.forEach((ent) => {
                const planEmoji = ent.plan === 'Enterprise' ? '👑' : ent.plan === 'Pro' ? '⭐' : '🆓';
                console.log(`${planEmoji} ${ent.name} (${ent.plan})`);
                console.log(`   📧 Director: ${ent.director_email || 'N/A'}`);
                console.log(`   🔄 Status: ${ent.status}`);
                console.log(`   📍 Address: ${ent.address || 'N/A'}`);
                console.log(`   👥 Directors: ${ent.directors_count}`);
                console.log(`   👨‍💼 Agents: ${ent.agents_count}`);
                console.log(`   🚗 Vehicles: ${ent.vehicles_count}`);
                console.log('');
            });
        }
        
        // Check if API query would work
        console.log('\n🔍 Simulating API query response:\n');
        
        const apiSimulation = await pool.query(`
            SELECT 
                e.*,
                (SELECT COUNT(*) FROM users WHERE enterprise_id = e.id AND role = 'director') as directors_count,
                (SELECT COUNT(*) FROM users WHERE enterprise_id = e.id AND role = 'agent') as agents_count,
                (SELECT COUNT(*) FROM vehicles WHERE enterprise_id = e.id) as vehicles_count,
                (SELECT COUNT(*) FROM customers WHERE enterprise_id = e.id) as customers_count,
                (SELECT COUNT(*) FROM rentals WHERE enterprise_id = e.id) as rentals_count,
                (SELECT COALESCE(SUM(amount_cents), 0) FROM payments WHERE enterprise_id = e.id) as revenue_cents
            FROM enterprises e
            ORDER BY e.created_at DESC
        `);
        
        console.log(`✅ API would return ${apiSimulation.rows.length} enterprises\n`);
        console.log('Sample of what frontend should see:');
        apiSimulation.rows.slice(0, 5).forEach((ent, idx) => {
            console.log(`\n${idx + 1}. ${ent.name}`);
            console.log(`   Plan: ${ent.plan}, Status: ${ent.status}`);
            console.log(`   Directors: ${ent.directors_count}, Agents: ${ent.agents_count}, Vehicles: ${ent.vehicles_count}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkSuperadmin();
