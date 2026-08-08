const prisma = require("@aazhimin/database");
const { asyncHandler, AppError } = require("../middleware/errorHandler");

async function getProductBySlug(request, response) {
  const { slug } = request.params;
  const product = await prisma.product.findMany({
    where: {
      slug: slug,
    },
    include: {
      category: true
    },
  });

  const foundProduct = product[0]; // Assuming there's only one product with that slug
  if (!foundProduct) {
    throw new AppError("Product not found", 404);
  }
  return response.status(200).json(foundProduct);
}

module.exports = { getProductBySlug };