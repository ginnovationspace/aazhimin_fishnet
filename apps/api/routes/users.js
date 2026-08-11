const express = require('express');
/** @type {import('express').Router} */
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

const {
    getUser,
    createUser,
    updateUser,
    deleteUser,
    getAllUsers,
    getUserByEmail
  } = require('../controllers/users');

  // Protect all user management routes with authentication and admin authorization
  router.use(authenticate, authorize("ADMIN"));

  router.route('/')
  .get(getAllUsers)
  .post(createUser);

  router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

  router.route('/email/:email')
  .get(getUserByEmail);


  module.exports = router;