// *********************
// Role of the component: Enhanced cart icon with quantity and preview
// Name of the component: CartElement.tsx
// Developer: Enhanced by Claude
// Version: 2.0
// Component call: <CartElement />
// Input parameters: no input parameters
// Output: Enhanced cart icon with quantity badge and hover preview
// *********************

"use client";
import Link from 'next/link'
import Image from 'next/image'
import React, { useState } from 'react'
import { FaCartShopping } from 'react-icons/fa6'
import { useProductStore } from "@/app/_zustand/store";

const CartElement = () => {
  const { products, allQuantity, total } = useProductStore();
  const [isHovered, setIsHovered] = useState(false);

  // Helper function to sanitize strings (basic implementation)
  const sanitize = (str) => {
    if (!str) return "";
    return str.toString().replace(/[<>]/g, "");
  };

  return (
    <div className="relative group">
      <Link href="/cart">
        <FaCartShopping className="text-2xl text-black group-hover:text-blue-600 transition-colors" />
        {allQuantity > 0 && (
          <span className="block w-6 h-6 bg-blue-600 text-white rounded-full flex justify-center items-center absolute top-[-10px] right-[-10px] text-xs font-bold">
            {allQuantity}
          </span>
        )}
      </Link>

      {/* Cart Preview on Hover */}
      {isHovered && allQuantity > 0 && (
        <div className="absolute right-0 mt-4 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 overflow-hidden z-20 origin-top-right group-hover:block">
          <div className="py-2">
            {/* Cart Header */}
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-700">Your Cart</h3>
              <span className="text-sm text-gray-500">{allQuantity} items</span>
            </div>

            {/* Cart Items */}
            <div className="max-h-[200px] overflow-y-auto">
              {products.length > 0 ? (
                products.map((item, index) => (
                  <div key={index} className="px-4 py-3 border-t border-gray-100 first:border-t-0 flex space-x-3">
                    {/* Product Image */}
                    <div className="w-12 h-12 flex-shrink-0">
                      <Image
                        src={
                          item.image
                            ? `/${item.image}`
                            : "/product_placeholder.jpg"
                        }
                        alt={sanitize(item.title) || "Product"}
                        className="object-cover w-full h-full rounded"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {sanitize(item.title) || "Product"}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        ${item.price?.toFixed(2) || "0.00"} x {item.amount}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <div className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-700 cursor-pointer">
                      {/* Would implement remove functionality */}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-4 text-center text-gray-500">
                  Your cart is empty
                </div>
              )}
            </div>

            {/* Cart Footer */}
            <div className="px-4 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Subtotal:</span>
                <span className="text-sm font-medium text-gray-900">${total?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="flex w-full">
                <Link
                  href="/cart"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors"
                >
                  View Cart
                </Link>
                <Link
                  href="/checkout"
                  className="ml-3 flex-1 px-4 py-2 bg-green-600 text-white text-center rounded-md hover:bg-green-700 transition-colors"
                >
                  Checkout
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartElement