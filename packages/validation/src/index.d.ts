export declare function validateOrderData(data: any): {
    isValid: boolean;
    validatedData: {
        name: string;
        lastname: string;
        phone: string;
        email: string;
        adress: string;
        postalCode: string;
        status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
        city: string;
        country: string;
        total: number;
        company?: string | undefined;
        apartment?: string | undefined;
        orderNotice?: string | undefined;
    };
    errors?: undefined;
} | {
    isValid: boolean;
    errors: {
        field: string;
        message: string;
    }[];
    validatedData?: undefined;
};
export declare function validateProductData(data: any): {
    isValid: boolean;
    validatedData: {
        title: string;
        slug: string;
        price: number;
        rating: number;
        inStock: number;
        categoryId: string;
        mainImage?: string | undefined;
        description?: string | undefined;
        manufacturer?: string | undefined;
        merchantId?: string | undefined;
        netType?: "GILL" | "CAST" | "DRAG" | "SEINE" | "NYLON" | "HDPE" | "POLYETHYLENE" | "MONOFILAMENT" | "MULTIFILAMENT" | "COMMERCIAL" | "AQUACULTURE" | "ACCESSORY" | undefined;
        meshSize?: string | undefined;
        netLength?: number | undefined;
        netHeight?: number | undefined;
        material?: string | undefined;
        color?: string | undefined;
        threadDiameter?: number | undefined;
        breakingStrength?: number | undefined;
        usage?: string | undefined;
        targetFishOrSpecies?: string | undefined;
        waterType?: "FRESHWATER" | "SALTWATER" | "BOTH" | undefined;
        countryOfOrigin?: string | undefined;
        weight?: number | undefined;
        customizationAvailability?: boolean | undefined;
        shippingInformation?: string | undefined;
    };
    errors?: undefined;
} | {
    isValid: boolean;
    errors: {
        field: string;
        message: string;
    }[];
    validatedData?: undefined;
};
export declare class ValidationError extends Error {
    field: string;
    constructor(field: string, message: string);
}
//# sourceMappingURL=index.d.ts.map