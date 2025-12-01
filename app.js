// app.js
require('dotenv').config(); // load .env first

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// debug to confirm env loaded (masked preview)
console.log("KEY_ID preview:", process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.slice(0,12) + "..." : "MISSING");
console.log("KEY_SECRET present:", !!process.env.RAZORPAY_KEY_SECRET);

// view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// static & parsers
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.get('/', (req, res) => res.render('utsav'));
app.get('/payment-success', (req, res) => res.render('payment-success'));

const paymentRoutes = require('./routes/paymentRoutes'); // requires AFTER dotenv
app.use('/payment', paymentRoutes);

// 404
app.use((req, res) => res.status(404).send('404 Not Found'));

// start
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
