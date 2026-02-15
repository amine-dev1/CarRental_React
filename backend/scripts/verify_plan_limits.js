import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkAllTestEnterprises() {
    try {
        console.log('='.repeat(60));
        console.log('VÉRIFICATION DES LIMITES DES PLANS');
        console.log('='.repeat(60));
        console.log('');
        
        // Get all test enterprises
        const enterprises = await pool.query(`
            SELECT id, name, plan, max_vehicles, max_users, status
            FROM enterprises
            WHERE name IN ('AutoRent Free', 'ProRent Solutions', 'EliteRent Enterprise')
            ORDER BY 
                CASE plan 
                    WHEN 'Free' THEN 1
                    WHEN 'Pro' THEN 2
                    WHEN 'Enterprise' THEN 3
                END
        `);
        
        for (const ent of enterprises.rows) {
            console.log(`\n${'='.repeat(60)}`);
            console.log(`📋 ${ent.name.toUpperCase()}`);
            console.log(`${'='.repeat(60)}`);
            console.log(`Plan: ${ent.plan}`);
            console.log(`Max véhicules: ${ent.max_vehicles}`);
            console.log(`Max utilisateurs: ${ent.max_users}`);
            console.log('');
            
            // Count vehicles
            const vehicles = await pool.query(`
                SELECT COUNT(*) as count
                FROM vehicles
                WHERE enterprise_id = $1
            `, [ent.id]);
            const vehicleCount = parseInt(vehicles.rows[0].count);
            
            console.log(`🚗 Véhicules: ${vehicleCount}/${ent.max_vehicles}`);
            if (vehicleCount <= ent.max_vehicles) {
                console.log(`   ✅ Limite respectée`);
            } else {
                console.log(`   ❌ DÉPASSEMENT! (${vehicleCount - ent.max_vehicles} de trop)`);
            }
            console.log('');
            
            // Get users
            const users = await pool.query(`
                SELECT email, role, full_name
                FROM users
                WHERE enterprise_id = $1
                ORDER BY role, created_at
            `, [ent.id]);
            
            const userCount = users.rows.length;
            const directors = users.rows.filter(u => u.role === 'director');
            const agents = users.rows.filter(u => u.role === 'agent');
            
            console.log(`👥 Utilisateurs: ${userCount}/${ent.max_users}`);
            console.log(`   Directeurs: ${directors.length}`);
            console.log(`   Agents: ${agents.length}`);
            
            if (userCount <= ent.max_users) {
                console.log(`   ✅ Limite respectée`);
            } else {
                console.log(`   ❌ DÉPASSEMENT! (${userCount - ent.max_users} de trop)`);
            }
            console.log('');
            
            users.rows.forEach((user, index) => {
                console.log(`   ${index + 1}. [${user.role.toUpperCase()}] ${user.email}`);
            });
            
            // Special validation for Free plan
            if (ent.plan === 'Free') {
                console.log('');
                console.log('📌 Validation spéciale Plan Free:');
                if (directors.length === 1 && agents.length === 0) {
                    console.log('   ✅ 1 directeur, 0 agents (CONFORME)');
                } else {
                    console.log(`   ❌ Non conforme: ${directors.length} directeur(s), ${agents.length} agent(s)`);
                }
            }
        }
        
        console.log('');
        console.log('='.repeat(60));
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkAllTestEnterprises();
