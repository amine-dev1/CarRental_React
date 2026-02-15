import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Moroccan names
const firstNames = [
    'Ahmed', 'Mohammed', 'Fatima', 'Aicha', 'Youssef', 'Hamza', 'Sara', 'Leila',
    'Omar', 'Karim', 'Nadia', 'Salma', 'Hassan', 'Rachid', 'Amina', 'Zahra',
    'Mehdi', 'Sofiane', 'Malika', 'Yasmine'
];

const lastNames = [
    'Alaoui', 'Benali', 'Idrissi', 'El Amrani', 'Jaber', 'Mansouri', 'Bouhali',
    'Chakir', 'Benjelloun', 'El Fassi', 'Lamrani', 'Zitouni', 'Berrada', 'Hilali',
    'Tazi', 'Naciri', 'Sefrioui', 'Skalli'
];

const cities = [
    { name: 'Casablanca', country: 'Maroc' },
    { name: 'Rabat', country: 'Maroc' },
    { name: 'Marrakech', country: 'Maroc' },
    { name: 'Fès', country: 'Maroc' },
    { name: 'Tanger', country: 'Maroc' },
    { name: 'Agadir', country: 'Maroc' }
];

const streets = [
    'Avenue Mohammed V', 'Rue Hassan II', 'Boulevard Zerktouni', 
    'Rue Ibn Battuta', 'Avenue des FAR', 'Boulevard Anfa',
    'Rue Al Qods', 'Avenue Moulay Youssef'
];

function generatePhone() {
    return `0${Math.floor(Math.random() * 2) + 6}${Math.floor(Math.random() * 90000000) + 10000000}`;
}

function generateEmail(firstName, lastName) {
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`;
}

function generateLicenseNumber() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letter = letters[Math.floor(Math.random() * letters.length)];
    const numbers = Math.floor(Math.random() * 900000) + 100000;
    return `${letter}${numbers}`;
}

function generateDateOfBirth() {
    // Generate ages between 25 and 65 years old
    const age = Math.floor(Math.random() * 40) + 25;
    const year = new Date().getFullYear() - age;
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function generateLicenseExpiry() {
    // License expires in 1-3 years
    const yearsToAdd = Math.floor(Math.random() * 3) + 1;
    const date = new Date();
    date.setFullYear(date.getFullYear() + yearsToAdd);
    return date.toISOString().split('T')[0];
}

function generateCustomer() {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const street = streets[Math.floor(Math.random() * streets.length)];
    const streetNumber = Math.floor(Math.random() * 200) + 1;
    
    return {
        full_name: `${firstName} ${lastName}`,
        phone: generatePhone(),
        email: generateEmail(firstName, lastName),
        driver_license_number: generateLicenseNumber(),
        license_expiry_date: generateLicenseExpiry(),
        address: `${streetNumber}, ${street}`,
        city: city.name,
        country: city.country,
        date_of_birth: generateDateOfBirth(),
        preferred_language: 'fr'
    };
}

async function seedCustomers() {
    try {
        console.log('👥 Adding test customers to enterprises...\n');
        
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
        const usedEmails = new Set();
        
        for (const enterprise of enterprises.rows) {
            console.log(`\n📋 ${enterprise.name} (${enterprise.plan})`);
            
            // Add 5-7 customers per enterprise
            const customersToAdd = Math.floor(Math.random() * 3) + 5; // 5-7 customers
            
            for (let i = 0; i < customersToAdd; i++) {
                let customer = generateCustomer();
                let attempts = 0;
                
                // Ensure unique email
                while (usedEmails.has(customer.email) && attempts < 10) {
                    customer = generateCustomer();
                    attempts++;
                }
                
                if (usedEmails.has(customer.email)) {
                    console.log(`   ⚠️  Skipped duplicate email`);
                    continue;
                }
                
                usedEmails.add(customer.email);
                
                try {
                    await pool.query(`
                        INSERT INTO customers (
                            enterprise_id, full_name, phone, email, 
                            driver_license_number, license_expiry_date, 
                            address, city, country, date_of_birth, preferred_language
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                    `, [
                        enterprise.id,
                        customer.full_name,
                        customer.phone,
                        customer.email,
                        customer.driver_license_number,
                        customer.license_expiry_date,
                        customer.address,
                        customer.city,
                        customer.country,
                        customer.date_of_birth,
                        customer.preferred_language
                    ]);
                    
                    console.log(`   ✅ ${customer.full_name} - ${customer.phone}`);
                    totalInserted++;
                } catch (error) {
                    console.log(`   ❌ Failed: ${error.message}`);
                }
            }
        }
        
        console.log(`\n\n🎉 Successfully added ${totalInserted} customers!\n`);
        
        // Summary
        console.log('📊 Final Summary:\n');
        const summary = await pool.query(`
            SELECT 
                e.name,
                e.plan,
                COUNT(c.id) as customer_count
            FROM enterprises e
            LEFT JOIN customers c ON c.enterprise_id = e.id
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
            console.log(`${emoji} ${row.name}: ${row.customer_count} clients`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

seedCustomers();
