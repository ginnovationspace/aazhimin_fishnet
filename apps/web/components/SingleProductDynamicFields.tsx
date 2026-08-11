'use client';
import React, { useState } from "react";
import QuantityInput from "./QuantityInput";
import AddToCartSingleProductBtn from "./AddToCartSingleProductBtn";
import BuyNowSingleProductBtn from "./BuyNowSingleProductBtn";

const SingleProductDynamicFields = ({ product }: { product: any }) => {
  const [quantityCount, setQuantityCount] = useState<number>(1);
  return (
    <>
      <QuantityInput
        quantityCount={quantityCount}
        setQuantityCount={setQuantityCount}
      />
      {Boolean(product.inStock) && (
        <div className="flex gap-x-5 max-[500px]:flex-col max-[500px]:items-center max-[500px]:gap-y-1">
          <AddToCartSingleProductBtn
            quantityCount={quantityCount}
            product={product}
          />
          <BuyNowSingleProductBtn
            quantityCount={quantityCount}
            product={product}
          />
        </div>
      )}
      {/* Product Specifications */}
      <div className="mt-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Product Specifications</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Net Type */}
          <div>
            <h3 className="text-sm font-medium text-gray-500">Net Type</h3>
            <p className="text-base text-gray-700">{product.netType || "N/A"}</p>
          </div>
          {/* Material */}
          <div>
            <h3 className="text-sm font-medium text-gray-500">Material</h3>
            <p className="text-base text-gray-700">{product.material || "N/A"}</p>
          </div>
          {/* Mesh Size */}
          <div>
            <h3 className="text-sm font-medium text-gray-500">Mesh Size</h3>
            <p className="text-base text-gray-700">{product.meshSize || "N/A"}</p>
          </div>
          {/* Net Length */}
          <div>
            <h3 className="text-sm font-medium text-gray-500">Net Length</h3>
            <p className="text-base text-gray-700">
              {product.netLength !== null && product.netLength !== undefined ? `${product.netLength} m` : "N/A"}
            </p>
          </div>
          {/* Net Height */}
          <div>
            <h3 className="text-sm font-medium text-gray-500">Net Height</h3>
            <p className="text-base text-gray-700">
              {product.netHeight !== null && product.netHeight !== undefined ? `${product.netHeight} m` : "N/A"}
            </p>
          </div>
          {/* Thread Diameter */}
          <div>
            <h3 className="text-sm font-medium text-gray-500">Thread Diameter</h3>
            <p className="text-base text-gray-700">
              {product.threadDiameter !== null && product.threadDiameter !== undefined ? `${product.threadDiameter} mm` : "N/A"}
            </p>
          </div>
          {/* Breaking Strength */}
          <div>
            <h3 className="text-sm font-medium text-gray-500">Breaking Strength</h3>
            <p className="text-base text-gray-700">
              {product.breakingStrength !== null && product.breakingStrength !== undefined ? `${product.breakingStrength} kg` : "N/A"}
            </p>
          </div>
          {/* Color */}
          <div>
            <h3 className="text-sm font-medium text-gray-500">Color</h3>
            <p className="text-base text-gray-700">{product.color || "N/A"}</p>
          </div>
          {/* Usage */}
          <div>
            <h3 className="text-sm font-medium text-gray-500">Usage</h3>
            <p className="text-base text-gray-700">{product.usage || "N/A"}</p>
          </div>
          {/* Target Fish/Species */}
          <div>
            <h3 className="text-sm font-medium text-gray-500">Target Fish/Species</h3>
            <p className="text-base text-gray-700">{product.targetFishOrSpecies || "N/A"}</p>
          </div>
          {/* Water Type */}
          <div>
            <h3 className="text-sm font-medium text-gray-500">Water Type</h3>
            <p className="text-base text-gray-700">{product.waterType || "N/A"}</p>
          </div>
          {/* Country of Origin */}
          <div>
            <h3 className="text-sm font-medium text-gray-500">Country of Origin</h3>
            <p className="text-base text-gray-700">{product.countryOfOrigin || "N/A"}</p>
          </div>
          {/* Weight */}
          <div>
            <h3 className="text-sm font-medium text-gray-500">Weight</h3>
            <p className="text-base text-gray-700">
              {product.weight !== null && product.weight !== undefined ? `${product.weight} kg` : "N/A"}
            </p>
          </div>
          {/* Customization Availability */}
          <div>
            <h3 className="text-sm font-medium text-gray-500">Customization Available</h3>
            <p className="text-base text-gray-700">
              {product.customizationAvailability ? "Yes" : "No"}
            </p>
          </div>
          {/* Shipping Information */}
          <div>
            <h3 className="text-sm font-medium text-gray-500">Shipping Information</h3>
            <p className="text-base text-gray-700">{product.shippingInformation || "N/A"}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SingleProductDynamicFields;