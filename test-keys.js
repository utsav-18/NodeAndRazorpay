// test-keys-env.js
require('dotenv').config();
const Razorpay = require('razorpay');

const id = (process.env.RAZORPAY_KEY_ID||'').trim();
const secret = (process.env.RAZORPAY_KEY_SECRET||'').trim();

console.log('KEY prefix:', id.slice(0,12), ' len:', id.length, 'SECRET len:', secret.length);

if(!id||!secret){ console.error('Missing keys'); process.exit(1); }

const rzp = new Razorpay({ key_id: id, key_secret: secret });

rzp.orders.create({ amount: 100, currency: 'INR', receipt: 'rcpt_debug' })
  .then(o => console.log('ORDER OK', o.id))
  .catch(e => { console.error('ERR', e.statusCode); console.error(JSON.stringify(e.error||e, null, 2)); });
