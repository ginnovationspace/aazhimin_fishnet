const prisma = require("@fishnet/database");
const { asyncHandler, handleServerError, AppError } = require("../middleware/errorHandler");

// Security: Define whitelists for allowed filter types and operators
const ALLOWED_FILTER_TYPES = [
  'price',
  'rating',
  'category',
  'inStock',
  'outOfStock',
  'netType',
  'material',
  'meshSize',
  'color',
  'usage'
];
const ALLOWED_OPERATORS = ['gte', 'lte', 'gt', 'lt', 'equals', 'contains'];
const ALLOWED_SORT_VALUES = ['defaultSort', 'titleAsc', 'titleDesc', 'lowPrice', 'highPrice'];

// Security: Input validation functions
function validateFilterType(filterType) {
  return ALLOWED_FILTER_TYPES.includes(filterType);
}

function validateOperator(operator) {
  return ALLOWED_OPERATORS.includes(operator);
}

function validateSortValue(sortValue) {
  return ALLOWED_SORT_VALUES.includes(sortValue);
}

// Security: Safe filter object builder
function buildSafeFilterObject(filterArray) {
  const filterObj = {};

  for (const item of filterArray) {
    // Validate filter type
    if (!validateFilterType(item.filterType)) {
      console.warn(`Invalid filter type: ${item.filterType}`);
      continue;
    }

    // Validate operator
    if (!validateOperator(item.filterOperator)) {
      console.warn(`Invalid operator: ${item.filterOperator}`);
      continue;
    }

    // Validate and sanitize filter value
    const sanitizedValue = validateAndSanitizeFilterValue(item.filterType, item.filterValue);
    if (sanitizedValue === null) {
      console.warn(`Invalid filter value for ${item.filterType}: ${item.filterValue}`);
      continue;
    }

    // Build safe filter object
    filterObj[item.filterType] = {
      [item.filterOperator]: sanitizedValue,
    };
  }

  return filterObj;
}

// Added: Validate and sanitize filter value (missing function)
function validateAndSanitizeFilterValue(filterType, value) {
  if (value === null || value === undefined) {
    return null;
  }
  const strValue = String(value).trim();
  if (strValue === "") {
    return null;
  }

  // For numeric filter types, convert to number
  if (['price', 'inStock', 'outOfStock'].includes(filterType)) {
    const numValue = Number(strValue);
    return Number.isNaN(numValue) ? null : numValue;
  }

  // For category, we return the string
  if (filterType === 'category') {
    return strValue;
  }

  // For rating, treat as number
  if (filterType === 'rating') {
    const numValue = Number(strValue);
    return Number.isNaN(numValue) ? null : numValue;
  }

  // For text-based filter types, return string
  if (['netType', 'material', 'meshSize', 'color', 'usage'].includes(filterType)) {
    return strValue;
  }

  // Default: return string
  return strValue;
}

