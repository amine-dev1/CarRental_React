import fetch from "node-fetch";

async function test() {
    const payload = {
        full_name: "Test User",
        email: "elidrissiamine74@gmail.com",
        password: "password123",
        enterprise_name: "Test Enterprise",
        plan: "Enterprise",
        billing: "yearly"
    };

    try {
        const res = await fetch("http://localhost:4000/api/payments/register-checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Data:", data);
    } catch (e) {
        console.error("Error:", e);
    }
}
test();
