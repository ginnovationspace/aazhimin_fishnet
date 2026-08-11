const prisma = require("@aazhimin/database");
const { asyncHandler, handleServerError, AppError } = require("../middleware/errorHandler");
const bcrypt = require('bcryptjs');
const { nanoid } = require('nanoid');

const sellerRegistration = asyncHandler(async (request, response) => {
  try {
    console.log("=== SELLER REGISTRATION REQUEST ===");
    console.log("Request body:", JSON.stringify(request.body, null, 2));

    const {
      email,
      password,
      merchantName,
      merchantDescription,
      merchantPhone,
      merchantAddress,
      // Verification documents (optional for now)
      verificationDocuments
    } = request.body;

    // Validate required fields
    if (!email || !password || !merchantName) {
      throw new AppError("Email, password, and merchant name are required", 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new AppError("Email already in use", 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with SELLER role
    const user = await prisma.user.create({
      data: {
        id: nanoid(),
        email,
        password: hashedPassword,
        role: "SELLER",
      }
    });

    // Create merchant profile linked to the user
    const merchant = await prisma.merchant.create({
      data: {
        userId: user.id,
        name: merchantName,
        description: merchantDescription || null,
        phone: merchantPhone || null,
        address: merchantAddress || null,
        verificationStatus: "PENDING", // Start as pending
        verificationDocuments: verificationDocuments || null,
      }
    });

    console.log("Seller registered successfully:", {
      userId: user.id,
      merchantId: merchant.id
    });

    // Return success response (without password)
    return response.status(201).json({
      message: "Seller registration submitted successfully",
      userId: user.id,
      merchantId: merchant.id,
      verificationStatus: merchant.verificationStatus
    });

  } catch (error) {
    console.error("Error in seller registration:", error);
    if (error.code === 'P2002') {
      // Unique constraint violation
      return response.status(409).json({
        error: "Registration failed",
        details: "A user with this email already exists"
      });
    }
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return response.status(400).json({
        error: "Validation failed",
        details: error.message
      });
    }
    // Generic error
    return response.status(500).json({
      error: "Internal server error",
      details: "Failed to register seller. Please try again later."
    });
  }
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
  sellerRegistration,
  getSellerVerificationStatus,
  updateVerificationDocuments,
  updateVerificationStatus,
  getSellerStats
};
