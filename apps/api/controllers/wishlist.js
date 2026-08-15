const prisma = require("@fishnet/database");
const { AppError, asyncHandler } = require("../middleware/errorHandler");

const productSelection = {
  id: true,
  title: true,
  price: true,
  mainImage: true,
  slug: true,
  inStock: true
};

const getAllWishlist = asyncHandler(async (req, res) => {
  const wishlist = await prisma.wishlist.findMany({
    where: { userId: req.user.id },
    include: { product: { select: productSelection } }
  });

  res.json(wishlist);
});

const getAllWishlistByUserId = asyncHandler(async (req, res) => {
  if (req.params.userId !== req.user.id && req.user.role !== "ADMIN") {
    throw new AppError("Insufficient permissions", 403);
  }

  const wishlist = await prisma.wishlist.findMany({
    where: { userId: req.params.userId },
    include: { product: { select: productSelection } }
  });

  res.json(wishlist);
});

const createWishItem = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    throw new AppError("Product ID is required", 400);
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const wishlistItem = await prisma.wishlist.upsert({
    where: { userId_productId: { userId: req.user.id, productId } },
    update: {},
    create: { userId: req.user.id, productId },
    include: { product: { select: productSelection } }
  });

  res.status(201).json(wishlistItem);
});

const deleteWishItem = asyncHandler(async (req, res) => {
  const wishlistItem = await prisma.wishlist.findFirst({
    where: { userId: req.user.id, productId: req.params.productId }
  });

  if (!wishlistItem) {
    throw new AppError("Wishlist item not found", 404);
  }

  await prisma.wishlist.delete({ where: { id: wishlistItem.id } });
  res.status(204).send();
});

const getSingleProductFromWishlist = asyncHandler(async (req, res) => {
  if (req.params.userId !== req.user.id && req.user.role !== "ADMIN") {
    throw new AppError("Insufficient permissions", 403);
  }

  const wishlistItem = await prisma.wishlist.findUnique({
    where: {
      userId_productId: {
        userId: req.params.userId,
        productId: req.params.productId
      }
    },
    include: { product: { select: productSelection } }
  });

  if (!wishlistItem) {
    throw new AppError("Wishlist item not found", 404);
  }

  res.json(wishlistItem);
});

module.exports = {
  getAllWishlist,
  getAllWishlistByUserId,
  createWishItem,
  deleteWishItem,
  getSingleProductFromWishlist
};
