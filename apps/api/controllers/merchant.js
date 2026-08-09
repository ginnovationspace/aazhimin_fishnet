const prisma = require("@aazhimin/database");
const { asyncHandler, AppError } = require("../middleware/errorHandler");

const getAllMerchants = asyncHandler(async (request, response) => {
  const merchants = await prisma.merchant.findMany({
    include: {
      products: true,
    },
  });
  return response.json(merchants);
});

const getMerchantById = asyncHandler(async (request, response) => {
  const { id } = request.params;
  const merchant = await prisma.merchant.findUnique({
    where: {
      id: id,
    },
    include: {
      products: true,
    },
  });

  if (!merchant) {
    throw new AppError("Merchant not found", 404);
  }

  return response.json(merchant);
});

const createMerchant = asyncHandler(async (request, response) => {
  const { name, email, phone, address, description, status } = request.body;

  // Basic validation
  if (!name || !email) {
    throw new AppError("Name and email are required", 400);
  }

  const merchant = await prisma.merchant.create({
    data: {
      name,
      email,
      phone,
      address,
      description,
      status: status || "ACTIVE",
    },
  });

  return response.status(201).json(merchant);
});

const updateMerchant = asyncHandler(async (request, response) => {
  const { id } = request.params;
  const { name, email, phone, address, description, status } = request.body;

  if (!id) {
    throw new AppError("Merchant ID is required", 400);
  }

  const existingMerchant = await prisma.merchant.findUnique({
    where: { id: id },
  });

  if (!existingMerchant) {
    throw new AppError("Merchant not found", 404);
  }

  const updatedMerchant = await prisma.merchant.update({
    where: {
      id: id,
    },
    data: {
      name,
      email,
      phone,
      address,
      description,
      status,
    },
  });

  return response.json(updatedMerchant);
});

const deleteMerchant = asyncHandler(async (request, response) => {
  const { id } = request.params;

  if (!id) {
    throw new AppError("Merchant ID is required", 400);
  }

  // Check if merchant has products before deletion
  const merchant = await prisma.merchant.findUnique({
    where: { id },
    include: { products: true },
  });

  if (merchant && merchant.products.length > 0) {
    throw new AppError("Cannot delete merchant with existing products", 400);
  }

  await prisma.merchant.delete({
    where: {
      id: id,
    },
  });

  return response.status(204).send();
});

module.exports = {
  getAllMerchants,
  getMerchantById,
  createMerchant,
  updateMerchant,
  deleteMerchant,
};