// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const paymentCtrl = require("../controllers/paymentController");

router.get("/checkout", paymentCtrl.renderCheckout);
router.post("/create-order", paymentCtrl.createOrder);
router.post("/verify", paymentCtrl.verifyPayment);

module.exports = router;
