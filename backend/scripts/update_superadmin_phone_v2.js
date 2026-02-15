import { query } from "../src/db.js";

(async () => {
    try {
        const phone = "+212770698980";
        const email = "elidrissiamine74@gmail.com";

        console.log(`Updating superadmin (${email}) phone to ${phone}...`);

        const result = await query(`
            UPDATE users 
            SET phone = $1 
            WHERE email = $2 AND role = 'superadmin'
        `, [phone, email]);

        if (result.rowCount > 0) {
            console.log(`✅ Successfully updated superadmin ${email} with phone number ${phone}.`);
        } else {
            console.log(`⚠️ Superadmin with email ${email} not found.`);
            // Fallback: update ANY superadmin if the specific one isn't found?
            // But we saw the list, so we know it exists.
        }

        process.exit(0);
    } catch (err) {
        console.error("❌ Error updating superadmin phone:", err);
        process.exit(1);
    }
})();
