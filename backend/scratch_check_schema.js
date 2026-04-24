import { query } from "./src/db.js";

async function checkSchema() {
    try {
        const res = await query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'enterprises'
        `);
        console.log("Columns:", res.rows);

        const constraints = await query(`
            SELECT conname, pg_get_constraintdef(c.oid)
            FROM pg_constraint c
            JOIN pg_namespace n ON n.oid = c.connamespace
            WHERE n.nspname = 'public' AND conname LIKE '%enterprises%'
        `);
        console.log("Constraints:", constraints.rows);
    } catch (e) {
        console.error("Schema check failed:", e);
    }
    process.exit(0);
}

checkSchema();
