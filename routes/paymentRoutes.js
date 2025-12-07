// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// render checkout page (GET)
router.get('/checkout', paymentController.renderCheckout);

// create order (POST) -> called by client checkout JS
router.post('/create-order', paymentController.createOrder);

// verify payment (POST) -> called by checkout handler after payment
router.post('/verify', paymentController.verifyPayment);

module.exports = router;
