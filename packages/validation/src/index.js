"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = void 0;
exports.validateOrderData = validateOrderData;
exports.validateProductData = validateProductData;
const zod_1 = require("zod");
// Define the order data schema
const orderSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    lastname: zod_1.z.string().min(1, "Lastname is required"),
    phone: zod_1.z.string().min(1, "Phone is required"),
    email: zod_1.z.string().email("Invalid email address"),
    company: zod_1.z.string().optional(),
    adress: zod_1.z.string().min(1, "Address is required"),
    apartment: zod_1.z.string().optional(),
    postalCode: zod_1.z.string().min(1, "Postal code is required"),
    status: zod_1.z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
    city: zod_1.z.string().min(1, "City is required"),
    country: zod_1.z.string().min(1, "Country is required"),
    orderNotice: zod_1.z.string().optional(),
    total: zod_1.z.number().min(0.01, "Order total must be at least 0.01")
});
// Define the product data schema
const productSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required"),
    slug: zod_1.z.string().min(1, "Slug is required"),
    mainImage: zod_1.z.string().url("Main image must be a valid URL").optional(),
    price: zod_1.z.number().min(0, "Price must be non-negative"),
    rating: zod_1.z.number().min(0).max(5).default(5),
    description: zod_1.z.string().optional(),
    manufacturer: zod_1.z.string().optional(),
    inStock: zod_1.z.number().int().min(0).default(0),
    categoryId: zod_1.z.string().min(1, "Category ID is required"),
    merchantId: zod_1.z.string().optional(),
    // Fishnet-specific fields
    netType: zod_1.z.enum(["GILL", "CAST", "DRAG", "SEINE", "NYLON", "HDPE", "POLYETHYLENE", "MONOFILAMENT", "MULTIFILAMENT", "COMMERCIAL", "AQUACULTURE", "ACCESSORY"]).optional(),
    meshSize: zod_1.z.string().optional(),
    netLength: zod_1.z.number().min(0).optional(),
    netHeight: zod_1.z.number().min(0).optional(),
    material: zod_1.z.string().optional(),
    color: zod_1.z.string().optional(),
    threadDiameter: zod_1.z.number().min(0).optional(),
    breakingStrength: zod_1.z.number().min(0).optional(),
    usage: zod_1.z.string().optional(),
    targetFishOrSpecies: zod_1.z.string().optional(),
    waterType: zod_1.z.enum(["FRESHWATER", "SALTWATER", "BOTH"]).optional(),
    countryOfOrigin: zod_1.z.string().optional(),
    weight: zod_1.z.number().min(0).optional(),
    customizationAvailability: zod_1.z.boolean().optional(),
    shippingInformation: zod_1.z.string().optional()
});
function validateOrderData(data) {
    try {
        const validatedData = orderSchema.parse(data);
        return {
            isValid: true,
            validatedData
        };
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            const errors = error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            return {
                isValid: false,
                errors
            };
        }
        throw error;
    }
}
function validateProductData(data) {
    try {
        const validatedData = productSchema.parse(data);
        return {
            isValid: true,
            validatedData
        };
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            const errors = error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            return {
                isValid: false,
                errors
            };
        }
        throw error;
    }
}
class ValidationError extends Error {
    constructor(field, message) {
        super(message);
        this.field = field;
        this.name = "ValidationError";
    }
}
exports.ValidationError = ValidationError;
//# sourceMappingURL=index.js.map