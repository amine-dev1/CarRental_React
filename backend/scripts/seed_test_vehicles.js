import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Vehicle templates
const vehicles = [
    { name: 'Renault Clio 2020', model: 'Clio', year: 2020, color: 'Blanc' },
    { name: 'Peugeot 208 2021', model: '208', year: 2021, color: 'Noir' },
    { name: 'Dacia Duster 2019', model: 'Duster', year: 2019, color: 'Gris' },
    { name: 'Toyota Corolla 2022', model: 'Corolla', year: 2022, color: 'Argent' },
    { name: 'Volkswagen Golf 2021', model: 'Golf', year: 2021, color: 'Bleu' },
    { name: 'Hyundai Tucson 2020', model: 'Tucson', year: 2020, color: 'Rouge' },
    { name: 'Mercedes GLA 2023', model: 'GLA', year: 2023, color: 'Noir' },
    { name: 'BMW Serie 3 2022', model: 'Serie 3', year: 2022, color: 'Blanc' },
];

async function generateUniquePlate() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let attempts = 0;
    
    while (attempts < 100) {
        const numbers = Math.floor(Math.random() * 90000) + 10000;
        const letter1 = letters[Math.floor(Math.random() * letters.length)];
        const letter2 = letters[Math.floor(Math.random() * letters.length)];
        const plate = `${numbers}-${letter1}-${letter2}`;
        
        const check = await pool.query('SELECT id FROM vehicles WHERE plate = $1', [plate]);
        if (check.rows.length === 0) {
            return plate;
        }
        attempts++;
    }
    
    const timestamp = Date.now().toString().slice(-5);
    const letter = letters[Math.floor(Math.random() * letters.length)];
    return `${timestamp}-X-${letter}`;
}

async function seedVehicles() {
    try {
        console.log('🚗 Adding test vehicles to enterprises...\n');
        
        // Get test enterprises
        const enterprises = await pool.query(`
            SELECT id, name, plan
            FROM enterprises
            WHERE name IN ('AutoRent Free', 'ProRent Solutions', 'EliteRent Enterprise')
            ORDER BY 
                CASE plan 
                    WHEN 'Free' THEN 1
                    WHEN 'Pro' THEN 2
                    WHEN 'Enterprise' THEN 3
                END
        `);
        
        if (enterprises.rows.length === 0) {
            console.log('❌ Test enterprises not found!');
            return;
        }
        
        console.log(`✅ Found ${enterprises.rows.length} test enterprises\n`);
        
        let totalInserted = 0;
        
        for (const enterprise of enterprises.rows) {
            console.log(`\n📋 ${enterprise.name} (${enterprise.plan})`);
            
            // Get daily price based on plan
            let basePriceCents = 25000; // 250 MAD for Free
            if (enterprise.plan === 'Enterprise') {
                basePriceCents = 50000; // 500 MAD
            } else if (enterprise.plan === 'Pro') {
                basePriceCents = 35000; // 350 MAD
            }
            
           // Add 5 vehicles
            for (let i = 0; i < 5; i++) {
                const vehicle = vehicles[i % vehicles.length];
                const plate = await generateUniquePlate();
                const priceCents = basePriceCents + Math.floor(Math.random() * 15000); // Add variation
                const mileage = 10000 + Math.floor(Math.random() * 90000);
                const status = i < 4 ? 'available' : 'maintenance';
                
                try {
                    await pool.query(`
                        INSERT INTO vehicles (
                            enterprise_id, name, plate, daily_price_cents, 
                            status, mileage, year, model, color
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    `, [
                        enterprise.id,
                        vehicle.name,
                        plate,
                        priceCents,
                        status,
                        mileage,
                        vehicle.year,
                        vehicle.model,
                        vehicle.color
                    ]);
                    
                    console.log(`   ✅ ${vehicle.name} - ${plate} (${(priceCents / 100).toFixed(0)} MAD/j)`);
                    totalInserted++;
                } catch (error) {
                    console.log(`   ❌ Failed: ${error.message}`);
                }
            }
        }
        
        console.log(`\n\n🎉 Successfully added ${totalInserted} vehicles!\n`);
        
        // Summary
        console.log('📊 Final Summary:\n');
        const summary = await pool.query(`
            SELECT 
                e.name,
                e.plan,
                COUNT(v.id) as vehicle_count
            FROM enterprises e
            LEFT JOIN vehicles v ON v.enterprise_id = e.id
            WHERE e.name IN ('AutoRent Free', 'ProRent Solutions', 'EliteRent Enterprise')
            GROUP BY e.id, e.name, e.plan
            ORDER BY 
                CASE e.plan 
                    WHEN 'Enterprise' THEN 1
                    WHEN 'Pro' THEN 2
                    WHEN 'Free' THEN 3
                END
        `);
        
        summary.rows.forEach((row) => {
            const emoji = row.plan === 'Enterprise' ? '👑' : row.plan === 'Pro' ? '⭐' : '🆓';
            console.log(`${emoji} ${row.name}: ${row.vehicle_count} véhicules`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

seedVehicles();
