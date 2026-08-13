"use client";

import { DashboardSidebar } from "@/components";
import apiClient from "@/lib/api";
import { convertCategoryNameToURLFriendly as convertSlugToURLFriendly } from "@/utils/categoryFormating";
import { sanitize } from "@/lib/sanitize";
import { sanitizeFormData } from "@/lib/form-sanitize";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
}

interface Merchant {
  id: string;
  name: string;
}

interface ProductFormData {
  merchantId: string;
  title: string;
  price: number;
  manufacturer: string;
  inStock: number;
  mainImage: string;
  description: string;
  slug: string;
  categoryId: string;
}

const emptyProduct = (): ProductFormData => ({
  merchantId: "",
  title: "",
  price: 0,
  manufacturer: "",
  inStock: 1,
  mainImage: "",
  description: "",
  slug: "",
  categoryId: "",
});

const AddNewProduct = () => {
  const [product, setProduct] = useState<ProductFormData>(emptyProduct());
  const [categories, setCategories] = useState<Category[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingMerchants, setLoadingMerchants] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  /**
   * Create a new product
   */
  const addProduct = async () => {
    if (
      !product.merchantId ||
      !product.title.trim() ||
      !product.manufacturer.trim() ||
      !product.description.trim() ||
      !product.slug.trim() ||
      !product.categoryId
    ) {
      toast.error("Please enter values in all required fields");
      return;
    }

    if (product.price <= 0) {
      toast.error("Product price must be greater than 0");
      return;
    }

    try {
      const sanitizedProduct = sanitizeFormData(product);

      console.log("Sending product data:", sanitizedProduct);

      const response = await apiClient.post(
        "/api/products",
        sanitizedProduct
      );

      if (response.status === 201) {
        const data = await response.json();

        console.log("Product created successfully:", data);

        toast.success("Product added successfully");

        setProduct({
          ...emptyProduct(),
          merchantId: merchants[0]?.id || "",
          categoryId: categories[0]?.id || "",
        });
      } else {
        let errorData: {
          message?: string;
          error?: string;
        } = {};

        try {
          errorData = await response.json();
        } catch {
          // Response may not contain JSON.
        }

        console.error("Failed to create product:", errorData);

        toast.error(
          errorData.error ||
            errorData.message ||
            "Failed to add product"
        );
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Network error. Please try again.");
    }
  };

  /**
   * Fetch merchants
   */
  const fetchMerchants = async () => {
    setLoadingMerchants(true);

    try {
      const response = await apiClient.get("/api/merchants");

      if (!response.ok) {
        throw new Error(
          `Failed to fetch merchants: ${response.status}`
        );
      }

      const data = (await response.json()) as Merchant[];

      const merchantList = Array.isArray(data) ? data : [];

      setMerchants(merchantList);

      setProduct((previous) => ({
        ...previous,
        merchantId:
          previous.merchantId || merchantList[0]?.id || "",
      }));
    } catch (error) {
      console.error("Failed to load merchants:", error);
      toast.error("Failed to load merchants");
      setMerchants([]);
    } finally {
      setLoadingMerchants(false);
    }
  };

  /**
   * Upload product main image
   */
  const uploadFile = async (file: File) => {
    if (!file) {
      return;
    }

    setUploadingImage(true);

    const formData = new FormData();
    formData.append("uploadedFile", file);

    try {
      const response = await apiClient.post("/api/main-image", formData);

      if (!response.ok) {
        throw new Error(
          `Image upload failed: ${response.status}`
        );
      }

      const uploadResult = await response.json();

      /*
       * The existing backend appears to use the uploaded filename
       * as the product mainImage value.
       */
      setProduct((previous) => ({
        ...previous,
        mainImage: uploadResult.filename || file.name,
      }));

      toast.success("Product image uploaded successfully");
    } catch (error) {
      console.error("Error uploading product image:", error);
      toast.error("Failed to upload product image");
    } finally {
      setUploadingImage(false);
    }
  };

  /**
   * Fetch product categories
   */
  const fetchCategories = async () => {
    setLoadingCategories(true);

    try {
      const response = await apiClient.get("/api/categories");

      if (!response.ok) {
        throw new Error(
          `Failed to fetch categories: ${response.status}`
        );
      }

      const data = (await response.json()) as Category[];

      const categoryList = Array.isArray(data) ? data : [];

      setCategories(categoryList);

      setProduct((previous) => ({
        ...previous,
        categoryId:
          previous.categoryId || categoryList[0]?.id || "",
      }));
    } catch (error) {
      console.error("Failed to load categories:", error);
      toast.error("Failed to load categories");
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  /**
   * Load initial data
   */
  useEffect(() => {
    void fetchCategories();
    void fetchMerchants();
  }, []);

  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto xl:h-full max-xl:flex-col max-xl:gap-y-5">
      <DashboardSidebar />

      <div className="flex flex-col gap-y-7 xl:ml-5 max-xl:px-5 w-full">
        <h1 className="text-3xl font-semibold">
          Add new product
        </h1>

        {/* Merchant */}
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">
                Merchant Info:
              </span>
            </div>

            <select
              className="select select-bordered"
              value={product.merchantId}
              disabled={loadingMerchants}
              onChange={(event) =>
                setProduct((previous) => ({
                  ...previous,
                  merchantId: event.target.value,
                }))
              }
            >
              <option value="">
                {loadingMerchants
                  ? "Loading merchants..."
                  : "Select merchant"}
              </option>

              {merchants.map((merchant) => (
                <option
                  key={merchant.id}
                  value={merchant.id}
                >
                  {merchant.name}
                </option>
              ))}
            </select>

            {!loadingMerchants && merchants.length === 0 && (
              <span className="text-xs text-red-500 mt-1">
                Please create a merchant first.
              </span>
            )}
          </label>
        </div>

        {/* Product name */}
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
              value={product.title}
              onChange={(event) =>
                setProduct((previous) => ({
                  ...previous,
                  title: event.target.value,
                }))
              }
            />
          </label>
        </div>

        {/* Product slug */}
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">
                Product slug:
              </span>
            </div>

            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={convertSlugToURLFriendly(product.slug)}
              onChange={(event) =>
                setProduct((previous) => ({
                  ...previous,
                  slug: convertSlugToURLFriendly(
                    event.target.value
                  ),
                }))
              }
            />
          </label>
        </div>

        {/* Category */}
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">
                Category:
              </span>
            </div>

            <select
              className="select select-bordered"
              value={product.categoryId}
              disabled={loadingCategories}
              onChange={(event) =>
                setProduct((previous) => ({
                  ...previous,
                  categoryId: event.target.value,
                }))
              }
            >
              <option value="">
                {loadingCategories
                  ? "Loading categories..."
                  : "Select category"}
              </option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>

            {!loadingCategories && categories.length === 0 && (
              <span className="text-xs text-red-500 mt-1">
                Please create a category first.
              </span>
            )}
          </label>
        </div>

        {/* Product price */}
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
              value={product.price}
              onChange={(event) =>
                setProduct((previous) => ({
                  ...previous,
                  price: Number(event.target.value),
                }))
              }
            />
          </label>
        </div>

        {/* Manufacturer */}
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
              value={product.manufacturer}
              onChange={(event) =>
                setProduct((previous) => ({
                  ...previous,
                  manufacturer: event.target.value,
                }))
              }
            />
          </label>
        </div>

        {/* Stock */}
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">
                Is product in stock?
              </span>
            </div>

            <select
              className="select select-bordered"
              value={product.inStock}
              onChange={(event) =>
                setProduct((previous) => ({
                  ...previous,
                  inStock: Number(event.target.value),
                }))
              }
            >
              <option value={1}>Yes</option>
              <option value={0}>No</option>
            </select>
          </label>
        </div>

        {/* Main image */}
        <div>
          <input
            type="file"
            accept="image/*"
            className="file-input file-input-bordered file-input-lg w-full max-w-sm"
            disabled={uploadingImage}
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (file) {
                void uploadFile(file);
              }
            }}
          />

          {uploadingImage && (
            <p className="text-sm text-gray-500 mt-2">
              Uploading image...
            </p>
          )}

          {product.mainImage && (
            <Image
              src={`/${product.mainImage}`}
              alt={sanitize(product.title || "Product image")}
              className="w-auto h-auto mt-2"
              width={100}
              height={100}
            />
          )}
        </div>

        {/* Description */}
        <div>
          <label className="form-control">
            <div className="label">
              <span className="label-text">
                Product description:
              </span>
            </div>

            <textarea
              className="textarea textarea-bordered h-24"
              value={product.description}
              onChange={(event) =>
                setProduct((previous) => ({
                  ...previous,
                  description: event.target.value,
                }))
              }
            />
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-x-2">
          <button
            onClick={() => void addProduct()}
            type="button"
            disabled={
              loadingCategories ||
              loadingMerchants ||
              uploadingImage ||
              merchants.length === 0 ||
              categories.length === 0
            }
            className="uppercase bg-blue-500 px-10 py-5 text-lg border border-gray-300 font-bold text-white shadow-sm hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add product
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNewProduct;
