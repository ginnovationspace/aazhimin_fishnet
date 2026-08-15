const prisma = require("@fishnet/database");
const { asyncHandler, AppError } = require("../middleware/errorHandler");
const { authenticate } = require("../middleware/auth");

// Get all products for the authenticated seller's merchant
const getSellerProducts = asyncHandler(async (req, res) => {
  // Authenticate the user
  await authenticate(req, res, () => {});

  const userId = req.user.id;

  // Find merchant for this user
  const merchant = await prisma.merchant.findUnique({
    where: { userId },
  });

  if (!merchant) {
    throw new AppError("Merchant profile not found", 404);
  }

  // Get products for this merchant
  const products = await prisma.product.findMany({
    where: { merchantId: merchant.id },
    include: {
      category: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.json(products);
});

// Get a specific product by ID for the authenticated seller
const getSellerProductById = asyncHandler(async (req, res) => {
  // Authenticate the user
  await authenticate(req, res, () => {});

  const { id } = req.params;
  const userId = req.user.id;

  if (!id) {
    throw new AppError("Product ID is required", 400);
  }

  // Find merchant for this user
  const merchant = await prisma.merchant.findUnique({
    where: { userId },
  });

  if (!merchant) {
    throw new AppError("Merchant profile not found", 404);
  }

  // Find the product and verify it belongs to the seller's merchant
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: {
        select: {
          name: true,
        },
      },
      merchant: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  // Authorization: check if product belongs to user's merchant
  if (product.merchantId !== merchant.id) {
    throw new AppError("Unauthorized to access this product", 403);
  }

  res.json(product);
});

module.exports = {
  getSellerProducts,
  getSellerProductById,
};