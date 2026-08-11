const express = require('express');
/** @type {import('express').Router} */
const router = express.Router();

const {
  login,
  registerBuyer,
  getCurrentUser,
  logout,
  forgotPassword,
  startGoogleOAuth,
  handleGoogleOAuthCallback,
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Public endpoint for login
router.post('/login', login);

// Public endpoint for buyer registration
router.post('/register', registerBuyer);

// Password reset request
router.post('/forgot-password', forgotPassword);

// Google OAuth browser redirects
router.get('/oauth/google/start', startGoogleOAuth);
router.get('/oauth/google/callback', handleGoogleOAuthCallback);

// Current authenticated user
router.get('/me', authenticate, getCurrentUser);

// Client-side JWT logout acknowledgement
router.post('/logout', authenticate, logout);

// Note: Seller registration is handled in /api/seller/register

module.exports = router;
