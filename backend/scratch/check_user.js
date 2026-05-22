import { pool } from "../src/db.js";

async function checkUser() {
    const email = 'amineabouelouafaelidrissi@gmail.com';
    try {
        const res = await pool.query(`
            SELECT u.id, u.email, u.role, u.enterprise_id, u.is_active, u.password_hash, u.custom_role_id, e.status as enterprise_status 
            FROM users u 
            LEFT JOIN enterprises e ON u.enterprise_id = e.id 
            WHERE u.email = $1
        `, [email]);
        
        if (res.rows.length === 0) {
            console.log("USER_NOT_FOUND");
            // Let's see all users just in case
            const all = await pool.query("SELECT email FROM users LIMIT 10");
            console.log("Other users:", all.rows.map(r => r.email));
        } else {
            console.log("USER_FOUND:", JSON.stringify(res.rows[0], null, 2));
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

checkUser();
