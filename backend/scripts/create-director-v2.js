
const BASE_URL = 'http://localhost:4000/api';
const SUPERADMIN_CREDS = {
    email: 'elidrissiamine74@gmail.com',
    password: 'Password2026!'
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
        if (!token) throw new Error('No token returned');
        console.log('✅ Token received!');
    } catch (e) {
        console.error('Login Failed:', e); return;
    }

    // 2. Get Enterprise ID
    console.log('\n2️⃣  Fetching Enterprise ID...');
    let enterpriseId;
    try {
        const res = await fetch(`${BASE_URL}/superadmin/enterprises`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const list = await res.json();
        if (list.length === 0) {
            console.log("No enterprise found. Creating one...");
            const entRes = await fetch(`${BASE_URL}/superadmin/enterprises`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: "Demo Enterprise", address: "Tech City", plan: "Pro" })
            });
            const entData = await entRes.json();
            enterpriseId = entData.id;
        } else {
            enterpriseId = list[0].id;
        }
        console.log(`✅ Using Enterprise ID: ${enterpriseId}`);
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

        if (res.status === 200 || res.status === 201) {
            console.log('✨ Director Created Successfully!');
            console.log('Email: director@demo.com');
            console.log('Password: password123');
        } else {
            console.log('Create Response:', data);
        }
    } catch (e) {
        console.error('Create Director Failed:', e.message);
    }
}

createDirector();
