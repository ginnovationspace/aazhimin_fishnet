// packages/types/src/product.ts

export interface ProductCategory {
    id?: string;
    name?: string;
  }
  
  export interface ProductMerchant {
    id?: string;
    name?: string;
  }
  
  export interface Product {
    id: string;
    slug: string;
    title: string;
    description?: string | null;
    price: number;
    originalPrice?: number | null;
    mainImage?: string | null;
    inStock: number;
    rating?: number | null;
    manufacturer?: string | null;
    category?: ProductCategory | null;
    merchantId?: string | null;
    merchant?: ProductMerchant | null;
    urgencyLevel?: string | null;
  }