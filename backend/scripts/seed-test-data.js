import { query } from "../src/db.js";

async function seedTestData() {
  console.log("🌱 Seeding test data for Free, Pro, and Enterprise plans...\n");

  try {
    // Get enterprise IDs
    const enterprises = await query(
      `SELECT id, name, plan FROM enterprises WHERE plan IN ('Free', 'Pro', 'Enterprise') ORDER BY plan`
    );

    if (enterprises.rows.length < 3) {
      console.log("❌ Not enough test enterprises found. Please run create-test-directors.js first.");
      process.exit(1);
    }

    const freeEnt = enterprises.rows.find(e => e.plan === 'Free');
    const proEnt = enterprises.rows.find(e => e.plan === 'Pro');
    const entEnt = enterprises.rows.find(e => e.plan === 'Enterprise');

    console.log(`✅ Found enterprises:`);
    console.log(`   - Free: ${freeEnt.name} (ID: ${freeEnt.id})`);
    console.log(`   - Pro: ${proEnt.name} (ID: ${proEnt.id})`);
    console.log(`   - Enterprise: ${entEnt.name} (ID: ${entEnt.id})\n`);

    // === FREE PLAN DATA ===
    console.log("📦 Creating FREE plan data...");
    
    const freeVehicles = [
      ["Toyota Corolla 2022", "A-12345-B", 3500],
      ["Hyundai i10", "A-12346-B", 3000],
      ["Dacia Logan", "A-12347-B", 2800]
    ];

    for (const [name, plate, price] of freeVehicles) {
      await query(
        `INSERT INTO vehicles (enterprise_id, name, plate, daily_price_cents) VALUES ($1, $2, $3, $4)`,
        [freeEnt.id, name, plate, price]
      );
    }

    await query(`INSERT INTO customers (enterprise_id, full_name, email, phone_number) VALUES ($1, $2, $3, $4)`,
      [freeEnt.id, "Ahmed Alami", "ahmed@free.com", "+212600000001"]);
    await query(`INSERT INTO customers (enterprise_id, full_name, email, phone_number) VALUES ($1, $2, $3, $4)`,
      [freeEnt.id, "Fatima Zahra", "fatima@free.com", "+212600000002"]);

    console.log("✅ Free plan: 3 vehicles, 2 customers\n");

    // === PRO PLAN DATA ===
    console.log("⭐ Creating PRO plan data...");
    
    const proVehicles = [
      ["Toyota Camry 2023", "B-10001-C", 5500],
      ["Honda Accord", "B-10002-C", 6000],
      ["BMW Serie 3", "B-10003-C", 9000],
      ["Mercedes C-Class", "B-10004-C", 9500],
      ["Peugeot 3008", "B-10005-C", 7000],
      ["Nissan Qashqai", "B-10006-C", 6500],
      ["Renault Megane", "B-10007-C", 5000],
      ["Volkswagen Golf", "B-10008-C", 4500],
      ["Ford Focus", "B-10009-C", 4200],
      ["Hyundai Tucson", "B-10010-C", 6800],
      ["Kia Sportage", "B-10011-C", 6600],
      ["Toyota RAV4", "B-10012-C", 7500]
    ];

    for (const [name, plate, price] of proVehicles) {
      await query(
        `INSERT INTO vehicles (enterprise_id, name, plate, daily_price_cents) VALUES ($1, $2, $3, $4)`,
        [proEnt.id, name, plate, price]
      );
    }

    const proCustomers = [
      ["Hassan Bennani", "hassan@pro.com", "+212600000011"],
      ["Amina El Fassi", "amina@pro.com", "+212600000012"],
      ["Youssef Alaoui", "youssef@pro.com", "+212600000013"],
      ["Nadia Tazi", "nadia@pro.com", "+212600000014"],
      ["Omar Squalli", "omar@pro.com", "+212600000015"],
      ["Salma Nejjar", "salma@pro.com", "+212600000016"],
      ["Rachid Berrada", "rachid@pro.com", "+212600000017"],
      ["Leila Madani", "leila@pro.com", "+212600000018"]
    ];

    for (const [name, email, phone] of proCustomers) {
      await query(`INSERT INTO customers (enterprise_id, full_name, email, phone_number) VALUES ($1, $2, $3, $4)`,
        [proEnt.id, name, email, phone]);
    }

    // Add sample rentals with payments
    const proVeh = await query(`SELECT id FROM vehicles WHERE enterprise_id=$1 LIMIT 5`, [proEnt.id]);
    const proCust = await query(`SELECT id FROM customers WHERE enterprise_id=$1 LIMIT 5`, [proEnt.id]);

    for (let i = 0; i < 5; i++) {
      const rental = await query(
        `INSERT INTO rentals (enterprise_id, customer_id, vehicle_id, start_date, end_date, total_cents, status)
         VALUES ($1, $2, $3, NOW() - INTERVAL '${15 + i * 5} days', NOW() - INTERVAL '${10 + i * 5} days', $4, 'completed')
         RETURNING id`,
        [proEnt.id, proCust.rows[i].id, proVeh.rows[i].id, 5500 * 5]
      );

      await query(
        `INSERT INTO payments (enterprise_id, rental_id, amount_cents, method, paid_at)
         VALUES ($1, $2, $3, $4, NOW() - INTERVAL '${15 + i * 5} days')`,
        [proEnt.id, rental.rows[0].id, 5500 * 5, i % 2 === 0 ? 'card' : 'cash']
      );
    }

    console.log("✅ Pro plan: 12 vehicles, 8 customers, 5 rentals with payments\n");

    // === ENTERPRISE PLAN DATA ===
    console.log("👑 Creating ENTERPRISE plan data...");
    
    const entVehicles = [
      ["Mercedes S-Class", "C-20001-D", 15000],
      ["BMW 7 Series", "C-20002-D", 14500],
      ["Audi A8", "C-20003-D", 14000],
      ["Range Rover Sport", "C-20004-D", 13000],
      ["Porsche Cayenne", "C-20005-D", 13500],
      ["Tesla Model S", "C-20006-D", 12000],
      ["BMW X5", "C-20007-D", 11000],
      ["Mercedes GLE", "C-20008-D", 11500],
      ["Audi Q7", "C-20009-D", 10500],
      ["Volvo XC90", "C-20010-D", 10000],
      ["Toyota Land Cruiser", "C-20011-D", 12500],
      ["Lexus RX", "C-20012-D", 11000],
      ["Jaguar F-Pace", "C-20013-D", 11500],
      ["Maserati Ghibli", "C-20014-D", 16000],
      ["Alfa Romeo Giulia", "C-20015-D", 9500],
      ["Mercedes E-Class", "C-20016-D", 8500],
      ["BMW Serie 5", "C-20017-D", 9000],
      ["Audi A6", "C-20018-D", 8800],
      ["Volvo S90", "C-20019-D", 9200],
      ["Genesis G80", "C-20020-D", 10000],
      ["Infiniti Q50", "C-20021-D", 8000],
      ["Cadillac CT5", "C-20022-D", 9500],
      ["Lincoln Continental", "C-20023-D", 10500],
      ["Chrysler 300", "C-20024-D", 7500],
      ["Dodge Charger", "C-20025-D", 7800]
    ];

    for (const [name, plate, price] of entVehicles) {
      await query(
        `INSERT INTO vehicles (enterprise_id, name, plate, daily_price_cents) VALUES ($1, $2, $3, $4)`,
        [entEnt.id, name, plate, price]
      );
    }

    const entCustomers = [
      ["Mohammed Tahiri", "mohammed@ent.com", "+212600000021"],
      ["Khadija Bennis", "khadija@ent.com", "+212600000022"],
      ["Karim Idrissi", "karim@ent.com", "+212600000023"],
      ["Samira Lahlou", "samira@ent.com", "+212600000024"],
      ["Mehdi Chraibi", "mehdi@ent.com", "+212600000025"],
      ["Sophia Belkadi", "sophia@ent.com", "+212600000026"],
      ["Amine Boukhris", "amine@ent.com", "+212600000027"],
      ["Zineb El Amrani", "zineb@ent.com", "+212600000028"],
      ["Tarik Hajji", "tarik@ent.com", "+212600000029"],
      ["Rim Essafi", "rim@ent.com", "+212600000030"],
      ["Walid Kettani", "walid@ent.com", "+212600000031"],
      ["Meryem Naciri", "meryem@ent.com", "+212600000032"],
      ["Adil Zmarrou", "adil@ent.com", "+212600000033"],
      ["Hajar Bensouda", "hajar@ent.com", "+212600000034"],
      ["Ilias Benkirane", "ilias@ent.com", "+212600000035"]
    ];

    for (const [name, email, phone] of entCustomers) {
      await query(`INSERT INTO customers (enterprise_id, full_name, email, phone_number) VALUES ($1, $2, $3, $4)`,
        [entEnt.id, name, email, phone]);
    }

    // Add 15 rentals with payments
    const entVeh = await query(`SELECT id FROM vehicles WHERE enterprise_id=$1`, [entEnt.id]);
    const entCust = await query(`SELECT id FROM customers WHERE enterprise_id=$1`, [entEnt.id]);

    for (let i = 0; i < 15; i++) {
      const daysAgo = 5 + i * 3;
      const rental = await query(
        `INSERT INTO rentals (enterprise_id, customer_id, vehicle_id, start_date, end_date, total_cents, status)
         VALUES ($1, $2, $3, NOW() - INTERVAL '${daysAgo} days', NOW() - INTERVAL '${daysAgo - 7} days', $4, 'completed')
         RETURNING id`,
        [entEnt.id, entCust.rows[i % 15].id, entVeh.rows[i % 25].id, 10000 * 7]
      );

      await query(
        `INSERT INTO payments (enterprise_id, rental_id, amount_cents, method, paid_at)
         VALUES ($1, $2, $3, $4, NOW() - INTERVAL '${daysAgo} days')`,
        [entEnt.id, rental.rows[0].id, 10000 * 7, ['card', 'cash', 'transfer'][i % 3]]
      );
    }

    console.log("✅ Enterprise plan: 25 vehicles, 15 customers, 15 rentals with payments\n");

    console.log("=" .repeat(60));
    console.log("🎉 All test data seeded successfully!");
    console.log("=" .repeat(60));

    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding test data:", err);
    process.exit(1);
  }
}

seedTestData();
