// controllers/paymentController.js
const razorpay = require("../utils/razorpayClient");
const crypto = require("crypto");

exports.renderCheckout = (req, res) => {
  const amount = 20000; // in paise (200 INR)
  const displayAmount = (amount / 100).toFixed(2); // "200.00"
  
  res.render("checkout", {
    amount,            // number
    displayAmount,     // formatted string
    key_id: process.env.RAZORPAY_KEY_ID || ""
  });
};

exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const order = await razorpay.orders.create({
      amount: parseInt(amount, 10),
      currency: "INR",
      receipt: "rcpt_" + Date.now(),
    });

    res.json({ success: true, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

exports.verifyPayment = (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expected === razorpay_signature) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
};
