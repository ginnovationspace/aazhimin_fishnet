/**
 * Stripe Payment Service
 * This service provides a unified interface for Stripe payment processing.
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const prisma = require("@aazhimin/database");

// Stripe webhook secret for verifying webhook signatures
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Stripe Payment Service Class
 * Provides high-level payment operations using Stripe
 */
class StripePaymentService {
  /**
   * Create a payment intent with Stripe
   * @param {Object} data - Payment data
   * @param {string} data.marketplaceOrderId - ID of the marketplace order
   * @param {number} data.amount - Amount in currency subunits (e.g., cents)
   * @param {string} data.currency - Currency code (default: INR)
   * @param {string} data.paymentMethodId - Stripe payment method ID
   * @returns {Promise<Object>} Created payment intent and record
   */
  async createPaymentIntent(data) {
    try {
      const { marketplaceOrderId, amount, currency = "inr", paymentMethodId } = data;

      // Validate input
      if (!marketplaceOrderId) {
        throw new Error("Marketplace order ID is required");
      }
      if (!amount || amount <= 0) {
        throw new Error("Valid amount is required");
      }
      if (!paymentMethodId) {
        throw new Error("Payment method ID is required");
      }

      // Verify the marketplace order exists
      const order = await prisma.marketplaceOrder.findUnique({
        where: { id: marketplaceOrderId }
      });

      if (!order) {
        throw new Error("Marketplace order not found");
      }

      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: currency.toLowerCase(),
        automatic_payment_methods: {
          enabled: true,
        },
        description: `Payment for marketplace order #${marketplaceOrderId}`,
        metadata: {
          marketplaceOrderId: marketplaceOrderId
        }
      });

