require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
stripe.subscriptions.retrieve('sub_1TNbLERN1JWQz8QAwOyqV8oT')
  .then(s => console.log('current_period_end:', s.current_period_end))
  .catch(e => console.error(e));
