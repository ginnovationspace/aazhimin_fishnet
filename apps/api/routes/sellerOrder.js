const express = require('express');
/** @type {import('express').Router} */
const router = express.Router();

const { getSellerOrders, updateSellerOrderStatus } = require('../controllers/sellerOrderController');
const { authenticate } = require('../middleware/auth');

// Get all seller orders for a merchant
router.get('/orders', authenticate, getSellerOrders);

// Update the status of a seller order
router.put('/orders/:sellerOrderId/status', authenticate, updateSellerOrderStatus);

module.exports = router;