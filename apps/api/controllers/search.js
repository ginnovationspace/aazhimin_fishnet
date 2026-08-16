const prisma = require("@fishnet/database");
const { asyncHandler, AppError } = require("../middleware/errorHandler");

const searchProducts = asyncHandler(async (request, response) => {
    const query = request.query.query || request.query.q;
    if (!query) {
        throw new AppError("Query parameter is required", 400);
    }

    const products = await prisma.product.findMany({
        where: {
            OR: [
                {
                    title: {
                        contains: query,
                        mode: 'insensitive'
                    }
                },
                {
                    description: {
                        contains: query,
                        mode: 'insensitive'
                    }
                },
                {
                    netType: {
                        contains: query,
                        mode: 'insensitive'
                    }
                },
                {
                    material: {
                        contains: query,
                        mode: 'insensitive'
                    }
                },
                {
                    meshSize: {
                        contains: query,
                        mode: 'insensitive'
                    }
                },
                {
                    category: {
                        name: {
                            contains: query,
                            mode: 'insensitive'
                        }
                    }
                }
            ]
        },
        include: {
            category: {
                select: {
                    name: true
                }
            }
        }
    });

    return response.json(products);
});

// New endpoint for search suggestions
const getSearchSuggestions = asyncHandler(async (request, response) => {
    const query = request.query.query || request.query.q;
    if (!query || query.length < 2) {
        return response.json({ suggestions: [] });
    }

    // Get unique values from various fields for suggestions
    const [netTypes, materials, meshSizes, categories] = await Promise.all([
        // Get distinct net types
        prisma.product.findMany({
            where: {
                netType: {
                    contains: query,
                    mode: 'insensitive'
                }
            },
            select: {
                netType: true
            },
            distinct: ['netType'],
            take: 5
        }),

        // Get distinct materials
        prisma.product.findMany({
            where: {
                material: {
                    contains: query,
                    mode: 'insensitive'
                }
            },
            select: {
                material: true
            },
            distinct: ['material'],
            take: 5
        }),

        // Get distinct mesh sizes
        prisma.product.findMany({
            where: {
                meshSize: {
                    contains: query,
                    mode: 'insensitive'
                }
            },
            select: {
                meshSize: true
            },
            distinct: ['meshSize'],
            take: 5
        }),

        // Get distinct categories
        prisma.category.findMany({
            where: {
                name: {
                    contains: query,
                    mode: 'insensitive'
                }
            },
            select: {
                name: true
            },
            take: 5
        })
    ]);

    // Format suggestions
    const suggestions = [
        ...netTypes.map(item => item.netType).filter(Boolean),
        ...materials.map(item => item.material).filter(Boolean),
        ...meshSizes.map(item => item.meshSize).filter(Boolean),
        ...categories.map(item => item.name).filter(Boolean)
    ];

    // Remove duplicates and limit
    const uniqueSuggestions = [...new Set(suggestions)].slice(0, 8);

    return response.json({ suggestions: uniqueSuggestions });
});

module.exports = { searchProducts, getSearchSuggestions };
