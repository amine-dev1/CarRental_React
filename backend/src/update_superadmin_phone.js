import { query } from "./db.js";

(async () => {
    try {
        const phone = "+212770698980";
        console.log(`Updating superadmin phone to ${phone}...`);

        // Update the first superadmin found (or all superadmins if multiple, usually just one)
        const result = await query(`
            UPDATE users 
            SET phone = $1 
            WHERE role = 'superadmin'
        `, [phone]);

        if (result.rowCount > 0) {
            console.log(`✅ Successfully updated ${result.rowCount} superadmin(s) with phone number ${phone}.`);
        } else {
            console.log("⚠️ No superadmin found to update.");
        }

        process.exit(0);
    } catch (err) {
        console.error("❌ Error updating superadmin phone:", err);
        process.exit(1);
    }
})();
