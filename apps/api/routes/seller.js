const express = require('express');
/** @type {import('express').Router} */
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

const {
  sellerRegistration,
  becomeSeller,
  getSellerVerificationStatus,
  updateVerificationDocuments,
  updateVerificationStatus,
  getSellerStats
} = require('../controllers/seller');

// Public endpoint for seller registration
router.post('/register', sellerRegistration);
router.post('/onboarding', authenticate, becomeSeller);

// Protected routes (require authentication)
// GET seller verification status
router.get('/:merchantId/status', authenticate, getSellerVerificationStatus);

// PUT update verification documents (seller)
router.put('/:merchantId/documents', authenticate, updateVerificationDocuments);

// PUT update verification status (admin only)
router.put('/:merchantId/status', authenticate, authorize("ADMIN"), updateVerificationStatus);

// GET seller dashboard stats
router.get('/stats', authenticate, getSellerStats);

module.exports = router;
