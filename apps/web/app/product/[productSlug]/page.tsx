import {
  StockAvailabillity,
  UrgencyText,

  ProductTabs,
  SingleProductDynamicFields,

} from "@/components";
import apiClient from "@/lib/api";
import Image from "next/image";
import { notFound, useRouter } from "next/navigation";
import React, { useState } from "react";
import { FaSquareFacebook, FaSquareXTwitter, FaSquarePinterest } from "react-icons/fa6";
import { sanitize } from "@/lib/sanitize";
import { useCartStore } from "@/app/_zustand/cartStore"; // Assuming this exists
import { useToast } from "@/hooks/use-toast"; // Assuming this exists

interface ImageItem {
  imageID: string;
  productID: string;
  image: string;
}

interface SingleProductPageProps {
  params: Promise<{  productSlug: string, id: string }>;
}

const SingleProductPage = async ({ params }: SingleProductPageProps) => {
  const paramsAwaited = await params;
  const router = useRouter();
  const { addToCart } = useCartStore(); // Assuming cart store hook
  const { toast } = useToast(); // Assuming toast hook

  // sending API request for a single product with a given product slug
  const data = await apiClient.get(
    `/api/slugs/${paramsAwaited?.productSlug}`
  );
  const product = await data.json();

  // sending API request for more than 1 product image if it exists
  const imagesData = await apiClient.get(
    `/api/images/${paramsAwaited?.id}`
  );
  const images = await imagesData.json();

  if (!product || product.error) {
    notFound();
  }

  // State for image gallery
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "Added to cart!",
      description: `${product.title} has been added to your cart.`,
    });
  };

  const handleViewCart = () => {
    router.push("/cart");
  };

  return (
    <div className="bg-white">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8">
            {/* Image Gallery */}
            <div className="space-y-6">
              {/* Main Image */}
              <div className="relative h-96 w-full bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={
                    product?.mainImage
                      ? `/${product?.mainImage}`
                      : "/product_placeholder.jpg"
                  }
                  alt={sanitize(product?.title) || "Product image"}
                  className="object-center w-full h-full object-cover"
                />

                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 right-3 bg-white bg-opacity-80 px-3 py-1 rounded text-sm font-medium">
                    {currentImageIndex + 1} / {images.length + 1}
                  </div>
                )}

                {/* Thumbnail Navigation */}
                {images.length > 0 && (
                  <div className="absolute bottom-3 left-3 flex space-x-2">
                    {[...images, { imageID: "main", image: product?.mainImage || "" }].map(
                      (thumb, index) => (
                        <button
                          key={thumb.imageID}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-10 h-10 border-2 ${
                            currentImageIndex === index
                              ? "border-blue-600"
                              : "border-transparent hover:border-gray-300"
                          } rounded overflow-hidden`}
                        >
                          <Image
                            src={
                              thumb.imageID === "main"
                                ? (product?.mainImage
                                  ? `/${product?.mainImage}`
                                  : "/product_placeholder.jpg")
                                : `/${thumb.image}`}
                            alt="thumbnail"
                            className="object-cover w-full h-full"
                          />
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {[...images, { imageID: "main", image: product?.mainImage || "" }].map(
                  (thumb, index) => (
                    <button
                      key={thumb.imageID}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-16 h-16 border-2 ${
                        currentImageIndex === index
                          ? "border-blue-600"
                          : "border-transparent hover:border-gray-300"
                      } rounded overflow-hidden flex-shrink-0`}
                    >
                      <Image
                        src={
                          thumb.imageID === "main"
                            ? (product?.mainImage
                              ? `/${product?.mainImage}`
                              : "/product_placeholder.jpg")
                            : `/${thumb.image}`}
                        alt="thumbnail"
                        className="object-cover w-full h-full"
                      />
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  {sanitize(product?.title)}
                </h1>

                <div className="flex items-baseline gap-4">
                  <p className="text-2xl font-bold">
                    ${product?.price?.toFixed(2) || "0.00"}
                  </p>

                  {/* Price Comparison if on sale */}
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="line-through text-gray-500">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                      <span className="ml-2 text-red-600 font-semibold">
                        {-Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Stock and Urgency */}
              <div className="space-y-3">
                <StockAvailabillity
                  stock={product?.inStock || 0}
                  inStock={!!(product?.inStock && product?.inStock > 0)}
                />
                <UrgencyText
                  urgencyLevel={product?.urgencyLevel || "NORMAL"}
                />
              </div>

              {/* Description */}
              <div className="pt-4 border-t border-gray-200">
                <h2 className="text-lg font-semibold mb-3">Product Description</h2>
                <div className="prose text-gray-700">
                  {product.description?.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">{paragraph}</p>
                  )) || <p className="text-gray-500 italic">No description available</p>}
                </div>
              </div>

              {/* Dynamic Fields (like manufacturer, etc.) */}
              <SingleProductDynamicFields product={product} />

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row sm:gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 px-5 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  Add to Cart
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.646.646-.646 1.65 0 2.294m7.586 7.586a2.236 2.236 0 01-.398 1.186m-.01-1.374a2.236 2.236 0 011.186-.398m.398 1.186V21a2 2 0 01-2 2h-.5a2 2 0 01-2-2 2 2 0 00-2-2 2 2 0 002 2h1.5a2 2 0 012 2 2 2 0 002-2m0 0a2 2 0 001.414-5.828l1.293-1.293A2 2 0 019.707 5H19a2 2 0 012 2v1a2 2 0 01-2 2z"></path>
                  </svg>
                </button>

                <button
                  onClick={handleViewCart}
                  className="flex-1 px-5 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  View Cart
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.646.646-.646 1.65 0 2.294m7.586 7.586a2.236 2.236 0 01-.398 1.186m-.01-1.374a2.236 2.236 0 011.186-.398m.398 1.186V21a2 2 0 01-2 2h-.5a2 2 0 01-2-2 2 2 0 002-2 2 2 0 002 2h1.5a2 2 0 012 2 2 2 0 002-2m0 0a2 2 0 001.414-5.828l1.293-1.293A2 2 0 019.707 5H19a2 2 0 012 2v1a2 2 0 01-2 2z"></path>
                  </svg>
                </button>
              </div>

              {/* Wishlist Button */}
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => {
                    // Wishlist toggle logic would go here
                    toast({
                      title: "Added to wishlist!",
                      description: `${product.title} has been added to your wishlist.`,
                    });
                  }}
                  className="px-5 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                >
                  Save to Wishlist
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 11.25a3.25 3.25 0 116.5 0 3.25 3.25 0 01-6.5 0z"></path>
                  </svg>
                </button>
              </div>

              {/* Social Sharing */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h2 className="text-lg font-semibold mb-4">Share this product</h2>
                <div className="flex gap-4 justify-center">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 p-2 rounded hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    <FaSquareFacebook className="text-blue-500" />
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this amazing ${product.title}!`)}&url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 p-2 rounded hover:bg-blue-500 hover:text-white transition-colors"
                  >
                    <FaSquareXTwitter className="text-blue-400" />
                  </a>
                  <a
                    href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&description=${encodeURIComponent(`Check out this amazing ${product.title}!`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 p-2 rounded hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <FaSquarePinterest className="text-red-500" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-12">
          <ProductTabs product={product} />
        </div>

        {/* Related Products Section */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-center mb-8">You Might Also Like</h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {/* Placeholder for related products - would be fetched from API */}
            {/* For now, showing some sample cards - in real implementation, this would come from /api/products?related=true&productId=... */}
            {[1,2,3,4,5,6,7,8].map((_, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg hover:shadow-lg transition-shadow">
                <div className="h-36 w-full bg-gray-200 mb-3 rounded"></div>
                <h3 className="font-medium text-gray-700 mb-2 line-clamp-2">Related Product Title</h3>
                <p className="font-bold text-lg">$29.99</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                    In Stock
                  </span>
                </div>
                <button
                  className="w-full mt-3 px-3 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors text-sm"
                >
                  Quick View
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleProductPage;