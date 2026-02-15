import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkFreePlanLimits() {
    try {
        console.log('🔍 Vérification des limites du plan Free...\n');
        
        // Get Free plan enterprise
        const enterprise = await pool.query(`
            SELECT id, name, plan, max_vehicles, max_users, status
            FROM enterprises
            WHERE name = 'AutoRent Free'
        `);
        
        if (enterprise.rows.length === 0) {
            console.log('❌ Entreprise Free non trouvée!');
            return;
        }
        
        const ent = enterprise.rows[0];
        console.log('📋 Entreprise:', ent.name);
        console.log('   Plan:', ent.plan);
        console.log('   Max véhicules:', ent.max_vehicles);
        console.log('   Max utilisateurs:', ent.max_users);
        console.log('   Statut:', ent.status);
        console.log('');
        
        // Check actual vehicles count
        const vehicles = await pool.query(`
            SELECT COUNT(*) as count
            FROM vehicles
            WHERE enterprise_id = $1
        `, [ent.id]);
        
        const vehicleCount = parseInt(vehicles.rows[0].count);
        console.log('🚗 Véhicules actuels:', vehicleCount);
        console.log('   Limite:', ent.max_vehicles);
        console.log('   Statut:', vehicleCount <= ent.max_vehicles ? '✅ OK' : '❌ DÉPASSEMENT!');
        console.log('');
        
        // Check actual users count
        const users = await pool.query(`
            SELECT id, email, role, full_name
            FROM users
            WHERE enterprise_id = $1
            ORDER BY role, created_at
        `, [ent.id]);
        
        const userCount = users.rows.length;
        console.log('👥 Utilisateurs actuels:', userCount);
        console.log('   Limite:', ent.max_users);
        console.log('   Statut:', userCount <= ent.max_users ? '✅ OK' : '❌ DÉPASSEMENT!');
        console.log('');
        
        // Show users details
        console.log('📝 Détails des utilisateurs:');
        users.rows.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.role.toUpperCase()}: ${user.email}${user.full_name ? ` (${user.full_name})` : ''}`);
        });
        console.log('');
        
        // Check if there are agents
        const agents = users.rows.filter(u => u.role === 'agent');
        const directors = users.rows.filter(u => u.role === 'director');
        
        console.log('🎯 Résumé:');
        console.log(`   Directeurs: ${directors.length}`);
        console.log(`   Agents: ${agents.length}`);
        console.log('');
        
        // Validation
        console.log('✅ Validation du plan Free:');
        if (vehicleCount <= ent.max_vehicles) {
            console.log('   ✅ Limite de véhicules respectée');
        } else {
            console.log('   ❌ Limite de véhicules DÉPASSÉE!');
        }
        
        if (userCount <= ent.max_users) {
            console.log('   ✅ Limite d\'utilisateurs respectée');
        } else {
            console.log('   ❌ Limite d\'utilisateurs DÉPASSÉE!');
        }
        
        if (directors.length === 1 && agents.length === 0) {
            console.log('   ✅ 1 seul directeur, aucun agent (conforme Free plan)');
        } else {
            console.log(`   ⚠️  Configuration: ${directors.length} directeur(s), ${agents.length} agent(s)`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

checkFreePlanLimits();
