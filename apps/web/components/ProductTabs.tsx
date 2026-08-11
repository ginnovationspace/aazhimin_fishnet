'use client';

import React, { useState } from "react";
import { formatCategoryName } from "@/utils/categoryFormating";
import { sanitize, sanitizeHtml } from "@/lib/sanitize";

interface ProductTabsProduct {
  description?: string | null;
  manufacturer?: string | null;
  category?: {
    name?: string | null;
  } | null;
  // Fishnet-specific fields
  netType?: string;
  meshSize?: string;
  material?: string;
  netLength?: number | string;
  netHeight?: number | string;
  threadDiameter?: number | string;
  breakingStrength?: number | string;
  color?: string;
  usage?: string;
  targetFishOrSpecies?: string;
  waterType?: string;
  countryOfOrigin?: string;
  weight?: number | string;
}

interface ProductTabsProps {
  product: ProductTabsProduct;
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const [currentProductTab, setCurrentProductTab] = useState(0);

  return (
    <div className="w-full">
      {/* Tabs */}
      <div
        role="tablist"
        className="flex items-center gap-6 border-b border-gray-200"
      >
        <button
          type="button"
          role="tab"
          aria-selected={currentProductTab === 0}
          onClick={() => setCurrentProductTab(0)}
          className={`pb-4 text-lg transition-colors max-[500px]:text-base max-[370px]:text-sm ${
            currentProductTab === 0
              ? "border-b-2 border-blue-600 font-semibold text-blue-600"
              : "text-gray-600 hover:text-blue-600"
          }`}
        >
          Description
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={currentProductTab === 1}
          onClick={() => setCurrentProductTab(1)}
          className={`pb-4 text-lg transition-colors max-[500px]:text-base max-[370px]:text-sm ${
            currentProductTab === 1
              ? "border-b-2 border-blue-600 font-semibold text-blue-600"
              : "text-gray-600 hover:text-blue-600"
          }`}
        >
          Specifications
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-6">
        {/* Description */}
        {currentProductTab === 0 && (
          <div
            className="text-lg leading-8 text-gray-700 max-sm:text-base"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(product?.description ?? ""),
            }}
          />
        )}

        {/* Specifications */}
        {currentProductTab === 1 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-base">
              <tbody>
                {/* Net Type */}
                {product.netType && (
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-4 font-semibold text-gray-700">
                      Net Type
                    </th>
                    <td className="px-4 py-4 text-gray-600">
                      {sanitize(product.netType)}
                    </td>
                  </tr>
                )}

                {/* Material */}
                {product.material && (
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-4 font-semibold text-gray-700">
                      Material
                    </th>
                    <td className="px-4 py-4 text-gray-600">
                      {sanitize(product.material)}
                    </td>
                  </tr>
                )}

                {/* Mesh Size */}
                {product.meshSize && (
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-4 font-semibold text-gray-700">
                      Mesh Size
                    </th>
                    <td className="px-4 py-4 text-gray-600">
                      {sanitize(product.meshSize)}
                    </td>
                  </tr>
                )}

                {/* Dimensions */}
                {(product.netLength !== undefined && product.netLength !== null) ||
                 (product.netHeight !== undefined && product.netHeight !== null) && (
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-4 font-semibold text-gray-700">
                      Dimensions
                    </th>
                    <td className="px-4 py-4 text-gray-600">
                      {product.netLength !== undefined && product.netLength !== null
                        ? `${product.netLength}${product.netHeight !== undefined && product.netHeight !== null ? ` x ${product.netHeight}` : ''} m`
                        : product.netHeight !== undefined && product.netHeight !== null
                          ? `${product.netHeight} m`
                          : 'N/A'}
                    </td>
                  </tr>
                )}

                {/* Thread Diameter */}
                {product.threadDiameter !== undefined && product.threadDiameter !== null && (
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-4 font-semibold text-gray-700">
                      Thread Diameter
                    </th>
                    <td className="px-4 py-4 text-gray-600">
                      {sanitize(product.threadDiameter)} mm
                    </td>
                  </tr>
                )}

                {/* Breaking Strength */}
                {product.breakingStrength !== undefined && product.breakingStrength !== null && (
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-4 font-semibold text-gray-700">
                      Breaking Strength
                    </th>
                    <td className="px-4 py-4 text-gray-600">
                      {sanitize(product.breakingStrength)} kg
                    </td>
                  </tr>
                )}

                {/* Color */}
                {product.color && (
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-4 font-semibold text-gray-700">
                      Color
                    </th>
                    <td className="px-4 py-4 text-gray-600">
                      {sanitize(product.color)}
                    </td>
                  </tr>
                )}

                {/* Usage */}
                {product.usage && (
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-4 font-semibold text-gray-700">
                      Usage
                    </th>
                    <td className="px-4 py-4 text-gray-600">
                      {sanitize(product.usage)}
                    </td>
                  </tr>
                )}

                {/* Target Fish/Species */}
                {product.targetFishOrSpecies && (
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-4 font-semibold text-gray-700">
                      Target Fish/Species
                    </th>
                    <td className="px-4 py-4 text-gray-600">
                      {sanitize(product.targetFishOrSpecies)}
                    </td>
                  </tr>
                )}

                {/* Water Type */}
                {product.waterType && (
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-4 font-semibold text-gray-700">
                      Water Type
                    </th>
                    <td className="px-4 py-4 text-gray-600">
                      {sanitize(product.waterType)}
                    </td>
                  </tr>
                )}

                {/* Country of Origin */}
                {product.countryOfOrigin && (
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-4 font-semibold text-gray-700">
                      Country of Origin
                    </th>
                    <td className="px-4 py-4 text-gray-600">
                      {sanitize(product.countryOfOrigin)}
                    </td>
                  </tr>
                )}

                {/* Weight */}
                {product.weight !== undefined && product.weight !== null && (
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-4 font-semibold text-gray-700">
                      Weight
                    </th>
                    <td className="px-4 py-4 text-gray-600">
                      {sanitize(product.weight)} kg
                    </td>
                  </tr>
                )}

                {/* Manufacturer (if available) */}
                {product.manufacturer && (
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-4 font-semibold text-gray-700">
                      Manufacturer
                    </th>
                    <td className="px-4 py-4 text-gray-600">
                      {sanitize(product.manufacturer)}
                    </td>
                  </tr>
                )}

                {/* Category */}
                {product.category?.name && (
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-4 font-semibold text-gray-700">
                      Category
                    </th>
                    <td className="px-4 py-4 text-gray-600">
                      {sanitize(formatCategoryName(product.category.name))}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;