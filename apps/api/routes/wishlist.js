const express = require("express");
/** @type {import('express').Router} */
const router = express.Router();

const {
  getAllWishlistByUserId,
  getAllWishlist,
  createWishItem,
  deleteWishItem,
  getSingleProductFromWishlist
} = require("../controllers/wishlist");

router.route("/").get(getAllWishlist).post(createWishItem);

router.route("/:userId").get(getAllWishlistByUserId);
router.route("/:userId/:productId").get(getSingleProductFromWishlist);
router.route("/product/:productId").delete(deleteWishItem);

module.exports = router;
