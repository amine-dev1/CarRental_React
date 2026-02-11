import { query } from "./db.js";

(async () => {
    try {
        const email = "elidrissiamine74@gmail.com";
        const photoPath = "/amine.jpeg"; // Relative to frontend public/ or served URL
        
        console.log(`Updating profile photo for ${email}...`);
        
        const res = await query(
            `UPDATE users SET profile_photo = $1 WHERE email = $2 RETURNING id, email, full_name`,
            [photoPath, email]
        );

        if (res.rows.length > 0) {
            console.log("✅ Success: Profile photo updated for:", res.rows[0]);
        } else {
            console.log("⚠️ Warning: No user found with that email.");
        }
        
        process.exit(0);
    } catch (err) {
        console.error("❌ Failed to update profile photo:", err);
        process.exit(1);
    }
})();
