// Native fetch used

async function test() {
    try {
        const response = await fetch('http://localhost:4000/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'elidrissiamine74@gmail.com' })
        });
        const data = await response.json();
        console.log('Response:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

test();
