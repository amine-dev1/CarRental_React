import { query } from './src/db.js';
import bcrypt from 'bcrypt';

async function reset() {
    const email = 'elidrissiamine74@gmail.com';
    const password = 'Password2026!';
    const hash = await bcrypt.hash(password, 10);

    try {
        await query('UPDATE users SET password_hash = $1 WHERE email = $2', [hash, email]);
        console.log('-----------------------------------');
        console.log('IDENTIFIANTS DE CONNEXION MIS À JOUR');
        console.log(`Email    : ${email}`);
        console.log(`Password : ${password}`);
        console.log('-----------------------------------');
    } catch (error) {
        console.error('Erreur lors du reset :', error);
    }
}

reset();
