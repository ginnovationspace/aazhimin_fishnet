// *********************
// Role of the component: Enhanced product item component with improved UI/UX
// Name of the component: ProductItem.tsx
// Developer: Enhanced by Claude
// Version: 2.0
// Component call: <ProductItem product={product} color={color} />
// Input parameters: { product: Product; color: string; }
// Output: Product item component with hover effects, quick view, and better visual hierarchy
// *********************

"use client";

import Image from "next/image";
import React, { useState } from "react";
import Link from "next/link";
import { FaHeart, FaEye, faCartPlus } from "react-icons/fa";

import { sanitize } from "@/lib/sanitize";
import { useWishlistStore } from "@/app/_zustand/wishlistStore";
import { useProductStore } from "@/app/_zustand/store";

const ProductItem = ({
  product,
  color,
}: {
  product: Product;
  color: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { wishlist, setWishlist } = useWishlistStore();
  const { addToCart } = useProductStore(); // Using the product store which has addToCart action

  const isInWishlist = wishlist.some(item => item.id === product.id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent link navigation
    if (isInWishlist) {
      setWishlist(wishlist.filter(item => item.id !== product.id));
    } else {
      setWishlist([...wishlist, { ...product, quantity: 1 }]);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent link navigation
    addToCart(product);
    // Could show a toast notification here
  };

  return (
    <div
      className="relative group hover:shadow-lg transition-shadow duration-300 rounded-lg overflow-hidden bg-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image with Hover Effect */}
      <div className="relative h-48 w-full">
        <Link href={`/product/${product.slug}`} className="block h-full">
          <Image
            src={
              product.mainImage
                ? `/${product.mainImage}`
                : "/product_placeholder.jpg"
            }
            alt={sanitize(product?.title) || "Product image"}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
          {/* Quick View/Action Buttons on Hover */}
          {isHovered && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 text-white">
              <div className="space-y-3">
                <button
                  onClick={handleWishlistToggle}
                  className="p-2 rounded hover:bg-white hover:bg-opacity-20 transition-colors"
                  aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <FaHeart
                    className={`${isInWishlist ? "text-red-500" : "text-white"} text-xl`}
                  />
                </button>
                <button
                  onClick={handleAddToCart}
                  className="p-2 rounded hover:bg-white hover:bg-opacity-20 transition-colors"
                  aria-label="Add to cart"
                >
                  <FaEye className="text-xl" /> {/* Using eye for quick view, could change to cart */}
                </button>
              </div>
            </div>
          )}

          {/* Sale/Badge Ribbon */}
          {product.rating && product.rating >= 4 && (
            <div className="absolute top-3 left-3 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">
              �� ⭐ {product.rating}
            </div>
          )}
        </Link>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <Link
          href={`/product/${product.slug}`}
          className="mb-2 line-clamp-2"
        >
          <h3
            className={`text-${color === "black" ? "black" : "white"} font-semibold line-clamp-2`}
          >
            {sanitize(product.title)}
          </h3>
        </Link>

        <p className="mt-2 font-bold text-xl">
          ${product.price}
        </p>

        {/* Availability Badge */}
        <div className="mt-2 flex items-center gap-2">
          {product.inStock > 0 ? (
            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
              In Stock ({product.inStock})
            </span>
          ) : (
            <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded">
              Out of Stock
            </span>
          )}
        </div>
      </div>

      {/* Primary Action Button */}
      <Link
        href={`/product/${product.slug}`}
        className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
      >
        View Details
      </Link>
    </div>
  );
};

export default ProductItem;