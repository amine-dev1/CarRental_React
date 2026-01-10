
const BASE_URL = 'http://localhost:4000/api';

const SUPERADMIN_CREDS = {
    email: 'elidrissiamine74@gmail.com',
    password: 'elidrissi2002'
};

async function createEnterprise() {
    console.log('🚀 Creating Enterprise Workflow...\n');

    // 1. Login to get Token
    console.log('1️⃣  Logging in as Superadmin...');
    let token;
    try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(SUPERADMIN_CREDS)
        });
        const data = await res.json();
        if (!data.token) throw new Error('No token received');
        token = data.token;
        console.log('✅ Token received!');
    } catch (e) {
        console.error('Login Failed:', e.message);
        return;
    }

    // 2. Create Enterprise
    console.log('\n2️⃣  Creating Enterprise "Entreprise Demo"...');
    try {
        const res = await fetch(`${BASE_URL}/superadmin/enterprises`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name: 'Entreprise Demo' })
        });

        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Response:', data);

        if (res.status === 200) {
            console.log('✨ Enterprise Created Successfully!');
            console.log('🏢 Enterprise ID:', data.id);
        }
    } catch (e) {
        console.error('Create Enterprise Failed:', e.message);
    }
}

createEnterprise();
