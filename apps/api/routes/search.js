const express = require("express");
/** @type {import('express').Router} */
const router = express.Router();
const { searchProducts } = require("../controllers/search");

router.route("/").get(searchProducts);

module.exports = router;
