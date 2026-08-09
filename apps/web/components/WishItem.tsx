// *********************
// Role of the component: Wishlist item component for displaying products in wishlist
// Name of the component: WishItem.tsx
// Developer: Enhanced by Claude
// Version: 1.0
// Component call: <WishItem item={item} />
// Input parameters: { id: string; title: string; price: number; image: string; slug: string; stockAvailabillity: number }
// Output: Wishlist item component with image, title, stock status, and remove button
// *********************

"use client";

import Image from "next/image";
import React from "react";
import { useWishlistStore } from "@/app/_zustand/wishlistStore";
import { toast } from "react-hot-toast";
import { sanitize } from "@/lib/sanitize";

interface WishItemProps {
  id: string;
  title: string;
  price: number;
  image: string;
  slug: string;
  stockAvailabillity: number;
}

const WishItem = ({
  id,
  title,
  price,
  image,
  slug,
  stockAvailabillity,
}: WishItemProps) => {
  const { wishlist, setWishlist } = useWishlistStore();

  const isInWishlist = wishlist.some(item => item.id === id);

  const handleRemoveFromWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist(wishlist.filter(item => item.id !== id));
    toast.success("Removed from wishlist");
  };

  return (
    <tr>
      {/* Checkbox column */}
      <td>
        <label className="cursor-pointer">
          <input
            type="checkbox"
            className="checkbox"
            checked={isInWishlist}
            onClick={handleRemoveFromWishlist}
          />
        </label>
      </td>

      {/* Image column */}
      <td className="text-accent-content">
        <div className="flex items-center justify-center">
          <div className="relative h-16 w-16">
            <Image
              src={image ? `/${image}` : "/product_placeholder.jpg"}
              alt={sanitize(title) || "Product image"}
              className="object-cover w-full h-full rounded"
            />
          </div>
        </div>
      </td>

      {/* Name column */}
      <td className="text-accent-content">
        <div className="flex flex-col items-start">
          <div className="font-medium text-gray-900">
            {sanitize(title)}
          </div>
          <div className="text-xs text-gray-500">
            {/* Price would go here if needed */}
          </div>
        </div>
      </td>

      {/* Stock status column */}
      <td className="text-accent-content">
        {stockAvailabillity > 0 ? (
          <span className="badge badge-success text-white badge-sm">
            In Stock ({stockAvailabillity})
          </span>
        ) : (
          <span className="badge badge-error text-white badge-sm">
            Out of Stock
          </span>
        )}
      </td>

      {/* Action column */}
      <td className="text-accent-content">
        <div className="flex items-center space-x-2">
          {/* View product link */}
          <a
            href={`/product/${slug}`}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            View
          </a>

          {/* Remove from wishlist button */}
          <button
            onClick={handleRemoveFromWishlist}
            className="text-xs text-red-600 hover:text-red-800"
          >
            Remove
          </button>
        </div>
      </td>
    </tr>
  );
};

export default WishItem;
