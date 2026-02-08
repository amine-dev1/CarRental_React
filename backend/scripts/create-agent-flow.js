
const BASE_URL = 'http://localhost:4000/api';

const DIRECTOR_CREDS = {
    email: 'director@demo.com',
    password: 'password123'
};

async function createAgentFlow() {
    console.log('🚀 Agent Creation Flow (Managed by Director)...\n');

    // 1. Director Login
    console.log('1️⃣  Logging in as Director...');
    let directorToken;
    let enterpriseId;
    try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(DIRECTOR_CREDS)
        });
        const data = await res.json();
        if (!data.token) throw new Error('Director login failed');
        directorToken = data.token;
        enterpriseId = data.user.enterprise_id;
        console.log('✅ Director Logged In!');
        console.log(`🏢 Enterprise ID: ${enterpriseId}`);
    } catch (e) {
        console.error('Director Login Error:', e.message); return;
    }

    // 2. Director Creates Agent
    console.log('\n2️⃣  Director Creating Agent account...');
    const newAgent = {
        email: 'agent@demo.com', // Unique email
        password: 'agentpassword'
    };

    try {
        const res = await fetch(`${BASE_URL}/company/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${directorToken}`
            },
            body: JSON.stringify(newAgent)
        });

        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Response:', data);

        if (res.status === 200) {
            console.log('✨ Agent Created Successfully!');
        } else {
            throw new Error('Agent creation failed');
        }
    } catch (e) {
        console.error('Create Agent Error:', e.message); return;
    }

    // 3. Verify Agent Login
    console.log('\n3️⃣  Verifying Agent Login...');
    try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newAgent)
        });

        const data = await res.json();

        if (res.status === 200) {
            console.log('✅ Agent Login Successful!');
            console.log(`👤 Agent Role: ${data.user.role}`);
            console.log(`🏢 Agent Scope: ${data.user.enterprise_id}`);

            if (data.user.enterprise_id === enterpriseId) {
                console.log('🎯 SCOPE MATCH: Agent belongs to the correct enterprise!');
            } else {
                console.error('❌ SCOPE MISMATCH: Agent is in wrong enterprise!');
            }
        } else {
            console.error('❌ Agent Login Failed:', data);
        }

    } catch (e) {
        console.error('Agent Login Check Error:', e.message);
    }
}

createAgentFlow();
