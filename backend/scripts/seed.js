import { query } from "./src/db.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

async function seed() {
    console.log("🌱 Start seeding real test data...");

    try {
        // 1. Create Enterprises
        const ent1 = await query("INSERT INTO enterprises (name, status) VALUES ($1, $2) RETURNING id", ["LuxDrive Paris", "active"]);
        const ent2 = await query("INSERT INTO enterprises (name, status) VALUES ($1, $2) RETURNING id", ["EcoRent Casablanca", "active"]);
        const ent3 = await query("INSERT INTO enterprises (name, status) VALUES ($1, $2) RETURNING id", ["Speedy Wheels Dubai", "active"]);
        const ent4 = await query("INSERT INTO enterprises (name, status) VALUES ($1, $2) RETURNING id", ["Azur Coast Rental", "suspended"]);

        const e1Id = ent1.rows[0].id;
        const e2Id = ent2.rows[0].id;
        const e3Id = ent3.rows[0].id;
        const e4Id = ent4.rows[0].id;

        console.log("✅ 4 Enterprises created.");

        // 2. Create Directors
        const hash = await bcrypt.hash("Password2026!", 10);

        await query(
            "INSERT INTO users (enterprise_id, email, password_hash, role) VALUES ($1, $2, $3, $4)",
            [e1Id, "director.paris@luxdrive.com", hash, "director"]
        );
        await query(
            "INSERT INTO users (enterprise_id, email, password_hash, role) VALUES ($1, $2, $3, $4)",
            [e2Id, "director.casa@ecorent.com", hash, "director"]
        );

        console.log("✅ 2 Directors created (Password: Password2026!).");

        // 3. Create Agents
        await query(
            "INSERT INTO users (enterprise_id, email, password_hash, role) VALUES ($1, $2, $3, $4)",
            [e1Id, "agent1.paris@luxdrive.com", hash, "agent"]
        );
        await query(
            "INSERT INTO users (enterprise_id, email, password_hash, role) VALUES ($1, $2, $3, $4)",
            [e2Id, "agent1.casa@ecorent.com", hash, "agent"]
        );

        console.log("✅ 2 Agents created.");

        console.log("✨ Seeding completed successfully!");
    } catch (err) {
        console.error("❌ Seeding failed:", err.message);
    } finally {
        process.exit();
    }
}

seed();
