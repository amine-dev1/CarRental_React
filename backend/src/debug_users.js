import { query } from "./db.js";

(async () => {
    try {
        const phone = "+212770698980";
        console.log(`Checking DB for phone ${phone}...`);

        const resPhone = await query(`SELECT id, email, role, phone FROM users WHERE phone = $1`, [phone]);
        if (resPhone.rows.length > 0) {
            console.log("User found with this phone:", resPhone.rows[0]);
        } else {
            console.log("No user found with this phone.");
        }

        const resSuper = await query(`SELECT id, email, role, phone FROM users WHERE role = 'superadmin'`);
        console.log("Superadmins:", resSuper.rows);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
