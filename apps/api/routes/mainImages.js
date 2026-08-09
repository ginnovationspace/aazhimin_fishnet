const express = require("express");
/** @type {import('express').Router} */
const router = express.Router();
const { uploadMainImage } = require("../controllers/mainImages");

router.route("/").post(uploadMainImage);

module.exports = router;
