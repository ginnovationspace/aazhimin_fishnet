const prisma = require("@aazhimin/database");
const { asyncHandler, AppError } = require("../middleware/errorHandler");

const searchProducts = asyncHandler(async (request, response) => {
    const { query } = request.query;
    if (!query) {
        throw new AppError("Query parameter is required", 400);
    }

    const products = await prisma.product.findMany({
        where: {
            OR: [
                {
                    title: {
                        contains: query
                    }
                },
                {
                    description: {
                        contains: query
                    }
                }
            ]
        }
    });

    return response.json(products);
});

module.exports = { searchProducts };