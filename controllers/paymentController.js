// controllers/paymentController.js
const razorpay = require('../utils/razorpayClient');
const crypto = require('crypto');

exports.renderCheckout = (req, res) => {
  const amount = 20000; // paise (200 INR) — change if needed
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
    // print full error object details
    try {
      console.error('createOrder error:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    } catch (e) {
      console.error('createOrder error (non-serializable):', err);
    }

    const message = (err && err.error && err.error.description) || err.message || 'Order creation failed';
    return res.status(err.statusCode || 500).json({ success: false, error: message, raw: err });
  }
};

exports.verifyPayment = (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: 'missing payment fields' });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expected === razorpay_signature) {
      // success: normally update DB here
      return res.json({ success: true, message: 'Payment verified' });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (err) {
    console.error('verifyPayment error:', err);
    return res.status(500).json({ success: false, error: 'Server error during verification' });
  }
};
