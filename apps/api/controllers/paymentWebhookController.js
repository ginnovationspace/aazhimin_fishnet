const { asyncHandler, AppError } = require("../middleware/errorHandler");
const paymentService = require("../services/paymentService");

// Handle Stripe webhook events
const handleStripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    throw new AppError("Stripe signature header is missing", 400);
  }

  let event;

  try {
    event = await paymentService.handleWebhook(req.rawBody, sig);
  } catch (err) {
    console.error(`��⚠��️  Webhook signature verification failed.`, err.message);
    throw new AppError(`Webhook Error: ${err.message}`, 400);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
});

module.exports = {
  handleStripeWebhook
};