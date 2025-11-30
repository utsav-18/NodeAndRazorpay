// app.js (modified)
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");
require("dotenv").config();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// parse json and urlencoded (needed for POST)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// your existing route (keep if needed)
app.get("/new", (req, res) => {
  res.render("index.ejs");
});

// payment routes
const paymentRoutes = require("./routes/paymentRoutes");
app.use("/payment", paymentRoutes);

// in app.js after payment routes
app.get("/payment-success", (req, res) => res.render("payment-success"));


app.listen(port, () => {
  console.log(`http://localhost:${port}/new`);
});
