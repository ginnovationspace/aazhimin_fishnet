const prisma = require("@fishnet/database");
const { asyncHandler, AppError } = require("../middleware/errorHandler");
const { authenticate, authorize } = require("../middleware/auth");

// Get all seller orders for a merchant (with optional status filter)
const getSellerOrders = asyncHandler(async (req, res) => {
  // Authenticate the user
  await authenticate(req, res, () => {});

  const { merchantId } = req.query;
  const { status } = req.query;

  // Validate merchantId
  if (!merchantId) {
    throw new AppError("Merchant ID is required", 400);
  }

  // Check if the authenticated user is the merchant or an admin
  const user = req.user;
  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId },
    select: { userId: true }
  });

  if (!merchant) {
    throw new AppError("Merchant not found", 404);
  }

  // Authorization: user must be the seller of this merchant or an admin
  if (merchant.userId !== user.id && user.role !== "ADMIN") {
    throw new AppError("Unauthorized to access these orders", 403);
  }

  // Build where clause
  const whereClause = {
    merchantId: merchantId
  };

  if (status) {
    whereClause.status = status;
  }

  // Fetch seller orders with related data
  const sellerOrders = await prisma.sellerOrder.findMany({
    where: whereClause,
    include: {
      marketplaceOrder: {
        select: {
          id: true,
          status: true,
          buyerName: true,
          buyerLastname: true,
          totalAmount: true
        }
      },
      orderItems: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              mainImage: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.json(sellerOrders);
});

// Update the status of a seller order
const updateSellerOrderStatus = asyncHandler(async (req, res) => {
  // Authenticate the user
  await authenticate(req, res, () => {});

  const { sellerOrderId } = req.params;
  const { status } = req.body;

  // Validate sellerOrderId
  if (!sellerOrderId) {
    throw new AppError("Seller order ID is required", 400);
  }

  // Validate status
  const validStatuses = ["ORDER_PLACED", "PAYMENT_CONFIRMED", "PROCESSING", "READY_TO_SHIP", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "REFUND_REQUESTED", "REFUNDED", "DISPUTED"];
  if (!status || !validStatuses.includes(status)) {
    throw new AppError("Invalid order status", 400);
  }

  // Find the seller order
  const sellerOrder = await prisma.sellerOrder.findUnique({
    where: { id: sellerOrderId },
    include: {
      marketplaceOrder: true,
      merchant: {
        select: {
          userId: true
        }
      }
    }
  });

  if (!sellerOrder) {
    throw new AppError("Seller order not found", 404);
  }

  // Authorization: user must be the seller of this order or an admin
  const user = req.user;
  if (sellerOrder.merchant.userId !== user.id && user.role !== "ADMIN") {
    throw new AppError("Unauthorized to update this order", 403);
  }

  // Update the seller order status
  const updatedSellerOrder = await prisma.sellerOrder.update({
    where: { id: sellerOrderId },
    data: {
      status: status,
      // If status is DELIVERED, set deliveredAt timestamp
      ...(status === "DELIVERED" ? { deliveredAt: new Date() } : {}),
      // If status is SHIPPED, set shippedAt timestamp
      ...(status === "SHIPPED" ? { shippedAt: new Date() } : {})
    }
  });

  // Also update the marketplace order status if all seller orders are in a certain state?
  // For simplicity, we'll leave marketplace order status to be updated by a separate process or based on business rules.
  // In a real implementation, you might want to update the marketplace order based on the status of all its seller orders.

  res.json({
    message: "Seller order status updated successfully",
    sellerOrder: updatedSellerOrder
  });
});

module.exports = {
  getSellerOrders,
  updateSellerOrderStatus
};