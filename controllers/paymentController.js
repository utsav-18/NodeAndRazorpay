// controllers/paymentController.js
const razorpay = require('../utils/razorpayClient');
const crypto = require('crypto');

exports.renderCheckout = (req, res) => {
  const amount = 19900; // paise (₹199.00) — change as needed
  const displayAmount = (amount / 100).toFixed(2);
  res.render('checkout', {
    amount,
    displayAmount,
    key_id: process.env.RAZORPAY_KEY_ID || ''
  });
};

exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) {
      console.warn('createOrder: missing amount in request body', req.body);
      return res.status(400).json({ success: false, error: 'missing amount' });
    }

    const options = {
      amount: parseInt(amount, 10),
      currency: 'INR',
      receipt: 'rcpt_' + Date.now(),
      payment_capture: 1,
    };

    console.log('createOrder: calling razorpay.orders.create with options:', options);

    const order = await razorpay.orders.create(options);

    console.log('createOrder: razorpay response order:', order);
    return res.json({ success: true, order });
  } catch (err) {
    try {
      console.error('createOrder error:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    } catch (e) {
      console.error('createOrder error (non-serializable):', err);
    }
    const message = (err && err.error && err.error.description) || err.message || 'Order creation failed';
    return res.status(err.statusCode || 500).json({ success: false, error: message, raw: err });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      name,
      email,
      amount
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: 'missing payment fields' });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expected !== razorpay_signature) {
      console.warn('verifyPayment: signature mismatch', { expected, got: razorpay_signature });
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }

    // Optionally: persist to DB, send email etc. (omitted here)
    const receiptId = 'rcpt_' + Date.now();

    // Return useful data to client so we can render success page server-side
    return res.json({
      success: true,
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      amount: amount || null,
      receipt: receiptId
    });
  } catch (err) {
    console.error('verifyPayment error:', err);
    return res.status(500).json({ success: false, error: 'Server error during verification' });
  }
};
