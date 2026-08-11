const express = require('express');
/** @type {import('express').Router} */
const router = express.Router();
const { authenticate } = require('../middleware/auth');

const {
  getSellerProducts,
  getSellerProductById
} = require('../controllers/sellerProductsController');
const {
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/products');

// GET all products for the authenticated seller
router.get('/', authenticate, getSellerProducts);

// GET a specific product by ID for the authenticated seller
router.get('/:id', authenticate, getSellerProductById);

// POST create a new product (seller only)
router.post('/', authenticate, createProduct);

// PUT update a product (seller only)
router.put('/:id', authenticate, updateProduct);

// DELETE a product (seller only)
router.delete('/:id', authenticate, deleteProduct);

module.exports = router;