const getAllProducts = asyncHandler(async (request, response) => {
  const mode = request.query.mode || "";

  // checking if we are on the admin products page because we don't want to have filtering, sorting and pagination there
  if (mode === "admin") {
    const adminProducts = await prisma.product.findMany({});
    return response.json(adminProducts);
  } else {
    const dividerLocation = request.url.indexOf("?");
    let filterObj = {};
    let sortObj = {};
    let sortByValue = "defaultSort";

    // getting current page with validation
    const page = Number(request.query.page);
    const validatedPage = (page && page > 0) ? page : 1;

    if (dividerLocation !== -1) {
      const queryArray = request.url
        .substring(dividerLocation + 1, request.url.length)
        .split("&");

      let filterType;
      let filterArray = [];

      for (let i = 0; i < queryArray.length; i++) {
        // Security: Use more robust validation with validation
        const queryParam = queryArray[i];

        // Extract filter type safely
        if (queryParam.includes("filters")) {
          if (queryParam.includes("price")) {
            filterType = "price";
          } else if (queryParam.includes("rating")) {
            filterType = "rating";
          } else if (queryParam.includes("category")) {
            filterType = "category";
          } else if (queryParam.includes("inStock")) {
            filterType = "inStock";
          } else if (queryParam.includes("outOfStock")) {
            filterType = "outOfStock";
          } else if (queryParam.includes("netType")) {
            filterType = "netType";
          } else if (queryParam.includes("material")) {
            filterType = "material";
          } else if (queryParam.includes("meshSize")) {
            filterType = "meshSize";
          } else if (queryParam.includes("color")) {
            filterType = "color";
          } else if (queryParam.includes("usage")) {
            filterType = "usage";
          } else {
            // Skip unknown filter types
            continue;
          }
        }

        if (queryParam.includes("sort")) {
          // Security: Validate sort value
          const extractedSortValue = queryParam.substring(queryParam.indexOf("=") + 1);
          if (validateSortValue(extractedSortValue)) {
            sortByValue = extractedSortValue;
          }
        }

        // Security: Extract filter parameters safely
        if (queryParam.includes("filters") && filterType) {
          let filterValue;

          // Extract filter value based on type
          if (filterType === "category") {
            filterValue = queryParam.substring(queryParam.indexOf("=") + 1);
          } else {
            const numValue = parseInt(queryParam.substring(queryParam.indexOf("=") + 1));
            filterValue = isNaN(numValue) ? null : numValue;
          }

          // Extract operator safely
          const operatorStart = queryParam.indexOf("$") + 1;
          const operatorEnd = queryParam.indexOf("=") - 1;

          if (operatorStart > 0 && operatorEnd > operatorStart) {
            const filterOperator = queryParam.substring(operatorStart, operatorEnd);

            // Only add to filter array if all values are valid
            if (filterValue !== null && filterOperator) {
              filterArray.push({
                filterType,
                filterOperator,
                filterValue
              });
            }
          }
        }
      }

      // Security: Build filter object using safe function
      filterObj = buildSafeFilterObject(filterArray);
    }

    let whereClause = { ...filterObj };

    // Security: Handle category filter separately with validation
    if (filterObj.category && filterObj.category.equals) {
      delete whereClause.category;
    }

    // Security: Build sort object safely
    switch (sortByValue) {
      case "defaultSort":
        sortObj = {};
        break;
      case "titleAsc":
        sortObj = { title: "asc" };
        break;
      case "titleDesc":
        sortObj = { title: "desc" };
        break;
      case "lowPrice":
        sortObj = { price: "asc" };
        break;
      case "highPrice":
        sortObj = { price: "desc" };
        break;
      default:
        sortObj = {};
    }

    let products;

    if (Object.keys(filterObj).length === 0) {
      products = await prisma.product.findMany({
        skip: (validatedPage - 1) * 10,
        take: 12,
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
        orderBy: sortObj,
      });
    } else {
      // Security: Handle category filter with proper validation
      if (filterObj.category && filterObj.category.equals) {
        products = await prisma.product.findMany({
          skip: (validatedPage - 1) * 10,
          take: 12,
          include: {
            category: {
              select: {
                name: true,
              },
            },
          },
          where: {
            ...whereClause,
            category: {
              name: {
                equals: filterObj.category.equals,
              },
            },
          },
          orderBy: sortObj,
        });
      } else {
        products = await prisma.product.findMany({
          skip: (validatedPage - 1) * 10,
          take: 12,
          include: {
            category: {
              select: {
                name: true,
              },
            },
          },
          where: whereClause,
          orderBy: sortObj,
        });
      }
    }

    return response.json(products);
  }
});

const getAllProductsOld = asyncHandler(async (request, response) => {
  const products = await prisma.product.findMany({
    include: {
      category: {
        select: {
          name: true,
        },
      },
    },
  });
  response.status(200).json(products);
});

const createProduct = asyncHandler(async (request, response) => {
  const {
    slug,
    title,
    mainImage,
    price,
    description,
    manufacturer,
    categoryId,
    inStock,
    // Fishnet-specific fields
    netType,
    meshSize,
    netLength,
    netHeight,
    material,
    color,
    threadDiameter,
    breakingStrength,
    usage,
    targetFishOrSpecies,
    waterType,
    countryOfOrigin,
    weight,
    customizationAvailability,
    shippingInformation
  } = request.body;

  // Get authenticated user
  const userId = request.user.id;

  // Find merchant for this user
  const merchant = await prisma.merchant.findUnique({
    where: { userId },
  });

  if (!merchant) {
    throw new AppError("Merchant profile not found. Please register as a seller first.", 403);
  }

  if (!title) {
    throw new AppError("Missing required field: title", 400);
  }

  if (!slug) {
    throw new AppError("Missing required field: slug", 400);
  }

  if (!price) {
    throw new AppError("Missing required field: price", 400);
  }

  if (!categoryId) {
    throw new AppError("Missing required field: categoryId", 400);
  }

  const normalizedPrice = Number(price);
  const normalizedStock = typeof inStock === "boolean"
    ? (inStock ? 1 : 0)
    : Number(inStock ?? 0);

  if (!Number.isFinite(normalizedPrice) || normalizedPrice < 0) {
    throw new AppError("Price must be a valid non-negative number", 400);
  }

  if (!Number.isFinite(normalizedStock) || normalizedStock < 0) {
    throw new AppError("Stock must be a valid non-negative number", 400);
  }

  const product = await prisma.product.create({
    data: {
      merchantId: merchant.id, // Use authenticated user's merchantId
      slug,
      title,
      mainImage: mainImage || "product_placeholder.jpg",
      price: Math.round(normalizedPrice),
      rating: 5,
      description: description || "",
      manufacturer: manufacturer || "",
      categoryId,
      inStock: Math.floor(normalizedStock),
      netType,
      meshSize,
      netLength,
      netHeight,
      material,
      color,
      threadDiameter,
      breakingStrength,
      usage,
      targetFishOrSpecies,
      waterType,
      countryOfOrigin,
      weight,
      customizationAvailability,
      shippingInformation,
    },
  });
  return response.status(201).json(product);
});

