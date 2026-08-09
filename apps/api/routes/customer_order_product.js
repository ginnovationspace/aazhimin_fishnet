const express = require('express');
/** @type {import('express').Router} */
const router = express.Router();

const {
    createOrderProduct,
     updateProductOrder,
      deleteProductOrder,
       getProductOrder,
       getAllProductOrders
  } = require('../controllers/customer_order_product');

  router.route('/')
  .get(getAllProductOrders)
  .post(createOrderProduct);

  router.route('/:id')
  .get(getProductOrder)
  .put(updateProductOrder)
  .delete(deleteProductOrder);


  module.exports = router;