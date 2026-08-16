const express = require('express');
/** @type {import('express').Router} */
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");

const {
    getCustomerOrder,
    createCustomerOrder,
    updateCustomerOrder,
    deleteCustomerOrder,
    getAllOrders 
  } = require('../controllers/customer_orders');

  router.use(authenticate);

  router.route('/')
  .get(authorize("ADMIN"), getAllOrders)
  .post(createCustomerOrder);

  router.route('/:id')
  .get(getCustomerOrder)
  .put(updateCustomerOrder) 
  .delete(deleteCustomerOrder); 


  module.exports = router;
