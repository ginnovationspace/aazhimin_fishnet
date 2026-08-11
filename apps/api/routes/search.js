const express = require("express");
/** @type {import('express').Router} */
const router = express.Router();
const { searchProducts, getSearchSuggestions } = require("../controllers/search");

router.route("/").get(searchProducts);

// Endpoint for search suggestions
router.route("/suggest").get(getSearchSuggestions);

module.exports = router;