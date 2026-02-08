

const BASE_URL = 'http://localhost:4000/api/auth';

async function testAuth() {
    console.log('🏁 Starting Auth Test...\n');

    // 1. Register
    console.log('1️⃣  Testing Register...');
    try {
        const registerRes = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@test.com',
                password: 'password123'
            })
        });

        const registerData = await registerRes.json();
        console.log('Status:', registerRes.status);
        console.log('Response:', registerData);

        if (registerRes.status !== 200 && registerData.error !== 'Email already exists') {
            throw new Error('Register failed');
        }
    } catch (e) {
        console.error('Register Error:', e.message);
    }

    console.log('\n-------------------\n');

    // 2. Login
    console.log('2️⃣  Testing Login...');
    try {
        const loginRes = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@test.com',
                password: 'password123'
            })
        });

        const loginData = await loginRes.json();
        console.log('Status:', loginRes.status);

        if (loginData.token) {
            console.log('✅ Login Successful!');
            console.log('🔑 Token received (truncated):', loginData.token.substring(0, 20) + '...');
        } else {
            console.log('❌ Login Failed:', loginData);
        }

    } catch (e) {
        console.error('Login Error:', e.message);
    }
}

testAuth();
