import bcrypt from "bcrypt";
import { query } from "./db.js";

const TEST_PASSWORD = "password123";

async function seed() {
    console.log("🌱 Seeding test data...");

    try {
        const hash = await bcrypt.hash(TEST_PASSWORD, 10);

        // 1. Create Enterprises
        const enterprises = [
            { name: "Atlas Rent a Car", address: "123 Avenue des FAR, Casablanca", plan: "Enterprise", status: "active" },
            { name: "Azur Coast Rentals", address: "45 Rue de la Plage, Nice", plan: "Pro", status: "active" },
            { name: "London City Drive", address: "10 Downing Street, London", plan: "Free", status: "suspended" },
            { name: "Dubai Desert Safari", address: "Al Fahidi, Dubai", plan: "Enterprise", status: "active" }
        ];

        for (const ent of enterprises) {
            const entResult = await query(
                `INSERT INTO enterprises (name, address, plan, status) VALUES ($1, $2, $3, $4) RETURNING id`,
                [ent.name, ent.address, ent.plan, ent.status]
            );
            const entId = entResult.rows[0].id;

            // 2. Create Director for each
            const directorEmail = `director@${ent.name.toLowerCase().replace(/\s+/g, '')}.com`;
            await query(
                `INSERT INTO users (email, password_hash, role, enterprise_id) VALUES ($1, $2, $3, $4)`,
                [directorEmail, hash, 'director', entId]
            );

            // 3. Create Agents for each
            for (let i = 1; i <= 2; i++) {
                const agentEmail = `agent${i}@${ent.name.toLowerCase().replace(/\s+/g, '')}.com`;
                await query(
                    `INSERT INTO users (email, password_hash, role, enterprise_id) VALUES ($1, $2, $3, $4)`,
                    [agentEmail, hash, 'agent', entId]
                );
            }

            console.log(`✅ Created test data for ${ent.name}`);
        }

        console.log("🏁 Seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
}

seed();
