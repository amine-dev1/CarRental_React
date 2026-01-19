
const BASE_URL = 'http://localhost:4000/api/auth';

async function createSuperadmin() {
    console.log('🚀 Creating New Superadmin Account...\n');

    const email = 'elidrissiamine74@gmail.com';
    const password = 'elidrissi2002';

    // Create Superadmin
    console.log('📧 Email:', email);
    console.log('🔐 Password:', password);
    console.log('\n-------------------\n');

    try {
        const res = await fetch(`${BASE_URL}/bootstrap-superadmin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Response:', data);

        if (res.ok) {
            console.log('\n✅ Superadmin account created successfully!');
            console.log('👤 ID:', data.id);
            console.log('📧 Email:', data.email);
            console.log('👑 Role:', data.role);
        } else {
            console.log('\n❌ Failed to create superadmin:', data.error || data);
        }
    } catch (e) {
        console.error('❌ Error:', e.message);
    }

    console.log('\n-------------------\n');

    // Test Login
    console.log('🔍 Testing Login...');
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

createSuperadmin();
