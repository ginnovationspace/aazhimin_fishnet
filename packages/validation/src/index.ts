import { z } from "zod";

// Define the order data schema
const orderSchema = z.object({
  name: z.string().min(1, "Name is required"),
  lastname: z.string().min(1, "Lastname is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email address"),
  company: z.string().optional(),
  adress: z.string().min(1, "Address is required"),
  apartment: z.string().optional(),
  postalCode: z.string().min(1, "Postal code is required"),
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  orderNotice: z.string().optional(),
  total: z.number().min(0.01, "Order total must be at least 0.01")
});

// Define the product data schema
const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  mainImage: z.string().url("Main image must be a valid URL").optional(),
  price: z.number().min(0, "Price must be non-negative"),
  rating: z.number().min(0).max(5).default(5),
  description: z.string().optional(),
  manufacturer: z.string().optional(),
  inStock: z.number().int().min(0).default(0),
  categoryId: z.string().min(1, "Category ID is required"),
  merchantId: z.string().optional(),

  // Fishnet-specific fields
  netType: z.enum(["GILL", "CAST", "DRAG", "SEINE", "NYLON", "HDPE", "POLYETHYLENE", "MONOFILAMENT", "MULTIFILAMENT", "COMMERCIAL", "AQUACULTURE", "ACCESSORY"]).optional(),
  meshSize: z.string().optional(),
  netLength: z.number().min(0).optional(),
  netHeight: z.number().min(0).optional(),
  material: z.string().optional(),
  color: z.string().optional(),
  threadDiameter: z.number().min(0).optional(),
  breakingStrength: z.number().min(0).optional(),
  usage: z.string().optional(),
  targetFishOrSpecies: z.string().optional(),
  waterType: z.enum(["FRESHWATER", "SALTWATER", "BOTH"]).optional(),
  countryOfOrigin: z.string().optional(),
  weight: z.number().min(0).optional(),
  customizationAvailability: z.boolean().optional(),
  shippingInformation: z.string().optional()
});

export function validateOrderData(data: any) {
  try {
    const validatedData = orderSchema.parse(data);
    return {
      isValid: true,
      validatedData
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
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

export function validateProductData(data: any) {
  try {
    const validatedData = productSchema.parse(data);
    return {
      isValid: true,
      validatedData
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
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

export class ValidationError extends Error {
  public field: string;
  constructor(field: string, message: string) {
    super(message);
    this.field = field;
    this.name = "ValidationError";
  }
}