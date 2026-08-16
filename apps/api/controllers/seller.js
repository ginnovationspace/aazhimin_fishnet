const prisma = require("@fishnet/database");
const { asyncHandler, handleServerError, AppError } = require("../middleware/errorHandler");
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');

const becomeSeller = asyncHandler(async (request, response) => {
  const { merchantName, merchantDescription, merchantPhone, merchantAddress, verificationDocuments } = request.body;

  if (!merchantName || !merchantName.trim()) {
    throw new AppError("Business name is required", 400);
  }

  const existingMerchant = await prisma.merchant.findUnique({
    where: { userId: request.user.id }
  });

  if (existingMerchant) {
    throw new AppError("This account already has a seller profile", 409);
  }

  const user = await prisma.user.update({
    where: { id: request.user.id },
    data: {
      role: "SELLER",
      merchant: {
        create: {
          name: merchantName.trim(),
          description: merchantDescription?.trim() || null,
          phone: merchantPhone?.trim() || null,
          address: merchantAddress?.trim() || null,
          verificationStatus: "APPROVED",
          verificationDocuments: verificationDocuments || null,
          verificationSubmittedAt: new Date(),
          verificationReviewedAt: new Date()
        }
      }
    },
    select: {
      id: true,
      email: true,
      role: true,
      merchant: { select: { id: true, name: true, verificationStatus: true } }
    }
  });

  return response.status(201).json({
    message: "Seller account created successfully",
    token: generateToken(user),
    user
  });
});

const sellerRegistration = asyncHandler(async (request, response) => {
  const {
    email,
    password,
    merchantName,
    merchantDescription,
    merchantPhone,
    merchantAddress,
    verificationDocuments,
  } = request.body;
  const normalizedEmail = String(email || "").trim().toLowerCase();

  const normalizedMerchantName = String(merchantName || "").trim();

  if (!normalizedEmail || !password || !normalizedMerchantName) {
    throw new AppError("Email, password, and business name are required", 400);
  }

  if (password.length < 8) {
    throw new AppError("Password must be at least 8 characters long", 400);
  }

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    throw new AppError("Email already in use. Sign in to add a seller profile.", 409);
  }

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      password: await bcrypt.hash(password, 12),
      role: "SELLER",
      merchant: {
        create: {
          name: normalizedMerchantName,
          description: merchantDescription?.trim() || null,
          phone: merchantPhone?.trim() || null,
          address: merchantAddress?.trim() || null,
          verificationStatus: "APPROVED",
          verificationDocuments: verificationDocuments || null,
          verificationSubmittedAt: new Date(),
          verificationReviewedAt: new Date(),
        },
      },
    },
    select: {
      id: true,
      email: true,
      role: true,
      merchant: { select: { id: true, name: true, verificationStatus: true, status: true } },
    },
  });

  return response.status(201).json({
    message: "Seller account created successfully",
    token: generateToken(user),
    user,
  });
});

// Get seller verification status (for seller dashboard)
const getSellerVerificationStatus = asyncHandler(async (request, response) => {
  try {
    const { merchantId } = request.params;
    const userId = request.user.id;

    // Find the merchant
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
      select: {
        id: true,
        verificationStatus: true,
        verificationSubmittedAt: true,
        verificationReviewedAt: true,
        verificationNotes: true,
        verificationDocuments: true,
        status: true,
        userId: true
      }
    });

    if (!merchant) {
      throw new AppError("Merchant not found", 404);
    }

    // Authorization: user must be the owner of this merchant or an admin
    if (merchant.userId !== userId && request.user.role !== "ADMIN") {
      throw new AppError("Unauthorized to access this merchant's verification status", 403);
    }

    // Don't return userId in the response for security
    const { userId: _, ...merchantWithoutUserId } = merchant;
    return response.json(merchantWithoutUserId);
  } catch (error) {
    console.error("Error fetching seller verification status:", error);
    if (error.code === 'P2025') {
      throw new AppError("Merchant not found", 404);
    }
    throw error;
  }
});

// Update verification documents (seller can upload documents)
const updateVerificationDocuments = asyncHandler(async (request, response) => {
  try {
    const { merchantId } = request.params;
    const userId = request.user.id;
    const { verificationDocuments } = request.body;

    // Find the merchant
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
      select: {
        id: true,
        verificationStatus: true,
        verificationDocuments: true,
        userId: true
      }
    });

    if (!merchant) {
      throw new AppError("Merchant not found", 404);
    }

    // Authorization: user must be the owner of this merchant
    if (merchant.userId !== userId) {
      throw new AppError("Unauthorized to update verification documents for this merchant", 403);
    }

    // Only allow update if verification is pending or rejected
    if (merchant.verificationStatus !== "PENDING" && merchant.verificationStatus !== "REJECTED") {
      throw new AppError("Cannot update verification documents at this stage", 400);
    }

    const updatedMerchant = await prisma.merchant.update({
      where: { id: merchantId },
      data: {
        verificationDocuments: verificationDocuments,
        verificationStatus: "PENDING", // Reset to pending when documents are updated
        verificationSubmittedAt: new Date(),
        verificationReviewedAt: null,
        verificationNotes: null,
      }
    });

    return response.json({
      message: "Verification documents updated successfully",
      merchant: updatedMerchant
    });
  } catch (error) {
    console.error("Error updating verification documents:", error);
    if (error.code === 'P2025') {
      throw new AppError("Merchant not found", 404);
    }
    throw error;
  }
});

