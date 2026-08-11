// ============================================================
// ADMIN PRODUCT DETAILS
// apps/web/app/(dashboard)/admin/products/[id]/page.tsx
// ============================================================

"use client";

import {
  DashboardSidebar,
} from "@/components";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, use } from "react";
import toast from "react-hot-toast";
import {
  convertCategoryNameToURLFriendly as convertSlugToURLFriendly,
  formatCategoryName,
} from "../../../../../utils/categoryFormating";
import apiClient from "@/lib/api";

interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  manufacturer: string;
  description: string;
  inStock: number;
  categoryId: string;
  mainImage: string;
  rating?: number;
}

interface Category {
  id: string;
  name: string;
}

interface OtherImages {
  id: string;
  image: string;
  productId?: string;
}

interface DashboardProductDetailsProps {
  params: Promise<{ id: string }>;
}

const DashboardProductDetails = ({
  params,
}: DashboardProductDetailsProps) => {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [product, setProduct] =
    useState<Product | null>(null);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [otherImages, setOtherImages] =
    useState<OtherImages[]>([]);

  const router = useRouter();

  const deleteProduct = async () => {
    try {
      const response = await apiClient.delete(
        `/api/products/${id}`
      );

      if (response.status === 400) {
        toast.error(
          "Cannot delete the product because of foreign key constraint"
        );
        return;
      }

      if (!response.ok && response.status !== 204) {
        throw new Error(
          "There was an error while deleting product"
        );
      }

      toast.success(
        "Product deleted successfully"
      );

      router.push("/admin/products");
    } catch (error) {
      console.error(
        "Error deleting product:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "There was an error while deleting product"
      );
    }
  };

  const updateProduct = async () => {
    if (!product) {
      toast.error("Product data is not loaded");
      return;
    }

    if (
      !product.title.trim() ||
      !product.slug.trim() ||
      product.price === undefined ||
      product.price === null ||
      !product.manufacturer.trim() ||
      !product.description.trim()
    ) {
      toast.error(
        "You need to enter values in input fields"
      );
      return;
    }

    try {
      const response = await apiClient.put(
        `/api/products/${id}`,
        product
      );

      if (!response.ok) {
        let message =
          "There was an error while updating product";

        try {
          const errorData =
            await response.json();

          if (errorData?.error) {
            message = errorData.error;
          }
        } catch {
          // Response may not contain JSON.
        }

        throw new Error(message);
      }

      toast.success(
        "Product successfully updated"
      );
    } catch (error) {
      console.error(
        "Error updating product:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "There was an error while updating product"
      );
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();

    formData.append("uploadedFile", file);

    try {
      const response = await apiClient.post(
        "/api/main-image",
        {
          body: formData,
        }
      );

      if (!response.ok) {
        toast.error(
          "File upload unsuccessful."
        );
        return;
      }

      await response.json();

      toast.success(
        "Product image uploaded successfully"
      );
    } catch (error) {
      console.error(
        "There was an error during request sending:",
        error
      );

      toast.error(
        "There was an error during request sending"
      );
    }
  };

  const fetchProductData = async () => {
    try {
      const response = await apiClient.get(
        `/api/products/${id}`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch product"
        );
      }

      const data: Product =
        await response.json();

      setProduct(data);

      const imagesResponse =
        await apiClient.get(
          `/api/images/${id}`,
          {
            cache: "no-store",
          }
        );

      if (!imagesResponse.ok) {
        throw new Error(
          "Failed to fetch product images"
        );
      }

      const images: OtherImages[] =
        await imagesResponse.json();

      setOtherImages(images);
    } catch (error) {
      console.error(
        "Error fetching product data:",
        error
      );

      toast.error(
        "There was an error while loading product"
      );
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get(
        "/api/categories"
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch categories"
        );
      }

      const data: Category[] =
        await response.json();

      setCategories(data);
    } catch (error) {
      console.error(
        "Error fetching categories:",
        error
      );

      toast.error(
        "There was an error while loading categories"
      );
    }
  };

  useEffect(() => {
    if (!id) {
      return;
    }

    void fetchCategories();
    void fetchProductData();
  }, [id]);

  return (
    <div className="mx-auto flex max-w-screen-2xl justify-start bg-white xl:h-full max-xl:flex-col max-xl:gap-y-5">
      <DashboardSidebar />

      <div className="flex w-full flex-col gap-y-7 xl:ml-5 max-xl:px-5">
        <h1 className="text-3xl font-semibold">
          Product details
        </h1>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">
                Product name:
              </span>
            </div>

            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={product?.title || ""}
              onChange={(e) => {
                if (!product) return;

                setProduct({
                  ...product,
                  title: e.target.value,
                });
              }}
            />
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">
                Product price:
              </span>
            </div>

            <input
              type="number"
              min="0"
              step="0.01"
              className="input input-bordered w-full max-w-xs"
              value={product?.price ?? ""}
              onChange={(e) => {
                if (!product) return;

                setProduct({
                  ...product,
                  price: Number(
                    e.target.value
                  ),
                });
              }}
            />
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">
                Manufacturer:
              </span>
            </div>

            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={
                product?.manufacturer || ""
              }
              onChange={(e) => {
                if (!product) return;

                setProduct({
                  ...product,
                  manufacturer:
                    e.target.value,
                });
              }}
            />
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">
                Slug:
              </span>
            </div>

            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={
                product?.slug
                  ? convertSlugToURLFriendly(
                      product.slug
                    )
                  : ""
              }
              onChange={(e) => {
                if (!product) return;

                setProduct({
                  ...product,
                  slug: convertSlugToURLFriendly(
                    e.target.value
                  ),
                });
              }}
            />
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">
                Is product in stock?
              </span>
            </div>

            <select
              className="select select-bordered"
              value={product?.inStock ?? 1}
              onChange={(e) => {
                if (!product) return;

                setProduct({
                  ...product,
                  inStock: Number(
                    e.target.value
                  ),
                });
              }}
            >
              <option value={1}>Yes</option>
              <option value={0}>No</option>
            </select>
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">
                Category:
              </span>
            </div>

            <select
              className="select select-bordered"
              value={product?.categoryId || ""}
              onChange={(e) => {
                if (!product) return;

                setProduct({
                  ...product,
                  categoryId:
                    e.target.value,
                });
              }}
            >
              <option value="">
                Select category
              </option>

              {categories.map(
                (category: Category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {formatCategoryName(
                      category.name
                    )}
                  </option>
                )
              )}
            </select>
          </label>
        </div>

        <div>
          <input
            type="file"
            accept="image/*"
            className="file-input file-input-bordered file-input-lg w-full max-w-sm"
            onChange={(e) => {
              const selectedFile =
                e.target.files?.[0];

              if (!selectedFile) {
                return;
              }

              void uploadFile(selectedFile);

              if (product) {
                setProduct({
                  ...product,
                  mainImage:
                    selectedFile.name,
                });
              }
            }}
          />

          {product?.mainImage && (
            <Image
              src={`/${product.mainImage}`}
              alt={product.title || "Product"}
              className="mt-2 h-auto w-auto"
              width={100}
              height={100}
            />
          )}
        </div>

        <div className="flex gap-x-1">
          {otherImages.map(
            (image: OtherImages) => (
              <Image
                src={`/${image.image}`}
                key={image.id}
                alt="Product image"
                width={100}
                height={100}
                className="h-auto w-auto"
              />
            )
          )}
        </div>

        <div>
          <label className="form-control">
            <div className="label">
              <span className="label-text">
                Product description:
              </span>
            </div>

            <textarea
              className="textarea textarea-bordered h-24"
              value={
                product?.description || ""
              }
              onChange={(e) => {
                if (!product) return;

                setProduct({
                  ...product,
                  description:
                    e.target.value,
                });
              }}
            />
          </label>
        </div>

        <div className="flex gap-x-2 max-sm:flex-col">
          <button
            type="button"
            onClick={() => void updateProduct()}
            className="border border-gray-300 bg-blue-500 px-10 py-5 text-lg font-bold uppercase text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2"
          >
            Update product
          </button>

          <button
            type="button"
            className="border border-gray-300 bg-red-600 px-10 py-5 text-lg font-bold uppercase text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2"
            onClick={() => void deleteProduct()}
          >
            Delete product
          </button>
        </div>

        <p className="text-xl text-error max-sm:text-lg">
          To delete the product you first need
          to delete all its records in orders
          (customer_order_product table).
        </p>
      </div>
    </div>
  );
};

export default DashboardProductDetails;