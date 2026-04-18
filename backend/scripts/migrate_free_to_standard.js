import { pool } from '../src/db.js';

async function migrateFreeToStandard() {
    const client = await pool.connect();

    try {
        console.log('🔄 Début de la migration Free → Standard...\n');

        // Count enterprises with Free plan
        const countBefore = await client.query(
            "SELECT COUNT(*) FROM enterprises WHERE plan = 'Free'"
        );
        console.log(`📊 Entreprises avec plan "Free" trouvées: ${countBefore.rows[0].count}`);

        // Update Free to Standard
        await client.query("UPDATE enterprises SET plan = 'Standard' WHERE plan = 'Free'");

        // Verify update
        const countAfter = await client.query(
            "SELECT COUNT(*) FROM enterprises WHERE plan = 'Standard'"
        );
        console.log(`✅ Entreprises avec plan "Standard" après migration: ${countAfter.rows[0].count}`);

        // Display all plans
        const allPlans = await client.query(
            "SELECT plan, COUNT(*) as count FROM enterprises GROUP BY plan ORDER BY plan"
        );
        console.log('\n📋 Répartition des plans après migration:');
        allPlans.rows.forEach(row => {
            console.log(`   - ${row.plan}: ${row.count} entreprise(s)`);
        });

        console.log('\n✨ Migration terminée avec succès!');

    } catch (error) {
        console.error('❌ Erreur lors de la migration:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Run migration
migrateFreeToStandard()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
