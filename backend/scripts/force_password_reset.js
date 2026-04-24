import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function resetPassword() {
    const email = 'success_test_01@mailinator.com';
    const newPassword = 'elidrissi2002';
    
    try {
        console.log(`🚀 Réinitialisation du mot de passe pour : ${email}...`);
        
        const hash = await bcrypt.hash(newPassword, 10);
        
        const result = await pool.query(
            'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id',
            [hash, email]
        );
        
        if (result.rowCount > 0) {
            console.log('✅ Mot de passe réinitialisé avec succès !');
            console.log(`Compte : ${email}`);
            console.log(`Nouveau mot de passe : ${newPassword}`);
        } else {
            console.log('❌ Utilisateur non trouvé.');
        }
    } catch (err) {
        console.error('❌ Erreur :', err.message);
    } finally {
        await pool.end();
    }
}

resetPassword();
