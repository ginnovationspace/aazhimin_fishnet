const express = require('express');
/** @type {import('express').Router} */
const router = express.Router();
const { authenticate } = require("../middleware/auth");

const { createMarketplaceOrder } = require('../controllers/marketplaceOrderController');

// Create a marketplace order (endpoint called from checkout)
router.post('/', authenticate, createMarketplaceOrder);

module.exports = router;
