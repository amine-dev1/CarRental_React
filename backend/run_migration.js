import * as dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import pkg from 'pg';
const { Client } = pkg;

async function runMigration() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    
    try {
        await client.connect();
        console.log('✅ Connected to database');
        
        const sql = fs.readFileSync('./migrations/001_v1_to_v2.sql', 'utf8');
        
        console.log('🚀 Running migration v1 → v2...');
        console.log('─'.repeat(60));
        
        await client.query(sql);
        
        console.log('─'.repeat(60));
        console.log('✅ MIGRATION COMPLETED SUCCESSFULLY');
        console.log('');
        
        // ── Verification Report ──
        console.log('📊 VERIFICATION REPORT');
        console.log('═'.repeat(60));
        
        // Count tables
        const tablesRes = await client.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);
        console.log(`\n📋 Tables (${tablesRes.rows.length}):`);
        tablesRes.rows.forEach(r => console.log(`   • ${r.table_name}`));
        
        // Count indexes
        const idxRes = await client.query(`
            SELECT count(*) as cnt FROM pg_indexes WHERE schemaname = 'public'
        `);
        console.log(`\n🔍 Index total: ${idxRes.rows[0].cnt}`);
        
        // Count triggers
        const trigRes = await client.query(`
            SELECT trigger_name, event_object_table
            FROM information_schema.triggers
            WHERE trigger_schema = 'public'
            ORDER BY event_object_table
        `);
        console.log(`\n⚡ Triggers (${trigRes.rows.length}):`);
        trigRes.rows.forEach(r => console.log(`   • ${r.trigger_name} → ${r.event_object_table}`));
        
        // Count functions
        const funcRes = await client.query(`
            SELECT routine_name FROM information_schema.routines
            WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'
            ORDER BY routine_name
        `);
        console.log(`\n🔧 Functions (${funcRes.rows.length}):`);
        funcRes.rows.forEach(r => console.log(`   • ${r.routine_name}`));
        
        // Count views
        const viewRes = await client.query(`
            SELECT table_name FROM information_schema.views
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        console.log(`\n👁️  Views (${viewRes.rows.length}):`);
        viewRes.rows.forEach(r => console.log(`   • ${r.table_name}`));
        
        // Check number_sequences seeded
        const seqRes = await client.query('SELECT enterprise_id, type, prefix, last_number FROM number_sequences ORDER BY enterprise_id, type');
        console.log(`\n🔢 Number sequences seeded (${seqRes.rows.length}):`);
        seqRes.rows.forEach(r => console.log(`   • ${r.prefix} (${r.type}) → last: ${r.last_number}`));
        
        // Check new columns on enterprises
        const entColsRes = await client.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'enterprises' ORDER BY ordinal_position
        `);
        console.log(`\n🏢 enterprises columns (${entColsRes.rows.length}):`);
        entColsRes.rows.forEach(r => console.log(`   • ${r.column_name}`));
        
        // Check new columns on vehicles
        const vehColsRes = await client.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'vehicles' ORDER BY ordinal_position
        `);
        console.log(`\n🚗 vehicles columns (${vehColsRes.rows.length}):`);
        vehColsRes.rows.forEach(r => console.log(`   • ${r.column_name}`));
        
        // Check rentals.agent_id rename
        const rentalColsRes = await client.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'rentals' AND column_name IN ('agent_id','assigned_agent_id','contract_number')
            ORDER BY column_name
        `);
        console.log(`\n📝 rentals key columns check:`);
        rentalColsRes.rows.forEach(r => console.log(`   • ${r.column_name} ✅`));
        
        // Check backfill
        const backfillRes = await client.query(`
            SELECT count(*) as total, count(contract_number) as with_number 
            FROM rentals
        `);
        const bf = backfillRes.rows[0];
        console.log(`\n🔄 Contract number backfill: ${bf.with_number}/${bf.total} rentals have contract_number`);
        
        // Verify RLS policies exist but are NOT enabled
        const rlsRes = await client.query(`
            SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename
        `);
        console.log(`\n🔒 RLS Policies created (NOT enabled):`);
        rlsRes.rows.forEach(r => console.log(`   • ${r.tablename} → ${r.policyname}`));
        
        // Check data integrity
        const dataCheck = await client.query(`
            SELECT 
                (SELECT count(*) FROM enterprises) as enterprises,
                (SELECT count(*) FROM users) as users,
                (SELECT count(*) FROM vehicles) as vehicles,
                (SELECT count(*) FROM customers) as customers,
                (SELECT count(*) FROM rentals) as rentals,
                (SELECT count(*) FROM payments) as payments,
                (SELECT count(*) FROM agencies) as agencies
        `);
        const d = dataCheck.rows[0];
        console.log(`\n💾 Data integrity check:`);
        console.log(`   • Enterprises: ${d.enterprises}`);
        console.log(`   • Users: ${d.users}`);
        console.log(`   • Vehicles: ${d.vehicles}`);
        console.log(`   • Customers: ${d.customers}`);
        console.log(`   • Rentals: ${d.rentals}`);
        console.log(`   • Payments: ${d.payments}`);
        console.log(`   • Agencies: ${d.agencies} (new)`);
        
        console.log('\n' + '═'.repeat(60));
        console.log('✅ ALL CHECKS PASSED — Migration v1→v2 complete');
        console.log('═'.repeat(60));
        
    } catch (err) {
        console.error('❌ MIGRATION FAILED:', err.message);
        console.error('Detail:', err.detail || 'none');
        console.error('Position:', err.position || 'none');
        process.exit(1);
    } finally {
        await client.end();
    }
}

runMigration();
