const prisma = require("@aazhimin/database");
const { asyncHandler, AppError } = require("../middleware/errorHandler");
const paymentService = require("../services/paymentService");
const { createOrderUpdateNotification } = require("@aazhimin/notifications");

// Create a marketplace order from cart data
const createMarketplaceOrder = asyncHandler(async (req, res) => {
  const {
    name,
    lastname,
    phone,
    email,
    company,
    adress,
    apartment,
    postalCode,
    city,
    country,
    orderNotice,
    totalAmount,
    userId, // Optional: if the user is logged in
    cartItems, // Array of cart items from the frontend
    paymentMethodId, // Stripe payment method ID (for card payments)
    paymentMethod // NEW: 'upi' or 'card'
  } = req.body;

  // Validate required fields
  if (!name || !lastname || !phone || !email || !adress || !apartment || !postalCode || !city || !country) {
    throw new AppError("Missing required buyer information", 400);
  }

  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    throw new AppError("Cart is empty", 400);
  }

  // Validate payment method
  let paymentMethodTypes = undefined;
  if (paymentMethod === 'upi') {
    paymentMethodTypes = ['upi'];
    // For UPI, paymentMethodId is not required from the client
  } else if (paymentMethod === 'gpay' || paymentMethod === 'card') {
    // For card or Google Pay (which uses card tokens), we require paymentMethodId
    if (!paymentMethodId) {
      throw new AppError("Payment method ID is required", 400);
    }
    // Restrict to card payments only (includes cards tokenized via Google Pay)
    paymentMethodTypes = ['card'];
  } else {
    throw new AppError("Invalid payment method", 400);
  }

  // Determine user ID: if authenticated, use token user ID; otherwise find/create a buyer by email.
  let finalUserId = null;
  if (req.user) {
    // Authenticated user - use ID from token, ignore any userId in body for security
    finalUserId = req.user.id;
  } else if (userId) {
    const providedUser = await prisma.user.findUnique({ where: { id: userId } });
    finalUserId = providedUser?.id || null;
  }

  if (!finalUserId) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.upsert({
      where: { email: normalizedEmail },
      update: {},
      create: {
        email: normalizedEmail,
        role: "BUYER",
      },
    });
    finalUserId = user.id;
  }

  // Validate each cart item
  for (const item of cartItems) {
    if (!item.productId || !item.quantity || item.quantity <= 0) {
      throw new AppError("Invalid cart item", 400);
    }
    // Check product exists and is in stock
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      select: { id: true, title: true, inStock: true, price: true }
    });
    if (!product) {
      throw new AppError(`Product not found: ${item.productId}`, 404);
    }
    if (product.inStock < item.quantity) {
      throw new AppError(`Insufficient stock for product: ${product.title}`, 400);
    }
  }

  // Start a transaction to create the marketplace order, seller orders, order items, and payment
  const result = await prisma.$transaction(async (tx) => {
    // 1. Create the marketplace order
    const marketplaceOrder = await tx.marketplaceOrder.create({
      data: {
        userId: finalUserId, // Authenticated user ID or guest user ID (if provided)
        status: "ORDER_PLACED",
        totalAmount: parseInt(totalAmount), // Ensure it's an integer
        buyerName: name,
        buyerLastname: lastname,
        buyerPhone: phone,
        buyerEmail: email.toLowerCase(),
        buyerCompany: company,
        buyerAddress: adress,
        buyerApartment: apartment,
        buyerPostalCode: postalCode,
        buyerCity: city,
        buyerCountry: country,
        orderNotice: orderNotice || null
      }
    });

    // 2. Group cart items by merchantId
    // We need to fetch the merchantId for each product
    const productIds = cartItems.map(item => item.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, merchantId: true, price: true }
    });

    // Create a map of productId to { merchantId, price }
    const productMap = {};
    products.forEach(p => {
      productMap[p.id] = { merchantId: p.merchantId, price: p.price };
    });

    // Group cart items by merchantId
    const itemsByMerchant = {};
    for (const item of cartItems) {
      const productInfo = productMap[item.productId];
      if (!productInfo) {
        throw new AppError(`Product not found: ${item.productId}`, 404);
      }
      const merchantId = productInfo.merchantId;
      if (!itemsByMerchant[merchantId]) {
        itemsByMerchant[merchantId] = [];
      }
      itemsByMerchant[merchantId].push({
        productId: item.productId,
        quantity: item.quantity,
        price: productInfo.price
      });
    }

    // 3. For each merchant, create a seller order and its order items
    const sellerOrders = [];
    const orderItems = [];

    for (const [merchantId, items] of Object.entries(itemsByMerchant)) {
      // Calculate seller order total
      let sellerTotal = 0;
      for (const item of items) {
        sellerTotal += item.price * item.quantity;
      }

      // Create seller order
      const sellerOrder = await tx.sellerOrder.create({
        data: {
          marketplaceOrderId: marketplaceOrder.id,
          merchantId: merchantId,
          status: "ORDER_PLACED",
          totalAmount: sellerTotal
        }
      });

      sellerOrders.push(sellerOrder);

      // Create order items for this seller order
      for (const item of items) {
        const orderItem = await tx.orderItem.create({
          data: {
            sellerOrderId: sellerOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity
          }
        });
        orderItems.push(orderItem);
      }
    }

    // 4. Update marketplace order total with the sum of seller order totals (should match)
    // We already calculated totalAmount from the frontend, but we can verify
    const calculatedTotal = sellerOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      // Log a warning but don't fail - frontend total might have rounding differences
      console.warn(`Marketplace order total mismatch: frontend ${totalAmount}, calculated ${calculatedTotal}`);
    }

    // 5. Create a payment intent with Stripe
    const paymentResult = await paymentService.createPaymentIntent({
      marketplaceOrderId: marketplaceOrder.id,
      amount: parseInt(totalAmount),
      currency: "INR", // Default to INR, could be made configurable
      paymentMethodId: paymentMethodId,
      paymentMethodTypes: paymentMethodTypes
    });

    return {
      marketplaceOrder,
      sellerOrders,
      orderItems,
      paymentResult
    };
  });

  // Decrease product stock for each cart item
  // We'll do this in a separate transaction or asynchronously for now
  // For simplicity, we'll do it in the same transaction but after the orders are created
  // We need to update the product inStock
  await prisma.$transaction(async (tx) => {
    for (const item of req.body.cartItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          inStock: {
            decrement: item.quantity
          }
        }
      });
    }
  });

  // Send order confirmation notification if we have a user ID
  try {
    if (finalUserId) {
      // Get user details to send notification
      const user = await prisma.user.findUnique({
        where: { id: finalUserId }
      });

      if (user && user.email) {
        await createOrderUpdateNotification(
          user.email,
          user.id,
          'confirmed',
          result.marketplaceOrder.id,
          result.marketplaceOrder.totalAmount
        );
        console.log(`���������������������📧 Marketplace order confirmation notification sent to user: ${user.email}`);
      }
    }
  } catch (notificationError) {
    console.error('��������❌ Failed to create marketplace order notification:', notificationError);
    // Don't fail the order if notification fails
  }

  // Return the created marketplace order with basic info and payment details
  res.status(201).json({
    id: result.marketplaceOrder.id,
    status: result.marketplaceOrder.status,
    totalAmount: result.marketplaceOrder.totalAmount,
    buyerName: result.marketplaceOrder.buyerName,
    buyerLastname: result.marketplaceOrder.buyerLastname,
    sellerOrdersCount: result.sellerOrders.length,
    orderItemsCount: result.orderItems.length,
    clientSecret: result.paymentResult.clientSecret,
    paymentId: result.paymentResult.paymentId,
    paymentStatus: result.paymentResult.status
  });
});

module.exports = {
  createMarketplaceOrder
};
