// controllers/paymentController.js
const razorpay = require('../utils/razorpayClient');
const crypto = require('crypto');

const DEFAULT_AMOUNT_PAISA = Number(process.env.DEFAULT_AMOUNT_PAISA) || 19900; // ₹199

exports.renderCheckout = (req, res) => {
  // amount can be passed via query or fallback to env default
  const amountFromQuery = Number(req.query.amount) || null;
  const amount = amountFromQuery || DEFAULT_AMOUNT_PAISA; // default ₹199
  const displayAmount = (amount / 100).toFixed(2);
  res.render('checkout', {
    amount,
    displayAmount,
    key_id: process.env.RAZORPAY_KEY_ID || ''
  });
};

exports.createOrder = async (req, res) => {
  try {
    let { amount } = req.body;
    const parsedAmount = parseInt(amount, 10);

    // If client sent a valid positive integer, use it; otherwise fall back to default
    const finalAmount = (parsedAmount && !isNaN(parsedAmount) && parsedAmount > 0)
      ? parsedAmount
      : DEFAULT_AMOUNT_PAISA;

    const options = {
      amount: finalAmount,
      currency: 'INR',
      receipt: 'rcpt_' + Date.now(),
      payment_capture: 1
    };

    console.log('createOrder: calling razorpay.orders.create with options:', options);

    const order = await razorpay.orders.create(options);
    console.log('createOrder: order result:', order);
    return res.json({ success: true, order });
  } catch (err) {
    console.error('createOrder error:', err);
    const message = (err && err.error && err.error.description) || err.message || 'Order creation failed';
    return res.status(err.statusCode || 500).json({ success: false, error: message, raw: err });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, name, email, amount } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: 'missing payment fields' });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                           .update(body.toString())
                           .digest('hex');

    if (expected !== razorpay_signature) {
      console.warn('verifyPayment: signature mismatch', { expected, got: razorpay_signature });
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }

    // optionally persist payment here

    const receiptId = 'rcpt_' + Date.now();

    return res.json({
      success: true,
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      amount: amount || DEFAULT_AMOUNT_PAISA,
      receipt: receiptId
    });
  } catch (err) {
    console.error('verifyPayment error:', err);
    return res.status(500).json({ success: false, error: 'Server error during verification' });
  }
};
