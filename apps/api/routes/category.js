const express = require("express");
/** @type {import('express').Router} */
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");

const {
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
} = require("../controllers/category");

router.route("/").get(getAllCategories).post(authenticate, authorize("ADMIN"), createCategory);

router
  .route("/:id")
  .get(getCategory)
  .put(authenticate, authorize("ADMIN"), updateCategory)
  .delete(authenticate, authorize("ADMIN"), deleteCategory);

module.exports = router;
