"use client";

import {
  StockAvailabillity,
  UrgencyText,
  ProductTabs,
  SingleProductDynamicFields,
} from "@/components";
import apiClient from "@/lib/api";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { sanitize } from "@/lib/sanitize";
import { useProductStore } from "@/app/_zustand/store";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/lib/auth-client";

/* ============================================================
   TYPES
============================================================ */

interface ImageItem {
  imageID: string;
  productID?: string;
  image: string;
}

interface Product {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  price: number;
  originalPrice?: number | null;
  mainImage?: string | null;
  inStock: number;

  merchantId?: string | null;

  merchant?: {
    id?: string;
    name?: string | null;
  } | null;

  manufacturer?: string | null;

  category?: {
    id?: string;
    name?: string | null;
  } | null;

  rating?: number | null;
  urgencyLevel?: string | null;
}

interface Review {
  id: string;
  createdAt: string;

  productQuality: number;
  accuracy: number;
  sellerCommunication: number;
  delivery: number;
  overallExperience: number;

  comment?: string | null;

  buyer?: {
    email?: string | null;
  } | null;
}

interface ReviewForm {
  productQuality: number;
  accuracy: number;
  sellerCommunication: number;
  delivery: number;
  overallExperience: number;
  comment: string;
}

const defaultReviewForm: ReviewForm = {
  productQuality: 5,
  accuracy: 5,
  sellerCommunication: 5,
  delivery: 5,
  overallExperience: 5,
  comment: "",
};

/* ============================================================
   PAGE
============================================================ */

