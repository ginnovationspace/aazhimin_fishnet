const prisma = require("@aazhimin/database");
const { asyncHandler, AppError } = require("../middleware/errorHandler");
const { authenticate, authorize } = require("../middleware/auth");

// Get products pending moderation
const getProductsPendingModeration = asyncHandler(async (req, res) => {
  // Authenticate and authorize as admin
  await authenticate(req, res, () => {});
  await authorize(req, res, ["ADMIN"]);

  // Get query parameters
  const { page = 1, limit = 10, search = "" } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Build where clause for products that need moderation
  // In a real implementation, we would have a moderation status field
  // For now, we'll use a placeholder approach
  const whereClause = {
    // Placeholder: products that have been reported or need review
    // This would be based on a moderation system in production
    OR: [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } }
    ]
  };

  // Get products
  const products = await prisma.product.findMany({
    where: whereClause,
    include: {
      merchant: {
        select: {
          id: true,
          name: true
        }
      },
      category: {
        select: {
          id: true,
          name: true
        }
      }
    },
    take: limitNum,
    skip: skip,
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Get total count for pagination
  const totalCount = await prisma.product.count({
    where: whereClause
  });

  res.json({
    products: products.map(product => ({
      id: product.id,
      title: product.title,
      description: product.description,
      mainImage: product.mainImage,
      price: product.price,
      merchant: {
        id: product.merchant.id,
        name: product.merchant.name
      },
      category: {
        id: product.category.id,
        name: product.category.name
      },
      createdAt: product.createdAt
    })),
    pagination: {
      total: totalCount,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(totalCount / limitNum)
    }
  });
});

// Moderate a product (approve, reject, flag)
const moderateProduct = asyncHandler(async (req, res) => {
  // Authenticate and authorize as admin
  await authenticate(req, res, () => {});
  await authorize(req, res, ["ADMIN"]);

  const { productId } = req.params;
  const { action, reason } = req.body;

  // Validate productId
  if (!productId) {
    throw new AppError("Product ID is required", 400);
  }

  // Validate action
  const validActions = ["APPROVE", "REJECT", "FLAG"];
  if (!action || !validActions.includes(action)) {
    throw new AppError("Invalid moderation action", 400);
  }

  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      merchant: true
    }
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  // In a real implementation, we would update a moderation status field or create a moderation record
  // For now, we'll just return success (this would be expanded with actual moderation logic)

  // Log the moderation action (in a real system, this would be stored in a database)
  console.log(`Admin ${req.user.id} performed ${action} on product ${productId}. Reason: ${reason || "No reason provided"}`);

  res.json({
    message: `Product ${action.toLowerCase()}d successfully`,
    productId: productId,
    action: action,
    moderatedBy: req.user.id,
    moderatedAt: new Date().toISOString(),
    reason: reason || null
  });
});

// Get users pending moderation
const getUsersPendingModeration = asyncHandler(async (req, res) => {
  // Authenticate and authorize as admin
  await authenticate(req, res, () => {});
  await authorize(req, res, ["ADMIN"]);

  // Get query parameters
  const { page = 1, limit = 10, search = "" } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Build where clause for users that need moderation
  const whereClause = {
    OR: [
      { email: { contains: search, mode: "insensitive" } }
    ]
  };

  // Get users
  const users = await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      email: true,
      role: true,
      merchant: {
        select: {
          id: true,
          name: true,
          verificationStatus: true
        }
      }
    },
    take: limitNum,
    skip: skip,
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Get total count for pagination
  const totalCount = await prisma.user.count({
    where: whereClause
  });

  res.json({
    users: users.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      merchant: user.merchant ? {
        id: user.merchant.id,
        name: user.merchant.name,
        verificationStatus: user.merchant.verificationStatus
      } : null,
      createdAt: user.createdAt
    })),
    pagination: {
      total: totalCount,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(totalCount / limitNum)
    }
  });
});

// Moderate a user (warn, suspend, ban)
const moderateUser = asyncHandler(async (req, res) => {
  // Authenticate and authorize as admin
  await authenticate(req, res, () => {});
  await authorize(req, res, ["ADMIN"]);

  const { userId } = req.params;
  const { action, reason } = req.body;

  // Validate userId
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  // Validate action
  const validActions = ["WARN", "SUSPEND", "BAN"];
  if (!action || !validActions.includes(action)) {
    throw new AppError("Invalid moderation action", 400);
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      merchant: true
    }
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // In a real implementation, we would update user status or create a moderation record
  // For now, we'll just return success (this would be expanded with actual moderation logic)

  // Log the moderation action (in a real system, this would be stored in a database)
  console.log(`Admin ${req.user.id} performed ${action} on user ${userId}. Reason: ${reason || "No reason provided"}`);

  res.json({
    message: `User ${action.toLowerCase()}d successfully`,
    userId: userId,
    action: action,
    moderatedBy: req.user.id,
    moderatedAt: new Date().toISOString(),
    reason: reason || null
  });
});

// Get reported content
const getReportedContent = asyncHandler(async (req, res) => {
  // Authenticate and authorize as admin
  await authenticate(req, res, () => {});
  await authorize(req, res, ["ADMIN"]);

  // Get query parameters
  const { type = "all", page = 1, limit = 10 } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // In a real implementation, we would query a reports table
  // For now, we'll return empty results as a placeholder
  res.json({
    reports: [],
    pagination: {
      total: 0,
      page: pageNum,
      limit: limitNum,
      pages: 0
    }
  });
});

// Resolve a report
const resolveReport = asyncHandler(async (req, res) => {
  // Authenticate and authorize as admin
  await authenticate(req, res, () => {});
  await authorize(req, res, ["ADMIN"]);

  const { reportId } = req.params;
  const { action, notes } = req.body;

  // Validate reportId
  if (!reportId) {
    throw new AppError("Report ID is required", 400);
  }

  // Validate action
  const validActions = ["DISMISS", "WARN_USER", "REMOVE_CONTENT", "SUSPEND_USER"];
  if (!action || !validActions.includes(action)) {
    throw new AppError("Invalid resolution action", 400);
  }

  // In a real implementation, we would update the report status and take appropriate action
  // For now, we'll just return success
  res.json({
    message: `Report resolved with action: ${action}`,
    reportId: reportId,
    action: action,
    resolvedBy: req.user.id,
    resolvedAt: new Date().toISOString(),
    notes: notes || null
  });
});

module.exports = {
  getProductsPendingModeration,
  moderateProduct,
  getUsersPendingModeration,
  moderateUser,
  getReportedContent,
  resolveReport
};