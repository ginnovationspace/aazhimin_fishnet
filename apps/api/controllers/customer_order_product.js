const prisma = require("@fishnet/database");
const { asyncHandler, AppError } = require("../middleware/errorHandler");

const toLegacyOrderProduct = (item) => ({
  id: item.id,
  customerOrderId: item.sellerOrder.marketplaceOrderId,
  productId: item.productId,
  quantity: item.quantity,
  product: item.product,
});

const createOrderProduct = asyncHandler(async (_request, _response) => {
  throw new AppError("Create order products through /api/orders", 410);
});

const updateProductOrder = asyncHandler(async (request, response) => {
  const { id } = request.params;
  const { quantity } = request.body;

  if (!id) {
    throw new AppError("Order product ID is required", 400);
  }

  if (!Number.isFinite(Number(quantity)) || Number(quantity) <= 0) {
    throw new AppError("Quantity must be greater than 0", 400);
  }

  const existingItem = await prisma.orderItem.findUnique({
    where: { id },
  });

  if (!existingItem) {
    throw new AppError("Order product not found", 404);
  }

  const updatedItem = await prisma.orderItem.update({
    where: { id },
    data: {
      quantity: Number(quantity),
      totalPrice: existingItem.unitPrice * Number(quantity),
    },
    include: {
      product: true,
      sellerOrder: true,
    },
  });

  response.json(toLegacyOrderProduct(updatedItem));
});

const deleteProductOrder = asyncHandler(async (request, response) => {
  const { id } = request.params;

  if (!id) {
    throw new AppError("Order ID is required", 400);
  }

  await prisma.sellerOrder.deleteMany({
    where: { marketplaceOrderId: id },
  });

  response.status(204).send();
});

const getProductOrder = asyncHandler(async (request, response) => {
  const { id } = request.params;

  if (!id) {
    throw new AppError("Order ID is required", 400);
  }

  const items = await prisma.orderItem.findMany({
    where: {
      sellerOrder: {
        marketplaceOrderId: id,
      },
    },
    include: {
      product: true,
      sellerOrder: true,
    },
  });

  if (items.length === 0) {
    throw new AppError("Order products not found", 404);
  }

  response.status(200).json(items.map(toLegacyOrderProduct));
});

const getAllProductOrders = asyncHandler(async (_request, response) => {
  const items = await prisma.orderItem.findMany({
    include: {
      product: true,
      sellerOrder: {
        include: {
          marketplaceOrder: true,
        },
      },
    },
  });

  const grouped = new Map();

  for (const item of items) {
    const marketplaceOrder = item.sellerOrder.marketplaceOrder;
    const existing = grouped.get(marketplaceOrder.id) || {
      customerOrderId: marketplaceOrder.id,
      customerOrder: {
        name: marketplaceOrder.buyerName || "",
        lastname: marketplaceOrder.buyerLastname || "",
        phone: marketplaceOrder.buyerPhone || "",
        email: marketplaceOrder.buyerEmail || "",
        company: marketplaceOrder.buyerCompany || "",
        adress: marketplaceOrder.buyerAddress || "",
        apartment: marketplaceOrder.buyerApartment || "",
        postalCode: marketplaceOrder.buyerPostalCode || "",
        dateTime: marketplaceOrder.placedAt,
        status: marketplaceOrder.status,
        total: marketplaceOrder.totalAmount,
      },
      products: [],
    };

    existing.products.push({
      ...item.product,
      quantity: item.quantity,
    });
    grouped.set(marketplaceOrder.id, existing);
  }

  response.json(Array.from(grouped.values()));
});

module.exports = {
  createOrderProduct,
  updateProductOrder,
  deleteProductOrder,
  getProductOrder,
  getAllProductOrders,
};
