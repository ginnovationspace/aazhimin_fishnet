const express = require('express');
/** @type {import('express').Router} */
const router = express.Router();

const {
  getProductsPendingModeration,
  moderateProduct,
  getUsersPendingModeration,
  moderateUser,
  getReportedContent,
  resolveReport
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

// Get products pending moderation
router.get('/products/moderation', authenticate, authorize("ADMIN"), getProductsPendingModeration);

// Moderate a product (approve, reject, flag)
router.put('/products/:productId/moderate', authenticate, authorize("ADMIN"), moderateProduct);

// Get users pending moderation
router.get('/users/moderation', authenticate, authorize("ADMIN"), getUsersPendingModeration);

// Moderate a user (warn, suspend, ban)
router.put('/users/:userId/moderate', authenticate, authorize("ADMIN"), moderateUser);

// Get reported content
router.get('/reports', authenticate, authorize("ADMIN"), getReportedContent);

// Resolve a report
router.put('/reports/:reportId/resolve', authenticate, authorize("ADMIN"), resolveReport);

module.exports = router;
