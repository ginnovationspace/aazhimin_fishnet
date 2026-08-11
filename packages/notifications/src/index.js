"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderUpdateNotification = createOrderUpdateNotification;
// SendGrid email notification service
const mail_1 = __importDefault(require("@sendgrid/mail"));
// Initialize SendGrid with API key from environment variables
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@aazhimin.com';
const FROM_NAME = process.env.FROM_NAME || 'Aazhimin Fishnet';
if (SENDGRID_API_KEY) {
    mail_1.default.setApiKey(SENDGRID_API_KEY);
}
/**
 * Create and send an order update notification via email
 * @param userEmail - The user's email address
 * @param userId - The user's ID (optional, for logging)
 * @param status - The order status (confirmed, processing, shipped, delivered, etc.)
 * @param orderId - The order ID
 * @param total - The order total amount
 */
async function createOrderUpdateNotification(userEmail, userId, status, orderId, total) {
    try {
        // Define email content based on status
        let subject;
        let text;
        let html;
        switch (status.toLowerCase()) {
            case 'confirmed':
                subject = `Order Confirmation #${orderId}`;
                text = `Thank you for your order! Your order #${orderId} has been confirmed. Total amount: ₹${total.toFixed(2)}. We'll notify you when it ships.`;
                html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Order Confirmation</h2>
            <p>Thank you for your order!</p>
            <p>Your order <strong>#${orderId}</strong> has been confirmed.</p>
            <p><strong>Total amount:</strong> ₹${total.toFixed(2)}</p>
            <p>We'll notify you when your order ships.</p>
            <hr style="border: 1px solid #eee;">
            <p style="font-size: 0.9em; color: #7f8c8d;">Aazhimin Fishnet</p>
          </div>
        `;
                break;
            case 'processing':
                subject = `Order Processing #${orderId}`;
                text = `Your order #${orderId} is now being processed. Total amount: ₹${total.toFixed(2)}.`;
                html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Order Processing</h2>
            <p>Your order <strong>#${orderId}</strong> is now being processed.</p>
            <p><strong>Total amount:</strong> ₹${total.toFixed(2)}</p>
            <p>Our team is preparing your items for shipment.</p>
            <hr style="border: 1px solid #eee;">
            <p style="font-size: 0.9em; color: #7f8c8d;">Aazhimin Fishnet</p>
          </div>
        `;
                break;
            case 'shipped':
                subject = `Order Shipped #${orderId}`;
                text = `Great news! Your order #${orderId} has been shipped. Total amount: ₹${total.toFixed(2)}.`;
                html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #27ae60;">Order Shipped</h2>
            <p>Great news! Your order <strong>#${orderId}</strong> has been shipped.</p>
            <p><strong>Total amount:</strong> ₹${total.toFixed(2)}</p>
            <p>You'll receive another notification when it's delivered.</p>
            <hr style="border: 1px solid #eee;">
            <p style="font-size: 0.9em; color: #7f8c8d;">Aazhimin Fishnet</p>
          </div>
        `;
                break;
            case 'delivered':
                subject = `Order Delivered #${orderId}`;
                text = `Your order #${orderId} has been delivered. Total amount: ₹${total.toFixed(2)}. We hope you enjoy your purchase!`;
                html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #27ae60;">Order Delivered</h2>
            <p>Your order <strong>#${orderId}</strong> has been delivered.</p>
            <p><strong>Total amount:</strong> ₹${total.toFixed(2)}</p>
            <p>We hope you enjoy your purchase!</p>
            <p>Please consider leaving a review for the products you received.</p>
            <hr style="border: 1px solid #eee;">
            <p style="font-size: 0.9em; color: #7f8c8d;">Aazhimin Fishnet</p>
          </div>
        `;
                break;
            case 'cancelled':
                subject = `Order Cancelled #${orderId}`;
                text = `Your order #${orderId} has been cancelled. Total amount: ₹${total.toFixed(2)}.`;
                html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #e74c3c;">Order Cancelled</h2>
            <p>Your order <strong>#${orderId}</strong> has been cancelled.</p>
            <p><strong>Total amount:</strong> ₹${total.toFixed(2)}</p>
            <p>If you have any questions, please contact our support team.</p>
            <hr style="border: 1px solid #eee;">
            <p style="font-size: 0.9em; color: #7f8c8d;">Aazhimin Fishnet</p>
          </div>
        `;
                break;
            default:
                subject = `Order Update #${orderId}`;
                text = `Your order #${orderId} status has been updated to: ${status}. Total amount: ₹${total.toFixed(2)}.`;
                html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3498db;">Order Update</h2>
            <p>Your order <strong>#${orderId}</strong> status has been updated to: <strong>${status}</strong>.</p>
            <p><strong>Total amount:</strong> ₹${total.toFixed(2)}</p>
            <hr style="border: 1px solid #eee;">
            <p style="font-size: 0.9em; color: #7f8c8d;">Aazhimin Fishnet</p>
          </div>
        `;
        }
        // Send the email
        const msg = {
            to: userEmail,
            from: {
                email: FROM_EMAIL,
                name: FROM_NAME
            },
            subject: subject,
            text: text,
            html: html
        };
        await mail_1.default.send(msg);
        console.log(`Order notification email sent successfully to ${userEmail} for order #${orderId} with status: ${status}`);
    }
    catch (error) {
        console.error('Failed to send order notification email:', error);
        // Re-throw the error so the calling function can handle it appropriately
        throw error;
    }
}
//# sourceMappingURL=index.js.map