// Admin: Update verification status (approve/reject/suspend)
const updateVerificationStatus = asyncHandler(async (request, response) => {
  try {
    const { merchantId } = request.params;
    const { verificationStatus, verificationNotes } = request.body;

    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId }
    });

    if (!merchant) {
      throw new AppError("Merchant not found", 404);
    }

    // Validate verification status
    const validStatuses = ["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "SUSPENDED"];
    if (!validStatuses.includes(verificationStatus)) {
      throw new AppError("Invalid verification status", 400);
    }

    const updatedMerchant = await prisma.merchant.update({
      where: { id: merchantId },
      data: {
        verificationStatus,
        verificationReviewedAt: verificationStatus !== "PENDING" ? new Date() : null,
        verificationNotes: verificationNotes || null,
        // Also update merchant status if suspended
        status: verificationStatus === "SUSPENDED" ? "INACTIVE" : "ACTIVE"
      }
    });

    // Notify seller via email/notification (we'll implement notification later)
    // For now, just log
    console.log(`Merchant ${merchantId} verification status updated to ${verificationStatus}`);

    return response.json({
      message: `Verification status updated to ${verificationStatus}`,
      merchant: updatedMerchant
    });
  } catch (error) {
    console.error("Error updating verification status:", error);
    if (error.code === 'P2025') {
      throw new AppError("Merchant not found", 404);
    }
    throw error;
  }
});

// Get seller dashboard stats
const getSellerStats = asyncHandler(async (request, response) => {
  try {
    const userId = request.user.id;

    // Find the merchant for this user
    const merchant = await prisma.merchant.findUnique({
      where: { userId }
    });

    if (!merchant) {
      throw new AppError("Merchant profile not found", 404);
    }

    // Get stats using raw queries for better performance
    const [totalProducts, activeProducts, pendingOrders, completedOrders, balance, monthlyRevenue, pendingPayouts, averageRating] = await Promise.all([
      // Total products
      prisma.product.count({
        where: { merchantId: merchant.id }
      }),
      // Active products (in stock)
      prisma.product.count({
        where: {
          merchantId: merchant.id,
          inStock: {
            gt: 0
          }
        }
      }),
      // Pending seller orders
      prisma.sellerOrder.count({
        where: {
          merchantId: merchant.id,
          status: {
            in: ["ORDER_PLACED", "PAYMENT_CONFIRMED", "PROCESSING", "READY_TO_SHIP"]
          }
        }
      }),
      // Completed orders
      prisma.sellerOrder.count({
        where: {
          merchantId: merchant.id,
          status: "DELIVERED"
        }
      }),
      // Balance (sum of completed order amounts)
      prisma.sellerOrder.aggregate({
        where: {
          merchantId: merchant.id,
          status: "DELIVERED"
        },
        _sum: {
          totalAmount: true
        }
      }).then(result => result._sum.totalAmount || 0),
      // Monthly revenue (current month)
      prisma.sellerOrder.aggregate({
        where: {
          merchantId: merchant.id,
          status: "DELIVERED",
          marketplaceOrder: {
            placedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        },
        _sum: {
          totalAmount: true
        }
      }).then(result => result._sum.totalAmount || 0),
      // Pending payouts (could be same as balance or calculated differently)
      prisma.sellerOrder.aggregate({
        where: {
          merchantId: merchant.id,
          status: {
            in: ["DELIVERED", "SHIPPED"]
          },
          payout: {
            is: {
              status: "PENDING"
            }
          }
        },
        _sum: {
          totalAmount: true
        }
      }).then(result => result._sum.totalAmount || 0),
      // Average rating
      prisma.review.aggregate({
        where: {
          product: {
            merchantId: merchant.id
          }
        },
        _avg: {
          overallExperience: true
        }
      }).then(result => result._avg.overallExperience || 0)
    ]);

    return response.json({
      totalProducts,
      activeProducts,
      pendingOrders,
      completedOrders,
      balance: Number(balance) || 0,
      monthlyRevenue: Number(monthlyRevenue) || 0,
      pendingPayouts: Number(pendingPayouts) || 0,
      averageRating: Number(averageRating) || 0
    });
  } catch (error) {
    console.error("Error fetching seller stats:", error);
    throw error;
  }
});

module.exports = {
  becomeSeller,
  sellerRegistration,
  getSellerVerificationStatus,
  updateVerificationDocuments,
  updateVerificationStatus,
  getSellerStats
};