// Method for updating existing product
const updateProduct = asyncHandler(async (request, response) => {
  const { id } = request.params;
  const {
    slug,
    title,
    mainImage,
    price,
    description,
    manufacturer,
    categoryId,
    inStock,
    // Fishnet-specific fields
    netType,
    meshSize,
    netLength,
    netHeight,
    material,
    color,
    threadDiameter,
    breakingStrength,
    usage,
    targetFishOrSpecies,
    waterType,
    countryOfOrigin,
    weight,
    customizationAvailability,
    shippingInformation
  } = request.body;

  // Get authenticated user
  const userId = request.user.id;

  // Find merchant for this user
  const merchant = await prisma.merchant.findUnique({
    where: { userId },
  });

  if (!merchant) {
    throw new AppError("Merchant profile not found", 403);
  }

  // Basic validation
  if (!id) {
    throw new AppError("Product ID is required", 400);
  }

  // Finding a product by id
  const existingProduct = await prisma.product.findUnique({
    where: {
      id,
    },
  });

  if (!existingProduct) {
    throw new AppError("Product not found", 404);
  }

  // Authorization: check if product belongs to user's merchant or user is admin
  if (existingProduct.merchantId !== merchant.id && request.user.role !== "ADMIN") {
    throw new AppError("Unauthorized to update this product", 403);
  }

  // Updating found product
  const updatedProduct = await prisma.product.update({
    where: {
      id,
    },
    data: {
      slug: slug,
      title: title,
      mainImage: mainImage,
      price: price,
      rating: 5, // Keep rating as 5 or maybe we should not overwrite rating? We'll keep as 5 for simplicity.
      description: description,
      manufacturer: manufacturer,
      categoryId: categoryId,
      inStock: inStock,
      netType: netType,
      meshSize: meshSize,
      netLength: netLength,
      netHeight: netHeight,
      material: material,
      color: color,
      threadDiameter: threadDiameter,
      breakingStrength: breakingStrength,
      usage: usage,
      targetFishOrSpecies: targetFishOrSpecies,
      waterType: waterType,
      countryOfOrigin: countryOfOrigin,
      weight: weight,
      customizationAvailability: customizationAvailability,
      shippingInformation: shippingInformation,
    },
  });

  return response.status(200).json(updatedProduct);
});

// Method for deleting a product
const deleteProduct = asyncHandler(async (request, response) => {
  const { id } = request.params;

  // Get authenticated user
  const userId = request.user.id;

  // Find merchant for this user
  const merchant = await prisma.merchant.findUnique({
    where: { userId },
  });

  if (!merchant) {
    throw new AppError("Merchant profile not found", 403);
  }

  if (!id) {
    throw new AppError("Product ID is required", 400);
  }

  // Finding a product by id
  const existingProduct = await prisma.product.findUnique({
    where: {
      id,
    },
  });

  if (!existingProduct) {
    throw new AppError("Product not found", 404);
  }

  // Authorization: check if product belongs to user's merchant or user is admin
  if (existingProduct.merchantId !== merchant.id && request.user.role !== "ADMIN") {
    throw new AppError("Unauthorized to delete this product", 403);
  }

  // Check for related records in current order items table.
  const relatedOrderProductItems = await prisma.orderItem.findMany({
    where: {
      productId: id,
    },
  });

  if (relatedOrderProductItems.length > 0) {
    throw new AppError("Cannot delete product because of foreign key constraint", 400);
  }

  await prisma.product.delete({
    where: {
      id,
    },
  });

  return response.status(204).send();
});

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
            contains: query,
          },
        },
        {
          description: {
            contains: query,
          },
        },
        {
          netType: {
            contains: query,
          },
        },
        {
          material: {
            contains: query,
          },
        }
      ],
    },
  });

  return response.json(products);
});

const getProductById = asyncHandler(async (request, response) => {
  const { id } = request.params;

  if (!id) {
    throw new AppError("Product ID is required", 400);
  }

  const product = await prisma.product.findUnique({
    where: {
      id: id,
    },
    include: {
      category: true,
      merchant: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return response.status(200).json(product);
});

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductById,
};
