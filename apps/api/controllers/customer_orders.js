const prisma = require("@fishnet/database");
const { asyncHandler, AppError } = require("../middleware/errorHandler");

const statusToLegacy = {
  ORDER_PLACED: "processing",
  PAYMENT_CONFIRMED: "processing",
  PROCESSING: "processing",
  READY_TO_SHIP: "processing",
  SHIPPED: "processing",
  OUT_FOR_DELIVERY: "processing",
  DELIVERED: "delivered",
  CANCELLED: "canceled",
  REFUND_REQUESTED: "processing",
  REFUNDED: "canceled",
  DISPUTED: "processing",
};

const legacyToStatus = {
  processing: "PROCESSING",
  delivered: "DELIVERED",
  canceled: "CANCELLED",
  cancelled: "CANCELLED",
};

const toLegacyOrder = (order) => ({
  id: order.id,
  name: order.buyerName || "",
  lastname: order.buyerLastname || "",
  phone: order.buyerPhone || "",
  email: order.buyerEmail || "",
  company: order.buyerCompany || "",
  adress: order.buyerAddress || "",
  apartment: order.buyerApartment || "",
  postalCode: order.buyerPostalCode || "",
  city: order.buyerCity || "",
  country: order.buyerCountry || "",
  orderNotice: order.orderNotice || "",
  status: statusToLegacy[order.status] || "processing",
  total: Number(order.totalAmount || 0),
  dateTime: order.placedAt,
});

const resolveCartItems = (body) => {
  const products = Array.isArray(body.products) ? body.products : [];

  return products.map((product) => ({
    productId: product.productId || product.id,
    quantity: Number(product.quantity || product.amount || 1),
    price: Number(product.price || 0),
  }));
};

const createCustomerOrder = asyncHandler(async (request, response) => {
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
    total,
    status,
  } = request.body;

  if (!name || !lastname || !phone || !email || !adress || !postalCode || !city || !country) {
    throw new AppError("Missing required order information", 400);
  }

  const cartItems = resolveCartItems(request.body);

  if (cartItems.length === 0) {
    throw new AppError("Order must contain at least one product", 400);
  }

  for (const item of cartItems) {
    if (!item.productId || !Number.isFinite(item.quantity) || item.quantity <= 0) {
      throw new AppError("Invalid order product", 400);
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: request.user.id },
    select: { id: true, email: true },
  });

  if (!user) {
    throw new AppError("Authenticated user not found", 401);
  }
  const productIds = cartItems.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, merchantId: true, price: true },
  });
  const productMap = new Map(products.map((product) => [product.id, product]));

  if (products.length !== productIds.length) {
    throw new AppError("One or more products were not found", 404);
  }

  const totalAmount = cartItems.reduce((sum, item) => {
    const product = productMap.get(item.productId);
    return sum + Number(product.price) * item.quantity;
  }, 0);

  const order = await prisma.$transaction(async (tx) => {
    const marketplaceOrder = await tx.marketplaceOrder.create({
      data: {
        userId: user.id,
        status: legacyToStatus[status] || "ORDER_PLACED",
        totalAmount,
        buyerName: name,
        buyerLastname: lastname,
        buyerPhone: phone,
        buyerEmail: user.email,
        buyerCompany: company || null,
        buyerAddress: adress,
        buyerApartment: apartment || null,
        buyerPostalCode: postalCode,
        buyerCity: city,
        buyerCountry: country,
        orderNotice: orderNotice || null,
      },
    });

    const itemsByMerchant = new Map();
    for (const item of cartItems) {
      const product = productMap.get(item.productId);
      const merchantItems = itemsByMerchant.get(product.merchantId) || [];
      merchantItems.push({
        ...item,
        price: product.price,
      });
      itemsByMerchant.set(product.merchantId, merchantItems);
    }

    for (const [merchantId, merchantItems] of itemsByMerchant.entries()) {
      const sellerTotal = merchantItems.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0
      );
      const sellerOrder = await tx.sellerOrder.create({
        data: {
          marketplaceOrderId: marketplaceOrder.id,
          merchantId,
          status: legacyToStatus[status] || "ORDER_PLACED",
          totalAmount: Math.round(sellerTotal),
        },
      });

      for (const item of merchantItems) {
        await tx.orderItem.create({
          data: {
            sellerOrderId: sellerOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: Math.round(Number(item.price)),
            totalPrice: Math.round(Number(item.price) * Number(item.quantity)),
          },
        });
      }
    }

    return marketplaceOrder;
  });

  response.status(201).json({
    id: order.id,
    message: "Order created successfully",
    orderNumber: order.id,
  });
});

const updateCustomerOrder = asyncHandler(async (request, response) => {
  const { id } = request.params;

  if (!id) {
    throw new AppError("Order ID is required", 400);
  }

  const order = await prisma.marketplaceOrder.findUnique({
    where: { id },
  });

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  if (order.userId !== request.user.id && request.user.role !== "ADMIN") {
    throw new AppError("Unauthorized to update this order", 403);
  }

  const updatedOrder = await prisma.marketplaceOrder.update({
    where: { id },
    data: {
      status: legacyToStatus[request.body.status] || order.status,
      buyerName: request.body.name ?? order.buyerName,
      buyerLastname: request.body.lastname ?? order.buyerLastname,
      buyerPhone: request.body.phone ?? order.buyerPhone,
      buyerEmail: request.body.email ? request.body.email.trim().toLowerCase() : order.buyerEmail,
      buyerCompany: request.body.company ?? order.buyerCompany,
      buyerAddress: request.body.adress ?? order.buyerAddress,
      buyerApartment: request.body.apartment ?? order.buyerApartment,
      buyerPostalCode: request.body.postalCode ?? order.buyerPostalCode,
      buyerCity: request.body.city ?? order.buyerCity,
      buyerCountry: request.body.country ?? order.buyerCountry,
      orderNotice: request.body.orderNotice ?? order.orderNotice,
      totalAmount: request.body.total === undefined ? order.totalAmount : Math.round(Number(request.body.total)),
    },
  });

  response.status(200).json(toLegacyOrder(updatedOrder));
});

const deleteCustomerOrder = asyncHandler(async (request, response) => {
  const { id } = request.params;

  if (!id) {
    throw new AppError("Order ID is required", 400);
  }

  const order = await prisma.marketplaceOrder.findUnique({
    where: { id },
  });

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  if (order.userId !== request.user.id && request.user.role !== "ADMIN") {
    throw new AppError("Unauthorized to delete this order", 403);
  }

  await prisma.marketplaceOrder.delete({
    where: { id },
  });

  response.status(204).send();
});

const getCustomerOrder = asyncHandler(async (request, response) => {
  const { id } = request.params;

  if (!id) {
    throw new AppError("Order ID is required", 400);
  }

  const order = await prisma.marketplaceOrder.findUnique({
    where: { id },
  });

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  if (order.userId !== request.user.id && request.user.role !== "ADMIN") {
    throw new AppError("Unauthorized to access this order", 403);
  }

  response.status(200).json(toLegacyOrder(order));
});

const getAllOrders = asyncHandler(async (request, response) => {
  const page = Math.max(Number(request.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(request.query.limit) || 50, 1), 100);
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.marketplaceOrder.findMany({
      skip,
      take: limit,
      orderBy: { placedAt: "desc" },
    }),
    prisma.marketplaceOrder.count(),
  ]);

  response.json({
    orders: orders.map(toLegacyOrder),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

module.exports = {
  createCustomerOrder,
  updateCustomerOrder,
  deleteCustomerOrder,
  getCustomerOrder,
  getAllOrders,
};
