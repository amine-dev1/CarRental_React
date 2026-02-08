
const BASE_URL = 'http://localhost:4000/api/auth';

async function initSuperadmin() {
    console.log('🚀 Initializing Superadmin...\n');

    const email = 'elidrissiamine74@gmail.com';
    const password = 'elidrissi2002';

    // 1. Bootstrap Superadmin
    console.log('1️⃣  Creating Superadmin...');
    try {
        const res = await fetch(`${BASE_URL}/bootstrap-superadmin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Response:', data);
    } catch (e) {
        console.error('Bootstrap Error:', e.message);
    }

    console.log('\n-------------------\n');

    // 2. Login Superadmin
    console.log('2️⃣  Testing Login...');
    try {
        const res = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        console.log('Status:', res.status);

        if (data.token) {
            console.log('✅ Login Successful!');
            console.log('👑 Role:', data.user.role);
            console.log('🔑 Token:', data.token.substring(0, 20) + '...');
        } else {
            console.log('❌ Login Failed:', data);
        }

    } catch (e) {
        console.error('Login Error:', e.message);
    }
}

initSuperadmin();
