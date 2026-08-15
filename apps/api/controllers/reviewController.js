const prisma = require("@fishnet/database");
const { asyncHandler, AppError } = require("../middleware/errorHandler");
const { authenticate, authorize } = require("../middleware/auth");

// Get reviews for a product
const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { limit = 10, offset = 0 } = req.query;

  // Validate productId
  if (!productId) {
    throw new AppError("Product ID is required", 400);
  }

  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true }
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  // Get reviews for the product
  const reviews = await prisma.review.findMany({
    where: { productId: productId },
    include: {
      buyer: {
        select: {
          id: true,
          email: true
        }
      },
      orderItem: {
        include: {
          product: {
            select: {
              id: true,
              title: true
            }
          }
        }
      }
    },
    take: parseInt(limit),
    skip: parseInt(offset),
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Format reviews for frontend
  const formattedReviews = reviews.map(review => ({
    id: review.id,
    productQuality: review.productQuality,
    accuracy: review.accuracy,
    sellerCommunication: review.sellerCommunication,
    delivery: review.delivery,
    overallExperience: review.overallExperience,
    comment: review.comment,
    createdAt: review.createdAt,
    buyer: {
      id: review.buyer.id,
      email: review.buyer.email
    },
    orderItem: {
      product: {
        id: review.orderItem.product.id,
        title: review.orderItem.product.title
      }
    }
  }));

  // Get total count for pagination
  const totalCount = await prisma.review.count({
    where: { productId: productId }
  });

  res.json({
    reviews: formattedReviews,
    pagination: {
      total: totalCount,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: totalCount > (parseInt(offset) + parseInt(limit))
    }
  });
});

// Create a review for an order item (verified purchase only)
const createReview = asyncHandler(async (req, res) => {
  // Authenticate the user
  await authenticate(req, res, () => {});

  const { orderItemId, productQuality, accuracy, sellerCommunication, delivery, overallExperience, comment } = req.body;
  const userId = req.user.id;

  // Validate required fields
  if (!orderItemId) {
    throw new AppError("Order item ID is required", 400);
  }
  if (!productQuality || productQuality < 1 || productQuality > 5) {
    throw new AppError("Product quality rating is required and must be between 1 and 5", 400);
  }
  if (!accuracy || accuracy < 1 || accuracy > 5) {
    throw new AppError("Accuracy rating is required and must be between 1 and 5", 400);
  }
  if (!sellerCommunication || sellerCommunication < 1 || sellerCommunication > 5) {
    throw new AppError("Seller communication rating is required and must be between 1 and 5", 400);
  }
  if (!delivery || delivery < 1 || delivery > 5) {
    throw new AppError("Delivery rating is required and must be between 1 and 5", 400);
  }
  if (!overallExperience || overallExperience < 1 || overallExperience > 5) {
    throw new AppError("Overall experience rating is required and must be between 1 and 5", 400);
  }

  // Check if the order item exists and get related data
  const orderItem = await prisma.orderItem.findUnique({
    where: { id: orderItemId },
    include: {
      sellerOrder: {
        include: {
          marketplaceOrder: true
        }
      },
      product: true
    }
  });

  if (!orderItem) {
    throw new AppError("Order item not found", 404);
  }

  // Verify that the authenticated user is the buyer of this order item
  const marketplaceOrder = orderItem.sellerOrder.marketplaceOrder;
  if (marketplaceOrder.userId !== userId) {
    throw new AppError("You can only review items from your own orders", 403);
  }

  // Verify that the order has been delivered (verified purchase)
  const sellerOrder = orderItem.sellerOrder;
  if (sellerOrder.status !== "DELIVERED") {
    throw new AppError("You can only review items from delivered orders", 400);
  }

  // Check if the user has already reviewed this order item
  const existingReview = await prisma.review.findFirst({
    where: {
      orderItemId: orderItemId,
      buyerId: userId
    }
  });

  if (existingReview) {
    throw new AppError("You have already reviewed this item", 409);
  }

  // Create the review
  const review = await prisma.review.create({
    data: {
      orderItemId: orderItemId,
      buyerId: userId,
      productId: orderItem.productId,
      productQuality: productQuality,
      accuracy: accuracy,
      sellerCommunication: sellerCommunication,
      delivery: delivery,
      overallExperience: overallExperience,
      comment: comment || null
    }
  });

  // Update product rating (optional - you could calculate this separately)
  // For simplicity, we'll just create the review and let a separate process update product ratings

  res.status(201).json({
    message: "Review created successfully",
    review: {
      id: review.id,
      productQuality: review.productQuality,
      accuracy: review.accuracy,
      sellerCommunication: review.sellerCommunication,
      delivery: review.delivery,
      overallExperience: review.overallExperience,
      comment: review.comment,
      createdAt: review.createdAt
    }
  });
});

// Get reviews by a user (for buyer's review history)
const getUserReviews = asyncHandler(async (req, res) => {
  // Authenticate the user
  await authenticate(req, res, () => {});

  const userId = req.user.id;
  const { limit = 10, offset = 0 } = req.query;

  // Get reviews by the user
  const reviews = await prisma.review.findMany({
    where: { buyerId: userId },
    include: {
      orderItem: {
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
    take: parseInt(limit),
    skip: parseInt(offset),
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Format reviews for frontend
  const formattedReviews = reviews.map(review => ({
    id: review.id,
    productQuality: review.productQuality,
    accuracy: review.accuracy,
    sellerCommunication: review.sellerCommunication,
    delivery: review.delivery,
    overallExperience: review.overallExperience,
    comment: review.comment,
    createdAt: review.createdAt,
    orderItem: {
      product: {
        id: review.orderItem.product.id,
        title: review.orderItem.product.title,
        mainImage: review.orderItem.product.mainImage
      }
    }
  }));

  // Get total count for pagination
  const totalCount = await prisma.review.count({
    where: { buyerId: userId }
  });

  res.json({
    reviews: formattedReviews,
    pagination: {
      total: totalCount,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: totalCount > (parseInt(offset) + parseInt(limit))
    }
  });
});

module.exports = {
  getProductReviews,
  createReview,
  getUserReviews
};