      // Create payment record in PENDING status
      const paymentRecord = await prisma.payment.create({
        data: {
          marketplaceOrderId,
          amount,
          status: "PENDING",
          method: "card",
          transactionId: paymentIntent.id, // Stripe PaymentIntent ID
          gatewayResponse: {
            client_secret: paymentIntent.client_secret,
            id: paymentIntent.id,
            object: paymentIntent.object,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            status: paymentIntent.status
          }
        }
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentId: paymentRecord.id,
        status: paymentRecord.status
      };
    } catch (error) {
      console.error("Error in stripe payment service createPaymentIntent:", error);
      throw error;
    }
  }

  /**
   * Confirm a payment intent with Stripe
   * @param {string} paymentId - Internal payment ID
   * @param {string} paymentMethodId - Stripe payment method ID
   * @returns {Promise<Object>} Confirmation result
   */
  async confirmPayment(paymentId, paymentMethodId) {
    try {
      // Get payment record
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId }
      });

      if (!payment) {
        throw new Error("Payment record not found");
      }

      // Confirm the PaymentIntent with Stripe
      const paymentIntent = await stripe.paymentIntents.confirm(
        payment.transactionId, // This is the Stripe PaymentIntent ID
        {
          payment_method: paymentMethodId
        }
      );

      // Update payment record based on confirmation result
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: paymentIntent.status === "succeeded" ? "PAID" :
                   paymentIntent.status === "processing" ? "PROCESSING" : "FAILED",
          gatewayResponse: {
            ...payment.gatewayResponse,
            id: paymentIntent.id,
            object: paymentIntent.object,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            status: paymentIntent.status
          }
        }
      });

      return {
        success: paymentIntent.status === "succeeded",
        paymentId: payment.id,
        status: updatedPayment.status,
        transactionId: payment.transactionId,
        amount: payment.amount,
        confirmedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error in stripe payment service confirmPayment:", error);
      throw error;
    }
  }

  /**
   * Retrieve a payment intent from Stripe
   * @param {string} paymentId - Internal payment ID
   * @returns {Promise<Object>} Payment intent details
   */
  async retrievePayment(paymentId) {
    try {
      // Get payment record
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId }
      });

      if (!payment) {
        throw new Error("Payment record not found");
      }

      // Retrieve the PaymentIntent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(payment.transactionId);

      // Update payment record with latest status from Stripe
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: paymentIntent.status === "succeeded" ? "PAID" :
                   paymentIntent.status === "processing" ? "PROCESSING" :
                   paymentIntent.status === "requires_payment_method" ||
                   paymentIntent.status === "requires_confirmation" ||
                   paymentIntent.status === "requires_action" ? "PENDING" : "FAILED",
          gatewayResponse: {
            id: paymentIntent.id,
            object: paymentIntent.object,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            status: paymentIntent.status
          }
        }
      });

      return {
        success: true,
        paymentId: payment.id,
        status: updatedPayment.status,
        transactionId: payment.transactionId,
        amount: payment.amount,
        method: payment.method,
        retrievedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error in stripe payment service retrievePayment:", error);
      throw error;
    }
  }

  /**
   * Refund a payment through Stripe
   * @param {string} paymentId - Internal payment ID
   * @param {number} amount - Amount to refund (in currency subunits, optional for full refund)
   * @returns {Promise<Object>} Refund result
   */
  async refundPayment(paymentId, amount) {
    try {
      // Get payment record
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId }
      });

      if (!payment) {
        throw new Error("Payment record not found");
      }

      // Check if payment can be refunded
      if (payment.status !== "PAID") {
        throw new Error("Only paid payments can be refunded");
      }

      const refundAmount = amount !== null && amount !== undefined ? amount : payment.amount;

      if (refundAmount <= 0) {
        throw new Error("Refund amount must be greater than zero");
      }

      if (refundAmount > payment.amount) {
        throw new Error("Refund amount cannot exceed original payment amount");
      }

      // Create a refund through Stripe
      const stripeRefund = await stripe.refunds.create({
        payment_intent: payment.transactionId, // This is the Stripe PaymentIntent ID
        amount: refundAmount
      });

      // Create refund record
      const refundRecord = await prisma.refund.create({
        data: {
          paymentId: payment.id,
          marketplaceOrderId: payment.marketplaceOrderId,
          amount: refundAmount,
          reason: "Customer requested refund",
          status: stripeRefund.status === "succeeded" ? "PAID" : "PENDING"
        }
      });

      // Update payment status to REFUNDED or PARTIALLY_REFUNDED
      const newStatus = refundAmount === payment.amount ? "REFUNDED" : "PARTIALLY_REFUNDED";
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: newStatus }
      });

      return {
        success: true,
        paymentId: payment.id,
        refundId: refundRecord.id,
        amount: refundAmount,
        status: newStatus,
        stripeRefundId: stripeRefund.id,
        processedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error in stripe payment service refundPayment:", error);
      throw error;
    }
  }

  /**
   * Get payment status
   * @param {string} paymentId - Internal payment ID
   * @returns {Promise<Object>} Payment status
   */
  async getPaymentStatus(paymentId) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId }
      });

      if (!payment) {
        throw new Error("Payment record not found");
      }

      return {
        success: true,
        paymentId: payment.id,
        status: payment.status,
        amount: payment.amount,
        method: payment.method,
        transactionId: payment.transactionId,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt
      };
    } catch (error) {
      console.error("Error in stripe payment service getPaymentStatus:", error);
      throw error;
    }
  }

  /**
   * Handle webhook from Stripe
   * @param {Object} payload - Raw request body
   * @param {string} sig - Stripe signature header
   * @returns {Promise<Object>} Processing result
   */
  async handleWebhook(payload, sig) {
    try {
      let event;

      // Verify webhook signature
      if (STRIPE_WEBHOOK_SECRET) {
        event = stripe.webhooks.constructEvent(payload, sig, STRIPE_WEBHOOK_SECRET);
      } else {
        // In development, we might skip verification (not recommended for production)
        event = JSON.parse(payload);
      }

      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          await this.handlePaymentIntentSucceeded(paymentIntent);
          break;
        case 'payment_intent.payment_failed':
          const failedIntent = event.data.object;
          await this.handlePaymentIntentFailed(failedIntent);
          break;
        // Add more event types as needed
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      // Return a response to acknowledge receipt of the event
      return {
        success: true,
        received: true,
        processedAt: new Date().toISOString(),
        eventType: event.type
      };
    } catch (error) {
      console.error("Error in stripe payment service handleWebhook:", error);
      throw error;
    }
  }

  /**
   * Handle successful payment intent from Stripe webhook
   * @param {Object} paymentIntent - Stripe payment intent object
   * @returns {Promise<void>}
   */
  async handlePaymentIntentSucceeded(paymentIntent) {
    try {
      // Find the payment record by transactionId (Stripe PaymentIntent ID)
      const payment = await prisma.payment.findFirst({
        where: { transactionId: paymentIntent.id }
      });

      if (payment) {
        // Update payment status to PAID
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "PAID",
            gatewayResponse: {
              ...payment.gatewayResponse,
              id: paymentIntent.id,
              status: paymentIntent.status
            }
          }
        });

        // TODO: Update marketplace order status if needed
        // For example, if all payments for an order are PAID, set order status to PAYMENT_CONFIRMED
      }
    } catch (error) {
      console.error("Error handling succeeded payment intent:", error);
      throw error;
    }
  }

  /**
   * Handle failed payment intent from Stripe webhook
   * @param {Object} paymentIntent - Stripe payment intent object
   * @returns {Promise<void>}
   */
  async handlePaymentIntentFailed(paymentIntent) {
    try {
      // Find the payment record by transactionId (Stripe PaymentIntent ID)
      const payment = await prisma.payment.findFirst({
        where: { transactionId: paymentIntent.id }
      });

      if (payment) {
        // Update payment status to FAILED
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "FAILED",
            gatewayResponse: {
              ...payment.gatewayResponse,
              id: paymentIntent.id,
              status: paymentIntent.status
            }
          }
        });

        // TODO: Handle failed payment (notify user, etc.)
      }
    } catch (error) {
      console.error("Error handling failed payment intent:", error);
      throw error;
    }
  }
}

// Export a singleton instance
const stripePaymentService = new StripePaymentService();
module.exports = stripePaymentService;
