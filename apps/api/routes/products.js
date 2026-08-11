const express = require("express");
/** @type {import('express').Router} */
const router = express.Router();
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductById,
} = require("../controllers/products");
const { authenticate, authorize } = require("../middleware/auth");

// Get all products (public)
router.route("/").get(getAllProducts).post(authenticate, authorize("SELLER", "ADMIN"), createProduct);
// Get a specific product by ID (public)
router.route("/:id")
  .get(getProductById)
  .put(authenticate, authorize("SELLER", "ADMIN"), updateProduct)
  .delete(authenticate, authorize("SELLER", "ADMIN"), deleteProduct);

module.exports = router;
