import { pool } from "../src/db.js";

async function seed() {
    console.log("Starting seed process...");
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // 1. Get the first enterprise
        const entRes = await client.query("SELECT id FROM enterprises LIMIT 1");
        if (entRes.rows.length === 0) {
            console.error("No enterprise found. Please create one first.");
            return;
        }
        const enterpriseId = entRes.rows[0].id;
        console.log(`Using Enterprise ID: ${enterpriseId}`);

        // 2. Create Agencies
        const agencies = [
            { name: "Agence Marrakech - Guéliz", city: "Marrakech", address: "Avenue Mohammed V", code: "RAK01" },
            { name: "Agence Casablanca - Port", city: "Casablanca", address: "Boulevard des Almohades", code: "CAS01" }
        ];
        const agencyIds = [];
        for (const a of agencies) {
            let res = await client.query("SELECT id FROM agencies WHERE enterprise_id = $1 AND code = $2", [enterpriseId, a.code]);
            if (res.rows.length === 0) {
                res = await client.query(
                    `INSERT INTO agencies (enterprise_id, name, city, address, code, is_main, status) 
                     VALUES ($1, $2, $3, $4, $5, $6, 'active') RETURNING id`,
                    [enterpriseId, a.name, a.city, a.address, a.code, a.code === "RAK01"]
                );
            }
            agencyIds.push(res.rows[0].id);
        }
        console.log(`Created/Found ${agencyIds.length} agencies.`);

        // 3. Create Vehicle Categories
        const categories = [
            { name: "Économique", type: "city", description: "Petites voitures pour la ville", price: 25000, deposit: 300000 },
            { name: "SUV & 4x4", type: "suv", description: "Idéal pour les longs trajets", price: 60000, deposit: 700000 },
            { name: "Luxe", type: "luxury", description: "Confort et prestige", price: 150000, deposit: 1500000 }
        ];
        const categoryIds = [];
        for (const c of categories) {
            let res = await client.query("SELECT id FROM vehicle_categories WHERE enterprise_id = $1 AND name = $2", [enterpriseId, c.name]);
            if (res.rows.length === 0) {
                res = await client.query(
                    `INSERT INTO vehicle_categories (enterprise_id, name, type, description, base_daily_price_cents, deposit_cents) 
                     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
                    [enterpriseId, c.name, c.type, c.description, c.price, c.deposit]
                );
            }
            categoryIds.push(res.rows[0].id);
        }
        console.log(`Created/Found ${categoryIds.length} categories.`);

        // 4. Create Vehicles
        const vehiclesList = [
            { name: "Dacia Logan", brand: "Dacia", model: "Logan", plate: "12345-A-26", price: 25000, catIdx: 0, status: "available", mileage: 15000 },
            { name: "Renault Clio 5", brand: "Renault", model: "Clio 5", plate: "67890-B-26", price: 30000, catIdx: 0, status: "rented", mileage: 8000 },
            { name: "Dacia Duster", brand: "Dacia", model: "Duster", plate: "11223-C-26", price: 55000, catIdx: 1, status: "available", mileage: 25000 },
            { name: "Range Rover Evoque", brand: "Land Rover", model: "Evoque", plate: "44556-D-26", price: 150000, catIdx: 2, status: "available", mileage: 5000 },
            { name: "Toyota Prado", brand: "Toyota", model: "Prado", plate: "77889-E-26", price: 90000, catIdx: 1, status: "maintenance", mileage: 45000 }
        ];
        const vehicleIds = [];
        for (const v of vehiclesList) {
            let res = await client.query("SELECT id FROM vehicles WHERE enterprise_id = $1 AND plate = $2", [enterpriseId, v.plate]);
            if (res.rows.length === 0) {
                res = await client.query(
                    `INSERT INTO vehicles (enterprise_id, name, brand, model, plate, daily_price_cents, category_id, status, mileage_km, agency_id, transmission, fuel_type) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'manuelle', 'diesel') RETURNING id`,
                    [enterpriseId, v.name, v.brand, v.model, v.plate, v.price, categoryIds[v.catIdx], v.status, v.mileage, agencyIds[0]]
                );
            }
            vehicleIds.push(res.rows[0].id);
        }
        console.log(`Created/Found ${vehicleIds.length} vehicles.`);

        // 5. Create Customers
        const customersList = [
            { name: "Yassine El Idrissi", email: "yassine@example.com", phone: "+212 600-112233", license: "B123456" },
            { name: "Sara Mansouri", email: "sara@example.com", phone: "+212 600-445566", license: "C789012" },
            { name: "Mehdi Alami", email: "mehdi@example.com", phone: "+212 600-778899", license: "D345678" }
        ];
        const customerIds = [];
        for (const c of customersList) {
            let res = await client.query("SELECT id FROM customers WHERE enterprise_id = $1 AND email = $2", [enterpriseId, c.email]);
            if (res.rows.length === 0) {
                res = await client.query(
                    `INSERT INTO customers (enterprise_id, full_name, email, phone, driver_license_number, country, city) 
                     VALUES ($1, $2, $3, $4, $5, 'Maroc', 'Marrakech') RETURNING id`,
                    [enterpriseId, c.name, c.email, c.phone, c.license]
                );
            }
            customerIds.push(res.rows[0].id);
        }
        console.log(`Created/Found ${customerIds.length} customers.`);

        // 6. Create Rentals
        const rentals = [
            { 
                customerIdx: 0, vehicleIdx: 1, status: "active", 
                start: "2026-04-20", end: "2026-04-30", total: 300000, 
                contract_num: "CTR-2026-00001", status_contract: "signed" 
            },
            { 
                customerIdx: 1, vehicleIdx: 2, status: "completed", 
                start: "2026-04-01", end: "2026-04-10", total: 495000, 
                contract_num: "CTR-2026-00002", status_contract: "signed" 
            }
        ];
        for (const r of rentals) {
            if (!vehicleIds[r.vehicleIdx]) continue;
            // Check if rental exists
            const existing = await client.query("SELECT id FROM rentals WHERE enterprise_id = $1 AND contract_number = $2", [enterpriseId, r.contract_num]);
            if (existing.rows.length === 0) {
                await client.query(
                    `INSERT INTO rentals (
                        enterprise_id, customer_id, vehicle_id, status, 
                        planned_start_date, planned_end_date, start_date, end_date,
                        total_cents, contract_number, contract_status, 
                        pickup_agency_id, return_agency_id
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
                    [
                        enterpriseId, customerIds[r.customerIdx], vehicleIds[r.vehicleIdx], r.status,
                        r.start, r.end, r.start, r.end,
                        r.total, r.contract_num, r.status_contract,
                        agencyIds[0], agencyIds[0]
                    ]
                );
            }
        }
        console.log(`Created/Found rentals.`);

        // 7. Create Contract Template
        const htmlTemplate = `
            <div style="font-family: sans-serif; padding: 40px;">
                <h1 style="text-align: center;">CONTRAT DE LOCATION DE VÉHICULE</h1>
                <p>Entre l'entreprise <strong>{{enterprise_name}}</strong> et le client <strong>{{customer_name}}</strong>.</p>
                <h3>Détails du véhicule :</h3>
                <ul>
                    <li>Marque/Modèle : {{vehicle_name}}</li>
                    <li>Immatriculation : {{vehicle_plate}}</li>
                </ul>
                <h3>Détails de la location :</h3>
                <p>Du {{start_date}} au {{end_date}}</p>
                <p>Montant total : {{total_amount}} DH</p>
                <br/>
                <p style="font-size: 0.8em;">Fait à {{city}}, le {{current_date}}</p>
            </div>
        `;
        const templateCheck = await client.query("SELECT id FROM contract_templates WHERE enterprise_id = $1 AND name = $2", [enterpriseId, 'Modèle Standard']);
        if (templateCheck.rows.length === 0) {
            await client.query(
                `INSERT INTO contract_templates (enterprise_id, name, html_template, is_default) 
                 VALUES ($1, 'Modèle Standard', $2, true)`,
                [enterpriseId, htmlTemplate]
            );
        }
        console.log(`Created/Found default contract template.`);

        await client.query("COMMIT");
        console.log("Seed successful!");
    } catch (e) {
        await client.query("ROLLBACK");
        console.error("Seed failed:", e);
    } finally {
        client.release();
        process.exit();
    }
}

seed();
