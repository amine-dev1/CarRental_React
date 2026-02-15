import fetch from 'node-fetch';

async function testSuperadminAPI() {
    try {
        console.log('🧪 Testing Superadmin Enterprises API...\n');
        
        // First, we need to login as superadmin to get a token
        const loginResponse = await fetch('http://localhost:4000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'elidirissiamine74@gmail.com',
                password: 'elidrissi2002'
            })
        });
        
        if (!loginResponse.ok) {
            console.log('⚠️  Login failed. Trying without authentication...\n');
            console.log('Response status:', loginResponse.status);
            return;
        }
        
        const loginData = await loginResponse.json();
        const token = loginData.token;
        
        console.log('✅ Logged in as superadmin\n');
        
        // Now call the enterprises API
        const enterprisesResponse = await fetch('http://localhost:4000/api/superadmin/enterprises', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!enterprisesResponse.ok) {
            console.log('❌ Enterprises API failed');
            console.log('Status:', enterprisesResponse.status);
            const errorText = await enterprisesResponse.text();
            console.log('Error:', errorText);
            return;
        }
        
        const enterprises = await enterprisesResponse.json();
        
        console.log(`✅ API returned ${enterprises.length} enterprises:\n`);
        
        enterprises.forEach((ent, idx) => {
            console.log(`${idx + 1}. ${ent.name}`);
            console.log(`   📋 Plan: ${ent.plan}`);
            console.log(`   🔄 Status: ${ent.status}`);
            console.log(`   👥 Directors: ${ent.directors_count}`);
            console.log(`   👨‍💼 Agents: ${ent.agents_count}`);
            console.log(`   🚗 Vehicles: ${ent.vehicles_count}`);
            console.log(`   💰 Revenue: ${(parseInt(ent.revenue_cents || 0) / 100).toFixed(2)} MAD`);
            console.log('');
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testSuperadminAPI();
