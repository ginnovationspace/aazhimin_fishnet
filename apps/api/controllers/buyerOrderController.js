const prisma = require("@aazhimin/database");
const { asyncHandler, AppError } = require("../middleware/errorHandler");
const { authenticate, authorize } = require("../middleware/auth");

// Get all buyer orders for a user (with optional status filter)
const getBuyerOrders = asyncHandler(async (req, res) => {
  // Authenticate the user
  await authenticate(req, res, () => {});

  const { status } = req.query;
  const userId = req.user.id;

  // Build where clause
  const whereClause = {
    userId: userId
  };

  if (status) {
    whereClause.status = status;
  }

  // Fetch buyer orders with related data
  const buyerOrders = await prisma.marketplaceOrder.findMany({
    where: whereClause,
    include: {
      sellerOrders: {
        include: {
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
        }
      },
      payments: true
    },
    orderBy: {
      placedAt: 'desc'
    }
  });

  // Transform the data to include tracking information and format for frontend
  const formattedOrders = buyerOrders.map(order => ({
    id: order.id,
    status: order.status,
    totalAmount: order.totalAmount,
    placedAt: order.placedAt,
    buyerName: order.buyerName,
    buyerLastname: order.buyerLastname,
    buyerEmail: order.buyerEmail,
    buyerPhone: order.buyerPhone,
    sellerOrders: order.sellerOrders.map(sellerOrder => ({
      id: sellerOrder.id,
      status: sellerOrder.status,
      totalAmount: sellerOrder.totalAmount,
      merchant: {
        id: sellerOrder.merchant.id,
        name: sellerOrder.merchant.name
      },
      orderItems: sellerOrder.orderItems.map(item => ({
        id: item.id,
        product: {
          id: item.product.id,
          title: item.product.title,
          mainImage: item.product.mainImage
        },
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      }))
    })),
    payments: order.payments.map(payment => ({
      id: payment.id,
      amount: payment.amount,
      status: payment.status,
      method: payment.method,
      transactionId: payment.transactionId,
      createdAt: payment.createdAt
    }))
  }));

  res.json(formattedOrders);
});

// Get a specific buyer order by ID
const getBuyerOrderById = asyncHandler(async (req, res) => {
  // Authenticate the user
  await authenticate(req, res, () => {});

  const { orderId } = req.params;
  const userId = req.user.id;

  // Validate orderId
  if (!orderId) {
    throw new AppError("Order ID is required", 400);
  }

  // Find the buyer order
  const buyerOrder = await prisma.marketplaceOrder.findUnique({
    where: { id: orderId },
    include: {
      sellerOrders: {
        include: {
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
        }
      },
      payments: true,
      refunds: true,
      disputes: true
    }
  });

  if (!buyerOrder) {
    throw new AppError("Order not found", 404);
  }

  // Authorization: user must be the owner of this order or an admin
  if (buyerOrder.userId !== userId && req.user.role !== "ADMIN") {
    throw new AppError("Unauthorized to access this order", 403);
  }

  // Transform the data to include tracking information and format for frontend
  const formattedOrder = {
    id: buyerOrder.id,
    status: buyerOrder.status,
    totalAmount: buyerOrder.totalAmount,
    placedAt: buyerOrder.placedAt,
    buyerName: buyerOrder.buyerName,
    buyerLastname: buyerOrder.buyerLastname,
    buyerEmail: buyerOrder.buyerEmail,
    buyerPhone: buyerOrder.buyerPhone,
    buyerAddress: buyerOrder.buyerAddress,
    buyerApartment: buyerOrder.buyerApartment,
    buyerPostalCode: buyerOrder.buyerPostalCode,
    buyerCity: buyerOrder.buyerCity,
    buyerCountry: buyerOrder.buyerCountry,
    orderNotice: buyerOrder.orderNotice,
    sellerOrders: buyerOrder.sellerOrders.map(sellerOrder => ({
      id: sellerOrder.id,
      status: sellerOrder.status,
      totalAmount: sellerOrder.totalAmount,
      merchant: {
        id: sellerOrder.merchant.id,
        name: sellerOrder.merchant.name
      },
      orderItems: sellerOrder.orderItems.map(item => ({
        id: item.id,
        product: {
          id: item.product.id,
          title: item.product.title,
          mainImage: item.product.mainImage
        },
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      }))
    })),
    payments: buyerOrder.payments.map(payment => ({
      id: payment.id,
      amount: payment.amount,
      status: payment.status,
      method: payment.method,
      transactionId: payment.transactionId,
      createdAt: payment.createdAt
    })),
    refunds: buyerOrder.refunds.map(refund => ({
      id: refund.id,
      amount: refund.amount,
      reason: refund.reason,
      status: refund.status,
      createdAt: refund.createdAt
    })),
    disputes: buyerOrder.disputes.map(dispute => ({
      id: dispute.id,
      reason: dispute.reason,
      status: dispute.status,
      createdAt: dispute.createdAt
    }))
  };

  res.json(formattedOrder);
});

module.exports = {
  getBuyerOrders,
  getBuyerOrderById
};