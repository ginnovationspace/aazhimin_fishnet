const express = require('express');
/** @type {import('express').Router} */
const router = express.Router();

const { handleStripeWebhook } = require('../controllers/paymentWebhookController');

// We need to use raw body for Stripe webhook verification
router.post('/', express.raw({ type: 'application/json' }), handleStripeWebhook);

module.exports = router;