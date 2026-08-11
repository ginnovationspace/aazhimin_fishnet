const express = require('express');
/** @type {import('express').Router} */
const router = express.Router();

const { createMarketplaceOrder } = require('../controllers/marketplaceOrderController');

// Create a marketplace order (endpoint called from checkout)
router.post('/', createMarketplaceOrder);

module.exports = router;