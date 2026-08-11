const express = require('express');
/** @type {import('express').Router} */
const router = express.Router();

const { getBuyerOrders, getBuyerOrderById } = require('../controllers/buyerOrderController');
const { authenticate } = require('../middleware/auth');

// Get all buyer orders for a user
router.get('/orders', authenticate, getBuyerOrders);

// Get a specific buyer order by ID
router.get('/orders/:orderId', authenticate, getBuyerOrderById);

module.exports = router;