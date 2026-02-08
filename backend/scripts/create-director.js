
const BASE_URL = 'http://localhost:4000/api';
const SUPERADMIN_CREDS = {
    email: 'elidrissiamine74@gmail.com',
    password: 'elidrissi2002'
};

async function createDirector() {
    console.log('🚀 Creating Director Workflow...\n');

    // 1. Login
    console.log('1️⃣  Logging in as Superadmin...');
    let token;
    try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(SUPERADMIN_CREDS)
        });
        const data = await res.json();
        token = data.token;
        console.log('✅ Token received!');
    } catch (e) {
        console.error('Login Failed'); return;
    }

    // 2. Get Enterprise ID
    console.log('\n2️⃣  Fetching Enterprise ID...');
    let enterpriseId;
    try {
        const res = await fetch(`${BASE_URL}/superadmin/enterprises`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const list = await res.json();
        if (list.length === 0) throw new Error('No enterprises found');
        enterpriseId = list[0].id;
        console.log(`✅ Using Enterprise: ${list[0].name} (${enterpriseId})`);
    } catch (e) {
        console.error('Fetch Enterprise Failed:', e.message); return;
    }

    // 3. Create Director
    console.log('\n3️⃣  Creating Director...');
    try {
        const res = await fetch(`${BASE_URL}/superadmin/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                enterprise_id: enterpriseId,
                email: 'director@demo.com',
                password: 'password123',
                role: 'director'
            })
        });

        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Response:', data);

        if (res.status === 200) {
            console.log('✨ Director Created Successfully!');
        }
    } catch (e) {
        console.error('Create Director Failed:', e.message);
    }
}

createDirector();
