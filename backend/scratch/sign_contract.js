import { pool } from "../src/db.js";

async function signContract() {
    const client = await pool.connect();
    try {
        // 1. Find the user
        const userRes = await client.query(
            `SELECT id, enterprise_id FROM users WHERE email = $1`,
            ['amineabouelouafaelidrissi@gmail.com']
        );
        const user = userRes.rows[0];
        if (!user) { console.error("User not found!"); return; }
        console.log("User:", user.id);

        // 2. Find a rental that doesn't have a signed contract yet
        const rentalRes = await client.query(
            `SELECT id, contract_number, contract_status, customer_id, vehicle_id
             FROM rentals WHERE enterprise_id = $1 ORDER BY created_at DESC`,
            [user.enterprise_id]
        );
        console.log("Rentals found:", rentalRes.rows.length);
        rentalRes.rows.forEach(r => console.log(`  - ${r.id} | ${r.contract_number} | status: ${r.contract_status}`));

        // 3. Find a rental to sign (prefer one that's pending_signature, or any without signed status)
        let rental = rentalRes.rows.find(r => r.contract_status === 'pending_signature');
        if (!rental) {
            rental = rentalRes.rows.find(r => r.contract_status !== 'signed');
        }
        if (!rental) {
            console.log("All contracts already signed! Picking the first one for re-sign.");
            rental = rentalRes.rows[0];
        }
        console.log("\nWill work on rental:", rental.id, "| contract:", rental.contract_number);

        // 4. Check if a contract entry exists for this rental
        const contractRes = await client.query(
            `SELECT id, contract_number, html_snapshot, metadata, pdf_path, signed_at 
             FROM contracts WHERE rental_id = $1 AND enterprise_id = $2 ORDER BY created_at DESC LIMIT 1`,
            [rental.id, user.enterprise_id]
        );

        let contractId;
        if (contractRes.rows.length > 0) {
            contractId = contractRes.rows[0].id;
            console.log("Existing contract found:", contractId, "| signed_at:", contractRes.rows[0].signed_at);
            
            if (contractRes.rows[0].signed_at && contractRes.rows[0].pdf_path) {
                console.log("\n✅ This contract is already signed and has a PDF!");
                console.log("PDF path:", contractRes.rows[0].pdf_path);
                return;
            }
        } else {
            console.log("No contract entry found. Need to generate one first.");
            
            // Generate contract via HTTP call to the local API
            console.log("\nGenerating contract via API...");
            const token = (await import('jsonwebtoken')).default.sign(
                { id: user.id, email: 'amineabouelouafaelidrissi@gmail.com', role: 'director', enterprise_id: user.enterprise_id },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            const genResponse = await fetch('http://localhost:4000/api/contracts/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    rental_id: rental.id,
                    mileage_start: 15000,
                    fuel_level_start: 'Plein',
                    deposit_amount_cents: 500000,
                    notes: 'RAS - Véhicule en bon état'
                })
            });

            if (!genResponse.ok) {
                const err = await genResponse.json();
                console.error("Generate failed:", err);
                return;
            }

            const genResult = await genResponse.json();
            contractId = genResult.contract_id;
            console.log("Contract generated!", contractId, "| Number:", genResult.contract_number);
        }

        // 5. Sign the contract via API
        console.log("\nSigning contract via API...");
        const token = (await import('jsonwebtoken')).default.sign(
            { id: user.id, email: 'amineabouelouafaelidrissi@gmail.com', role: 'director', enterprise_id: user.enterprise_id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Create a simple SVG signature as base64
        const signatureSvg = `data:image/svg+xml;base64,${Buffer.from(
            `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="150">
                <path d="M 30 100 C 50 20, 100 20, 120 80 S 180 140, 200 80 S 260 20, 300 80 S 340 120, 370 60" 
                      stroke="#1a1a1a" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`
        ).toString('base64')}`;

        const signResponse = await fetch(`http://localhost:4000/api/contracts/${contractId}/sign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                signature_data: signatureSvg,
                signed_by_name: 'Amine Abou El Ouafa El Idrissi'
            })
        });

        if (!signResponse.ok) {
            const err = await signResponse.json();
            console.error("Sign failed:", err);
            return;
        }

        const signResult = await signResponse.json();
        console.log("\n✅ Contract signed successfully!");
        console.log("PDF URL:", signResult.pdf_url);
        console.log("Signed at:", signResult.signed_at);

    } catch (e) {
        console.error("Error:", e);
    } finally {
        client.release();
        process.exit();
    }
}

signContract();
