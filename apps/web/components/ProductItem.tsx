"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FaHeart } from "react-icons/fa6";

import { sanitize } from "@/lib/sanitize";
import { useWishlistStore } from "@/app/_zustand/wishlistStore";
import { useProductStore } from "@/app/_zustand/store";

export interface Product {
  id: string;
  title: string;
  price: number;
  mainImage?: string;
  slug?: string;
  rating?: number;
  inStock?: number | boolean;
  merchantId?: string;
  sellerName?: string;

  // Fishnet-specific fields
  netType?: string;
  meshSize?: string;
  material?: string;
  netLength?: number | string;
  netHeight?: number | string;
  color?: string;
}

interface ProductItemProps {
  product: Product;
  color?: string;
}

const ProductItem = ({
  product,
  color = "black",
}: ProductItemProps) => {
  const { wishlist, setWishlist } = useWishlistStore();
  const { addToCart } = useProductStore();

  const isInWishlist = wishlist.some(
    (item) => item.id === product.id
  );

  const productSlug = product.slug || product.id;

  const stockCount =
    typeof product.inStock === "number"
      ? product.inStock
      : product.inStock
        ? 1
        : 0;

  const handleWishlistToggle = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInWishlist) {
      setWishlist(
        wishlist.filter((item) => item.id !== product.id)
      );
      return;
    }

    setWishlist([
      ...wishlist,
      {
        ...product,
        quantity: 1,
      },
    ]);
  };

  const handleAddToCart = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.mainImage || "",
      amount: 1,
      merchantId: product.merchantId || "",
      sellerName: product.sellerName || "Unknown Seller",
    });
  };

  return (
    <article className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Link
          href={`/product/${productSlug}`}
          className="block h-full w-full"
          aria-label={`View ${sanitize(product.title)}`}
        >
          <Image
            src={
              product.mainImage
                ? `/${product.mainImage}`
                : "/product_placeholder.jpg"
            }
            alt={sanitize(product.title) || "Fishnet image"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        <button
          type="button"
          onClick={handleWishlistToggle}
          aria-label={
            isInWishlist
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-all hover:scale-110 hover:bg-white"
        >
          <FaHeart
            className={
              isInWishlist
                ? "text-lg text-red-500"
                : "text-lg text-gray-500"
            }
          />
        </button>

        <div className="absolute bottom-3 left-3">
          {stockCount > 0 ? (
            <span className="rounded bg-green-600 px-2 py-1 text-xs font-medium text-white shadow-sm">
              In Stock
            </span>
          ) : (
            <span className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white shadow-sm">
              Out of Stock
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        <Link
          href={`/product/${productSlug}`}
          className="block"
        >
          <h3
            className={`line-clamp-2 min-h-[48px] text-base font-semibold ${
              color === "white"
                ? "text-white"
                : "text-gray-900"
            } transition-colors hover:text-blue-600`}
          >
            {sanitize(product.title)}
          </h3>
        </Link>

        <div className="mt-2 space-y-1 text-sm text-gray-600">
          {product.netType && (
            <p className="flex items-center gap-1">
              <span className="font-medium">Net Type:</span>
              <span>{sanitize(product.netType)}</span>
            </p>
          )}

          {product.material && (
            <p className="flex items-center gap-1">
              <span className="font-medium">Material:</span>
              <span>{sanitize(product.material)}</span>
            </p>
          )}

          {product.meshSize && (
            <p className="flex items-center gap-1">
              <span className="font-medium">Mesh Size:</span>
              <span>{sanitize(product.meshSize)}</span>
            </p>
          )}

          {(product.netLength || product.netHeight) && (
            <p className="flex items-center gap-1">
              <span className="font-medium">Size:</span>
              <span>
                {product.netLength}
                {product.netHeight
                  ? ` x ${product.netHeight}`
                  : ""}
                {product.netLength && product.netHeight
                  ? "m"
                  : ""}
              </span>
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xl font-bold text-gray-900">
            ${Number(product.price || 0).toFixed(2)}
          </p>

          {stockCount > 0 && (
            <span className="text-xs text-gray-500">
              {stockCount} available
            </span>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <Link
            href={`/product/${productSlug}`}
            className="flex flex-1 items-center justify-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-blue-600 hover:text-blue-600"
          >
            View Details
          </Link>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={stockCount <= 0}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductItem;
