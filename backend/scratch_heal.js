import 'dotenv/config';
import { query } from "./src/db.js";

async function heal() {
    try {
        const StripeModule = await import('stripe');
        console.log("StripeModule loaded");
        const stripe = new StripeModule.default(process.env.STRIPE_SECRET_KEY);
        
        console.log("Fetching sub sub_1TNbLERN1JWQz8QAwOyqV8oT");
        const sub = await stripe.subscriptions.retrieve('sub_1TNbLERN1JWQz8QAwOyqV8oT');
        console.log("Sub retrieved, end:", sub.current_period_end);
        
        if (sub && sub.current_period_end) {
            const newEnd = new Date(sub.current_period_end * 1000);
            console.log("Date to save:", newEnd);
            await query(`UPDATE enterprises SET subscription_end = $1 WHERE gateway_subscription_id = $2`, [newEnd, 'sub_1TNbLERN1JWQz8QAwOyqV8oT']);
            console.log("Saved.");
        }
    } catch (e) {
        console.error("FAIL:", e.message);
    }
    process.exit(0);
}

heal();
