import { query } from './src/db.js';
import bcrypt from 'bcrypt';

async function resetDirector() {
    const email = 'director@demo.com';
    const password = 'password123';
    const hash = await bcrypt.hash(password, 10);

    try {
        const result = await query('UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING *', [hash, email]);
        if (result.rows.length > 0) {
            console.log(`✅ Updated password for ${email} to ${password}`);
        } else {
            console.log(`❌ User ${email} not found`);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

resetDirector();
