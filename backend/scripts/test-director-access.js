
const BASE_URL = 'http://localhost:4000/api';

const DIRECTOR_CREDS = {
    email: 'director@demo.com',
    password: 'password123'
};

async function testDirectorAccess() {
    console.log('🕵️‍♀️ Testing Director Access...\n');

    // 1. Login
    console.log('1️⃣  Director Login...');
    let token;
    let enterpriseId;
    try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(DIRECTOR_CREDS)
        });
        const data = await res.json();

        if (res.status !== 200) throw new Error('Login failed');
        token = data.token;
        enterpriseId = data.user.enterprise_id;

        console.log('✅ Login Successful!');
        console.log(`🏢 Enterprise ID Scope: ${enterpriseId}`);

        if (!enterpriseId) throw new Error('CRITICAL: No Enterprise ID in user data!');

    } catch (e) {
        console.error('Login Error:', e.message); return;
    }

    // 2. Try to Create a Vehicle (Scoped Action)
    console.log('\n2️⃣  Testing Write Access (Create Vehicle)...');
    try {
        const res = await fetch(`${BASE_URL}/vehicles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: 'Tesla Model 3',
                plate: 'DEF-456',
                daily_price_cents: 10000,
                status: 'available'
            })
        });

        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Response:', data);

        if (res.status === 200 && data.enterprise_id === enterpriseId) {
            console.log('✨ SUCCESS: Vehicle created and correctly scoped to Enterprise!');
        } else {
            console.log('❌ Vehicle Creation Failed or Scope Mismatch');
        }

    } catch (e) {
        console.error('Vehicle Test Error:', e.message);
    }
}

testDirectorAccess();
