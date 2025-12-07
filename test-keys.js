// test-keys-env.js
require('dotenv').config();
const Razorpay = require('razorpay');

const id = (process.env.RAZORPAY_KEY_ID || '').trim();
const secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

console.log('KEY_ID prefix:', id.slice(0,12));
console.log('KEY_ID len:', id.length);
console.log('SECRET len:', secret.length);

if (!id || !secret) {
  console.error('Missing keys. Update .env and restart. Exiting.');
  process.exit(1);
}

const rzp = new Razorpay({ key_id: id, key_secret: secret });

(async () => {
  try {
    const order = await rzp.orders.create({ amount: 100, currency: 'INR', receipt: 'rcpt_debug' });
    console.log('ORDER CREATED OK:', order.id);
  } catch (err) {
    console.error('RZP ERROR statusCode:', err.statusCode);
    // err.error sometimes contains structured info
    console.error('err.error:', JSON.stringify(err.error || err, null, 2));
    // print raw message if available
    if (err.error && err.error.description) console.error('Description:', err.error.description);
  }
})();