const SingleProductPage = () => {
  const params = useParams<{
    productSlug: string;
  }>();

  const router = useRouter();

  const { addToCart } = useProductStore();

  const { toast } = useToast();

  const { data: session } = useSession();

  const productSlug = params?.productSlug;

  /* ============================================================
     PRODUCT STATE
  ============================================================ */

  const [product, setProduct] = useState<Product | null>(null);

  const [images, setImages] = useState<ImageItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [productError, setProductError] =
    useState<string | null>(null);

  /* ============================================================
     GALLERY STATE
  ============================================================ */

  const [currentImageIndex, setCurrentImageIndex] =
    useState(0);

  /* ============================================================
     QUANTITY STATE
  ============================================================ */

  const [quantity, setQuantity] = useState(1);

  /* ============================================================
     REVIEW STATE
  ============================================================ */

  const [reviews, setReviews] = useState<Review[]>([]);

  const [reviewsLoading, setReviewsLoading] =
    useState(true);

  const [canReview, setCanReview] = useState(false);

  const [reviewForm, setReviewForm] =
    useState<ReviewForm>(defaultReviewForm);

  const [submittingReview, setSubmittingReview] =
    useState(false);

  const [reviewError, setReviewError] =
    useState<string | null>(null);

  const [reviewSuccess, setReviewSuccess] =
    useState<string | null>(null);

  /* ============================================================
     LOAD PRODUCT
  ============================================================ */

  useEffect(() => {
    if (!productSlug) {
      return;
    }

    let mounted = true;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setProductError(null);

        const response = await apiClient.get(
          `/api/slugs/${encodeURIComponent(productSlug)}`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to load product (${response.status})`
          );
        }

        const productData: Product =
          await response.json();

        if (!mounted) {
          return;
        }

        if (!productData || !productData.id) {
          throw new Error("Product not found");
        }

        setProduct(productData);

        /* -----------------------------------------------
           LOAD PRODUCT IMAGES
        ------------------------------------------------ */

        try {
          const imagesResponse =
            await apiClient.get(
              `/api/images/${productData.id}`
            );

          if (imagesResponse.ok) {
            const imagesData =
              await imagesResponse.json();

            if (mounted) {
              setImages(
                Array.isArray(imagesData)
                  ? imagesData
                  : imagesData?.images || []
              );
            }
          }
        } catch (imageError) {
          console.error(
            "Failed to load product images:",
            imageError
          );

          if (mounted) {
            setImages([]);
          }
        }
      } catch (error) {
        console.error(
          "Failed to load product:",
          error
        );

        if (mounted) {
          setProductError(
            error instanceof Error
              ? error.message
              : "Failed to load product"
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      mounted = false;
    };
  }, [productSlug]);

  /* ============================================================
     LOAD REVIEWS
  ============================================================ */

  const fetchProductReviews = async (
    productId: string
  ) => {
    try {
      setReviewsLoading(true);

      const response = await apiClient.get(
        `/api/review/products/${productId}/reviews?limit=10`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch reviews (${response.status})`
        );
      }

      const data = await response.json();

      setReviews(
        Array.isArray(data?.reviews)
          ? data.reviews
          : []
      );
    } catch (error) {
      console.error(
        "Error fetching product reviews:",
        error
      );

      /*
       * Reviews are non-critical.
       */
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (!product?.id) {
      return;
    }

    void fetchProductReviews(product.id);

    /*
     * Temporary frontend rule:
     *
     * Authenticated users can see the review form.
     *
     * IMPORTANT:
     * The backend MUST verify that the user purchased
     * and received this product before accepting a review.
     */
    setCanReview(Boolean(session?.user));
  }, [product?.id, session?.user]);

  /* ============================================================
     IMAGE GALLERY
  ============================================================ */

  const galleryImages = useMemo(() => {
    if (!product) {
      return [];
    }

    const mainImage: ImageItem = {
      imageID: "main",
      image: product.mainImage || "",
    };

    return [mainImage, ...images];
  }, [product, images]);

  const currentImage =
    galleryImages[currentImageIndex];

  /* ============================================================
     IMAGE URL
  ============================================================ */

  const getImageUrl = (
    image?: string | null
  ): string => {
    if (!image) {
      return "/product_placeholder.jpg";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("/")
    ) {
      return image;
    }

    return `/${image}`;
  };

  /* ============================================================
     QUANTITY
  ============================================================ */

  const decreaseQuantity = () => {
    setQuantity((previous) =>
      Math.max(previous - 1, 1)
    );
  };

  const increaseQuantity = () => {
    if (!product) {
      return;
    }

    if (product.inStock <= 0) {
      return;
    }

    setQuantity((previous) =>
      Math.min(
        previous + 1,
        product.inStock
      )
    );
  };

  /* ============================================================
     ADD TO CART
  ============================================================ */

  const handleAddToCart = () => {
    if (!product) {
      return;
    }

    if (product.inStock <= 0) {
      toast({
        title: "Out of stock",
        description:
          "This product is currently unavailable.",
      });

      return;
    }

    /*
     * ProductInCart requires merchantId: string.
     *
     * Prefer product.merchantId.
     * Otherwise use merchant.id.
     *
     * If neither exists, do not add the product because
     * the cart requires a valid merchant ID.
     */

    const merchantId =
      product.merchantId ??
      product.merchant?.id ??
      "";

    if (!merchantId) {
      toast({
        title: "Unable to add to cart",
        description:
          "This product does not have a valid seller.",
      });

      return;
    }

    const safeQuantity = Math.min(
      Math.max(quantity, 1),
      product.inStock
    );

    const cartItem = {
      id: product.id,
      title: product.title,
      price: Number(product.price),
      image:
        product.mainImage ||
        "/product_placeholder.jpg",
      amount: safeQuantity,
      merchantId,
      sellerName:
        product.merchant?.name ||
        "Unknown Seller",
    };

    /*
     * merchantId is guaranteed to be string here.
     */
    addToCart(cartItem);

    toast({
      title: "Added to cart!",
      description: `${product.title} x${safeQuantity} has been added to your cart.`,
    });

    setQuantity(1);
  };

  /* ============================================================
     VIEW CART
  ============================================================ */

  const handleViewCart = () => {
    router.push("/cart");
  };

  /* ============================================================
     REVIEW CHANGE
  ============================================================ */

  const handleReviewChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;

    setReviewForm((previous) => ({
      ...previous,
      [name]:
        name === "comment"
          ? value
          : Number.parseInt(value, 10) || 0,
    }));
  };

  /* ============================================================
     SUBMIT REVIEW
  ============================================================ */

  const handleSubmitReview = async () => {
    if (!product) {
      return;
    }

    if (!session?.user) {
      setReviewError(
        "You must be logged in to submit a review."
      );

      return;
    }

    const ratings = [
      reviewForm.productQuality,
      reviewForm.accuracy,
      reviewForm.sellerCommunication,
      reviewForm.delivery,
      reviewForm.overallExperience,
    ];

    const invalidRating = ratings.some(
      (rating) =>
        rating < 1 ||
        rating > 5 ||
        !Number.isInteger(rating)
    );

    if (invalidRating) {
      setReviewError(
        "Please provide valid ratings from 1 to 5."
      );

      return;
    }

    /*
     * IMPORTANT:
     *
     * Your current NextAuth session type does NOT contain
     * orderItemId.
     *
     * Therefore we intentionally do NOT do:
     *
     * session.user.orderItemId
     *
     * and we do NOT send a fake orderItemId.
     *
     * The correct implementation should retrieve the
     * buyer's actual delivered order item from your backend.
     */

    setSubmittingReview(true);
    setReviewError(null);
    setReviewSuccess(null);

    try {
      /*
       * Until the backend provides the actual orderItemId,
       * stop here rather than sending invalid data.
       *
       * This prevents fake reviews / invalid foreign keys.
       */
      setReviewError(
        "A verified purchased order is required to submit a review. Please use your delivered order from your order history."
      );

      return;
    } catch (error) {
      console.error(
        "Error submitting review:",
        error
      );

      setReviewError(
        error instanceof Error
          ? error.message
          : "Failed to submit review."
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  /* ============================================================
     LOADING STATE
  ============================================================ */

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-screen-2xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid animate-pulse grid-cols-1 gap-8 lg:grid-cols-[350px_1fr]">
            <div className="h-96 rounded-lg bg-gray-200" />

            <div className="space-y-6">
              <div className="h-10 w-3/4 rounded bg-gray-200" />

              <div className="h-8 w-1/4 rounded bg-gray-200" />

              <div className="h-20 rounded bg-gray-200" />

              <div className="h-32 rounded bg-gray-200" />

              <div className="h-14 rounded bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================
     ERROR STATE
  ============================================================ */

  if (productError || !product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Product Not Found
          </h1>

          <p className="mt-3 text-gray-600">
            {productError ||
              "We couldn't find this product."}
          </p>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="py-12">

          {/* =====================================================
              PRODUCT TOP SECTION
          ====================================================== */}

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[350px_1fr]">

            {/* ===================================================
                IMAGE GALLERY
            ==================================================== */}

            <div className="space-y-4">

              {/* Main Image */}

              <div className="relative h-96 w-full overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={getImageUrl(
                    currentImage?.image ||
                      product.mainImage
                  )}
                  alt={
                    sanitize(product.title) ||
                    "Product image"
                  }
                  fill
                  sizes="(max-width: 1024px) 100vw, 350px"
                  className="object-cover"
                  priority
                />

                {/* Image Counter */}

                {galleryImages.length > 1 && (
                  <div className="absolute bottom-3 right-3 rounded bg-white/90 px-3 py-1 text-sm font-medium text-gray-800 shadow">
                    {currentImageIndex + 1} /{" "}
                    {galleryImages.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}

              {galleryImages.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {galleryImages.map(
                    (image, index) => (
                      <button
                        key={`${image.imageID}-${index}`}
                        type="button"
                        onClick={() =>
                          setCurrentImageIndex(
                            index
                          )
                        }
                        className={`relative h-16 w-16 overflow-hidden rounded border-2 ${
                          currentImageIndex === index
                            ? "border-blue-600"
                            : "border-transparent hover:border-gray-300"
                        }`}
                        aria-label={`View image ${
                          index + 1
                        }`}
                      >
                        <Image
                          src={getImageUrl(
                            image.image
                          )}
                          alt={`Product thumbnail ${
                            index + 1
                          }`}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* ===================================================
                PRODUCT INFORMATION
            ==================================================== */}

            <div className="space-y-6">

              {/* Title + Price */}

              <div className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  {sanitize(product.title)}
                </h1>

                <div className="flex flex-wrap items-baseline gap-4">

                  <p className="text-2xl font-bold text-gray-900">
                    $
                    {Number(
                      product.price || 0
                    ).toFixed(2)}
                  </p>

                  {product.originalPrice &&
                    product.originalPrice >
                      product.price && (
                      <>
                        <span className="text-gray-500 line-through">
                          $
                          {Number(
                            product.originalPrice
                          ).toFixed(2)}
                        </span>

                        <span className="font-semibold text-red-600">
                          {Math.round(
                            ((product.originalPrice -
                              product.price) /
                              product.originalPrice) *
                              100
                          )}
                          % OFF
                        </span>
                      </>
                    )}
                </div>
              </div>

              {/* =================================================
                  STOCK
              ================================================== */}

              <div className="space-y-3">

                <StockAvailabillity
                  stock={product.inStock || 0}
                  inStock={
                    product.inStock > 0
                      ? 1
                      : 0
                  }
                />

                <UrgencyText
                  stock={product.inStock || 0}
                />
              </div>

              {/* =================================================
                  QUANTITY
              ================================================== */}

              <div>
                <label
                  htmlFor="quantity"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Quantity
                </label>

                <div className="flex items-center">

                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    className="h-10 w-10 rounded-md bg-gray-200 text-gray-700 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>

                  <span className="mx-5 min-w-8 text-center text-lg font-medium text-gray-900">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={increaseQuantity}
                    disabled={
                      product.inStock <= 0 ||
                      quantity >= product.inStock
                    }
                    className="h-10 w-10 rounded-md bg-gray-200 text-gray-700 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>

                </div>

                <p className="mt-2 text-sm text-gray-500">
                  Maximum available:{" "}
                  {product.inStock || 0}
                </p>
              </div>

              {/* =================================================
                  DESCRIPTION
              ================================================== */}

              <div className="border-t border-gray-200 pt-4">

                <h2 className="mb-3 text-lg font-semibold text-gray-900">
                  Product Description
                </h2>

                <div className="prose max-w-none text-gray-700">

                  {product.description ? (
                    product.description
                      .split("\n")
                      .map(
                        (
                          paragraph: string,
                          index: number
                        ) => (
                          <p
                            key={index}
                            className="mb-4"
                          >
                            {sanitize(
                              paragraph
                            )}
                          </p>
                        )
                      )
                  ) : (
                    <p className="italic text-gray-500">
                      No description available.
                    </p>
                  )}

                </div>
              </div>

              {/* =================================================
                  DYNAMIC FIELDS
              ================================================== */}

              <SingleProductDynamicFields
                product={product}
              />

              {/* =================================================
                  ACTION BUTTONS
              ================================================== */}

              <div className="flex flex-col gap-3 sm:flex-row">

                {/* Add To Cart */}

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={
                    product.inStock <= 0
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  Add to Cart

                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293a1.6 1.6 0 000 2.294 1.6 1.6 0 002.293 0L12 13m0 0h3"
                    />
                  </svg>
                </button>

                {/* View Cart */}

                <button
                  type="button"
                  onClick={handleViewCart}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  View Cart

                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293a1.6 1.6 0 000 2.294 1.6 1.6 0 002.293 2.293L12 13m0 0h3"
                    />
                  </svg>
                </button>

              </div>

              {/* =================================================
                  WISHLIST
              ================================================== */}

              <button
                type="button"
                onClick={() => {
                  toast({
                    title:
                      "Added to wishlist!",
                    description: `${product.title} has been added to your wishlist.`,
                  });
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-200 px-5 py-3 font-medium text-gray-800 transition hover:bg-gray-300"
              >
                Save to Wishlist

                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"
                  />
                </svg>
              </button>

              {/* =================================================
                  REVIEWS
              ================================================== */}

              <div className="mt-8 border-t border-gray-200 pt-6">

                <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                  <h2 className="text-lg font-semibold text-gray-900">
                    Customer Reviews
                  </h2>

                  {!reviewsLoading && (
                    <span className="text-sm font-medium text-gray-700">
                      {reviews.length}{" "}
                      {reviews.length === 1
                        ? "Review"
                        : "Reviews"}
                    </span>
                  )}

                </div>

                {/* Review Loading */}

                {reviewsLoading && (
                  <div className="py-8 text-center text-gray-500">
                    Loading reviews...
                  </div>
                )}

                {/* Review Content */}

                {!reviewsLoading && (
                  <>

                    {/* =================================================
                        REVIEW LIST
                    ================================================== */}

                    {reviews.length > 0 ? (
                      <div className="space-y-6">

                        {reviews.map(
                          (review) => (
                            <div
                              key={review.id}
                              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                            >

                              <div className="mb-3 flex items-start justify-between gap-4">

                                <div>

                                  <p className="text-sm font-medium text-gray-700">
                                    {review.buyer
                                      ?.email
                                      ? review.buyer.email.split(
                                          "@"
                                        )[0]
                                      : "Anonymous"}
                                  </p>

                                  <div className="mt-1 flex text-yellow-500">
                                    {[1, 2, 3, 4, 5].map(
                                      (star) => (
                                        <span
                                          key={star}
                                          aria-hidden="true"
                                        >
                                          {star <=
                                          review.productQuality
                                            ? "★"
                                            : "☆"}
                                        </span>
                                      )
                                    )}
                                  </div>

                                </div>

                                <span className="text-xs text-gray-500">
                                  {new Date(
                                    review.createdAt
                                  ).toLocaleDateString()}
                                </span>

                              </div>

                              <div className="space-y-2 text-sm text-gray-700">

                                <p>
                                  <strong>
                                    Product Quality:
                                  </strong>{" "}
                                  {
                                    review.productQuality
                                  }
                                  /5
                                </p>

                                <p>
                                  <strong>
                                    Accuracy:
                                  </strong>{" "}
                                  {review.accuracy}
                                  /5
                                </p>

                                <p>
                                  <strong>
                                    Seller Communication:
                                  </strong>{" "}
                                  {
                                    review.sellerCommunication
                                  }
                                  /5
                                </p>

                                <p>
                                  <strong>
                                    Delivery:
                                  </strong>{" "}
                                  {review.delivery}
                                  /5
                                </p>

                                <p>
                                  <strong>
                                    Overall Experience:
                                  </strong>{" "}
                                  {
                                    review.overallExperience
                                  }
                                  /5
                                </p>

                                {review.comment && (
                                  <div className="pt-2">
                                    <p>
                                      <strong>
                                        Comment:
                                      </strong>{" "}
                                      {sanitize(
                                        review.comment
                                      )}
                                    </p>
                                  </div>
                                )}

                              </div>

                            </div>
                          )
                        )}

                      </div>
                    ) : (
                      <div className="rounded-lg bg-gray-50 py-8 text-center">
                        <p className="text-gray-500">
                          No reviews yet. Be the
                          first to review this
                          product!
                        </p>
                      </div>
                    )}

                    {/* =================================================
                        WRITE REVIEW
                    ================================================== */}

                    {session?.user &&
                      canReview && (
                        <div
                          id="review-form"
                          className="mt-8 border-t border-gray-200 pt-6"
                        >

                          <h2 className="mb-2 text-lg font-semibold text-gray-900">
                            Write a Review
                          </h2>

                          <p className="mb-4 text-sm text-gray-600">
                            Share your experience
                            with this product.
                          </p>

                          {/* Error */}

                          {reviewError && (
                            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
                              <p className="text-sm text-red-700">
                                {reviewError}
                              </p>
                            </div>
                          )}

                          {/* Success */}

                          {reviewSuccess && (
                            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3">
                              <p className="text-sm text-green-700">
                                {reviewSuccess}
                              </p>
                            </div>
                          )}

                          <form
                            onSubmit={(event) => {
                              event.preventDefault();

                              void handleSubmitReview();
                            }}
                            className="space-y-5"
                          >

                            {/* Ratings */}

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                              {(
                                [
                                  [
                                    "productQuality",
                                    "Product Quality",
                                  ],
                                  [
                                    "accuracy",
                                    "Accuracy",
                                  ],
                                  [
                                    "sellerCommunication",
                                    "Seller Communication",
                                  ],
                                  [
                                    "delivery",
                                    "Delivery",
                                  ],
                                  [
                                    "overallExperience",
                                    "Overall Experience",
                                  ],
                                ] as const
                              ).map(
                                ([
                                  field,
                                  label,
                                ]) => (
                                  <div
                                    key={
                                      field
                                    }
                                  >

                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                      {label}
                                    </label>

                                    <div className="flex items-center gap-2">

                                      {[1, 2, 3, 4, 5].map(
                                        (
                                          star
                                        ) => (
                                          <label
                                            key={
                                              star
                                            }
                                            className="flex cursor-pointer items-center gap-1"
                                          >

                                            <input
                                              type="radio"
                                              name={
                                                field
                                              }
                                              value={
                                                star
                                              }
                                              checked={
                                                reviewForm[
                                                  field
                                                ] ===
                                                star
                                              }
                                              onChange={
                                                handleReviewChange
                                              }
                                              className="h-4 w-4 text-blue-600"
                                            />

                                            <span className="text-xs text-gray-600">
                                              {
                                                star
                                              }
                                            </span>

                                          </label>
                                        )
                                      )}

                                    </div>
                                  </div>
                                )
                              )}

                            </div>

                            {/* Comment */}

                            <div>

                              <label
                                htmlFor="review-comment"
                                className="mb-2 block text-sm font-medium text-gray-700"
                              >
                                Comment
                                (optional)
                              </label>

                              <textarea
                                id="review-comment"
                                name="comment"
                                value={
                                  reviewForm.comment
                                }
                                onChange={
                                  handleReviewChange
                                }
                                rows={4}
                                maxLength={2000}
                                className="w-full rounded-md border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                placeholder="Share your thoughts about this product..."
                              />

                              <p className="mt-1 text-right text-xs text-gray-400">
                                {
                                  reviewForm
                                    .comment
                                    .length
                                }
                                /2000
                              </p>

                            </div>

                            {/* Submit */}

                            <button
                              type="submit"
                              disabled={
                                submittingReview
                              }
                              className="w-full rounded-md bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {submittingReview
                                ? "Submitting..."
                                : "Submit Review"}
                            </button>

                          </form>
                        </div>
                      )}

                  </>
                )}

              </div>
            </div>
          </div>

          {/* =====================================================
              PRODUCT TABS
          ====================================================== */}

          <div className="mt-12">
            <ProductTabs product={product} />
          </div>

          {/* =====================================================
              RELATED PRODUCTS
          ====================================================== */}

          <div className="mt-16 border-t border-gray-200 pt-8">

            <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
              You Might Also Like
            </h2>

            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">

              {Array.from({
                length: 8,
              }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-lg bg-gray-50 p-4 transition-shadow hover:shadow-lg"
                >

                  <div className="mb-3 h-36 w-full rounded bg-gray-200" />

                  <h3 className="mb-2 line-clamp-2 font-medium text-gray-700">
                    Related Product Title
                  </h3>

                  <p className="text-lg font-bold">
                    $29.99
                  </p>

                  <div className="mt-2">
                    <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                      In Stock
                    </span>
                  </div>

                  <button
                    type="button"
                    className="mt-3 w-full rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    Quick View
                  </button>

                </div>
              ))}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SingleProductPage;