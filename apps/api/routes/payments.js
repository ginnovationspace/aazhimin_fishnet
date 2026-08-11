const express = require("express");
const stripeFactory = require("stripe");
const paymentService = require("../services/paymentService");

/** @type {import('express').Router} */
const router = express.Router();

const readStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    const error = new Error("Stripe secret key is not configured");
    error.statusCode = 503;
    throw error;
  }

  return stripeFactory(process.env.STRIPE_SECRET_KEY);
};

router.post("/create-payment-intent", async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    const currency = String(req.body.currency || "usd").toLowerCase();

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: "Valid amount is required" });
    }

    const paymentIntent = await readStripe().paymentIntents.create({
      amount: Math.round(amount),
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: req.body.metadata || {},
    });

    res.status(201).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(error.statusCode || 502).json({
      error: error.message || "Unable to create payment intent",
    });
  }
});

router.post("/intent", async (req, res) => {
  try {
    const payment = await paymentService.createPaymentIntent(req.body);
    res.status(201).json(payment);
  } catch (error) {
    console.error("Error creating order payment intent:", error);
    res.status(error.statusCode || 500).json({ error: error.message || "Internal server error" });
  }
});

router.post("/:id/confirm", async (req, res) => {
  try {
    const payment = await paymentService.confirmPayment(req.params.id, req.body.paymentMethodId);
    res.status(200).json(payment);
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(error.statusCode || 500).json({ error: error.message || "Internal server error" });
  }
});

router.get("/:id/verify", async (req, res) => {
  try {
    const verification = await paymentService.retrievePayment(req.params.id);
    res.status(200).json(verification);
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(error.statusCode || 500).json({ error: error.message || "Internal server error" });
  }
});

router.post("/:id/refund", async (req, res) => {
  try {
    const refund = await paymentService.refundPayment(req.params.id, req.body.amount);
    res.status(200).json(refund);
  } catch (error) {
    console.error("Error refunding payment:", error);
    res.status(error.statusCode || 500).json({ error: error.message || "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const payment = await paymentService.getPaymentStatus(req.params.id);
    res.status(200).json(payment);
  } catch (error) {
    console.error("Error getting payment status:", error);
    res.status(error.statusCode || 500).json({ error: error.message || "Internal server error" });
  }
});

module.exports = router;
