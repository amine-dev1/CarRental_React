import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function quickCheck() {
    try {
        // Check Free enterprise
        const result = await pool.query(`
            SELECT 
                e.name as enterprise_name,
                e.plan,
                e.max_vehicles,
                e.max_users,
                (SELECT COUNT(*) FROM vehicles v WHERE v.enterprise_id = e.id) as vehicle_count,
                (SELECT COUNT(*) FROM users u WHERE u.enterprise_id = e.id) as user_count,
                (SELECT COUNT(*) FROM users u WHERE u.enterprise_id = e.id AND u.role = 'director') as director_count,
                (SELECT COUNT(*) FROM users u WHERE u.enterprise_id = e.id AND u.role = 'agent') as agent_count
            FROM enterprises e
            WHERE e.name = 'AutoRent Free'
        `);
        
        if (result.rows.length > 0) {
            const data = result.rows[0];
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.log('No data found');
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

quickCheck();
