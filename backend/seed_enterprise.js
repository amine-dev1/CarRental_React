import * as dotenv from 'dotenv';
dotenv.config();

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const query = (text, params) => pool.query(text, params);

async function seed() {
    try {
        const email = 'success_test_01@mailinator.com';
        console.log(`Buscando usuario: ${email}`);
        
        const userRes = await query(`SELECT id, enterprise_id FROM users WHERE email = $1`, [email]);
        if (userRes.rows.length === 0) {
            console.error('User not found!');
            process.exit(1);
        }
        
        const enterprise_id = userRes.rows[0].enterprise_id;
        const customer_id = userRes.rows[0].id;
        console.log(`Enterprise ID trouvé: ${enterprise_id}`);

        // --- 1. INSERT CUSTOMERS ---
        console.log("Insertion des clients...");
        const customers = [
            { id: '11111111-1111-1111-1111-111111111111', full_name: 'Amine El Idrissi', email: 'amine@example.com', phone: '0600000001', city: 'Rabat', dob: '1990-05-15', license: 'A1234567' },
            { id: '22222222-2222-2222-2222-222222222222', full_name: 'Sara Bennis', email: 'sara@example.com', phone: '0600000002', city: 'Casablanca', dob: '1995-10-22', license: 'B9876543' },
            { id: '33333333-3333-3333-3333-333333333333', full_name: 'Karim Tazi', email: 'karim@example.com', phone: '0600000003', city: 'Marrakech', dob: '1988-03-08', license: 'C4567890' },
            { id: '44444444-4444-4444-4444-444444444444', full_name: 'Meryem Alaoui', email: 'meryem@example.com', phone: '0600000004', city: 'Tanger', dob: '1992-12-01', license: 'D2345678' },
            { id: '55555555-5555-5555-5555-555555555555', full_name: 'Youssef Filali', email: 'youssef@example.com', phone: '0600000005', city: 'Agadir', dob: '1985-07-19', license: 'E3456789' }
        ];

        for (const c of customers) {
            await query(
                `INSERT INTO customers (id, enterprise_id, full_name, email, phone, city, date_of_birth, driver_license_number) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 ON CONFLICT (id) DO NOTHING`,
                [c.id, enterprise_id, c.full_name, c.email, c.phone, c.city, c.dob, c.license]
            );
        }

        // --- 2. INSERT VEHICLES ---
        console.log("Insertion des véhicules...");
        const vehicles = [
            { id: '66666666-6666-6666-6666-666666666660', name: 'Volkswagen Tiguan', plate: '12345-A-1', price: 65000, status: 'available' },     // Will be rented (Active)
            { id: '66666666-6666-6666-6666-666666666661', name: 'Peugeot 3008', plate: '23456-B-2', price: 55000, status: 'available' },      // Will be rented (Active)
            { id: '66666666-6666-6666-6666-666666666662', name: 'Renault Clio 5', plate: '34567-C-3', price: 25000, status: 'available' },    // Available
            { id: '66666666-6666-6666-6666-666666666663', name: 'Dacia Duster', plate: '45678-D-4', price: 30000, status: 'available' },      // Available
            { id: '66666666-6666-6666-6666-666666666664', name: 'Ford Focus', plate: '56789-E-5', price: 35000, status: 'available' },        // Available
            { id: '66666666-6666-6666-6666-666666666665', name: 'Hyundai Tucson', plate: '67890-F-6', price: 45000, status: 'maintenance' },  // Maintenance
            { id: '66666666-6666-6666-6666-666666666666', name: 'Kia Sportage', plate: '78901-G-7', price: 45000, status: 'maintenance' },    // Maintenance
            { id: '66666666-6666-6666-6666-666666666667', name: 'Toyota Yaris', plate: '89012-H-8', price: 25000, status: 'available' }       // Will be rented (Completed)
        ];

        for (const v of vehicles) {
            await query(
                `INSERT INTO vehicles (id, enterprise_id, name, plate, daily_price_cents, status) 
                 VALUES ($1, $2, $3, $4, $5, $6)
                 ON CONFLICT (id) DO NOTHING`,
                [v.id, enterprise_id, v.name, v.plate, v.price, v.status]
            );
        }

        // --- 3. INSERT RENTALS ---
        console.log("Insertion des locations...");
        
        const today = new Date();
        const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
        const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);
        const lastWeek = new Date(today); lastWeek.setDate(today.getDate() - 7);
        const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
        
        const f = d => d.toISOString().split('T')[0];

        const rentals = [
            // Active 1 -> Tiguan by Amine
            { id: '99999999-9999-9999-9999-999999999990', cust: customers[0].id, veh: vehicles[0].id, start: f(today), end: f(nextWeek), total: 65000 * 7, status: 'active' },
            // Active 2 -> 3008 by Sara
            { id: '99999999-9999-9999-9999-999999999991', cust: customers[1].id, veh: vehicles[1].id, start: f(today), end: f(tomorrow), total: 55000 * 1, status: 'active' },
            // Completed 1 -> Yaris by Karim (last week)
            { id: '99999999-9999-9999-9999-999999999992', cust: customers[2].id, veh: vehicles[7].id, start: f(lastWeek), end: f(yesterday), total: 25000 * 6, status: 'completed' },
            // Cancelled 1 -> Duster by Meryem
            { id: '99999999-9999-9999-9999-999999999993', cust: customers[3].id, veh: vehicles[3].id, start: f(tomorrow), end: f(nextWeek), total: 30000 * 6, status: 'cancelled' }
        ];

        for (const r of rentals) {
            await query(
                `INSERT INTO rentals (id, enterprise_id, customer_id, vehicle_id, start_date, end_date, total_cents, status) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 ON CONFLICT (id) DO NOTHING`,
                [r.id, enterprise_id, r.cust, r.veh, r.start, r.end, r.total, r.status]
            );
            
            // Generate a payment for completed/active
            if (r.status !== 'cancelled') {
                try {
                    await query(
                        `INSERT INTO payments (enterprise_id, rental_id, amount_cents, method, status) 
                        VALUES ($1, $2, $3, $4, $5)`,
                        [enterprise_id, r.id, r.total, 'card', 'succeeded']
                    );
                } catch (pe) {
                    console.log("Payment could not be inserted for rental", r.id, ":", pe.message);
                }
            }
        }

        console.log("SEEDED SUCCESSFULLY!");
        process.exit(0);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

seed();
