"use client";

// *********************
// Role of the component: Product table component on admin dashboard page
// Name of the component: DashboardProductTable.tsx
// *********************

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import { sanitize } from "@/lib/sanitize";

interface Product {
  id: string;
  title: string;
  manufacturer?: string | null;
  mainImage?: string | null;
  inStock: boolean;
  price: number;
}

const DashboardProductTable = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get(
          "/api/products?mode=admin",
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch products: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();

        // Support both:
        // [products]
        // { products: [...] }
        const productList = Array.isArray(data)
          ? data
          : Array.isArray(data?.products)
            ? data.products
            : [];

        setProducts(productList);
      } catch (err) {
        console.error("Failed to fetch admin products:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load products"
        );

        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="w-full">
      <h2 className="mb-5 text-xl font-semibold text-gray-900">
        All Products
      </h2>

      <div className="xl:ml-5 max-xl:mt-5 w-full h-[80vh] overflow-auto">
        {loading ? (
          <div className="flex min-h-40 items-center justify-center">
            <span className="loading loading-spinner loading-md" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
            No products found.
          </div>
        ) : (
          <table className="table table-md table-pin-cols">
            <thead>
              <tr>
                <th>
                  <label>
                    <input
                      type="checkbox"
                      className="checkbox"
                      aria-label="Select all products"
                    />
                  </label>
                </th>

                <th>Product</th>
                <th>Stock Availability</th>
                <th>Price</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <th>
                    <label>
                      <input
                        type="checkbox"
                        className="checkbox"
                        aria-label={`Select ${sanitize(product.title)}`}
                      />
                    </label>
                  </th>

                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="mask mask-squircle h-12 w-12">
                          <Image
                            width={48}
                            height={48}
                            src={
                              product.mainImage
                                ? `/${product.mainImage}`
                                : "/product_placeholder.jpg"
                            }
                            alt={
                              sanitize(product.title) ||
                              "Product image"
                            }
                            className="h-12 w-12 object-cover"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="font-bold">
                          {sanitize(product.title)}
                        </div>

                        {product.manufacturer && (
                          <div className="text-sm opacity-50">
                            {sanitize(product.manufacturer)}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td>
                    {product.inStock ? (
                      <span className="badge badge-success badge-sm text-white">
                        In stock
                      </span>
                    ) : (
                      <span className="badge badge-error badge-sm text-white">
                        Out of stock
                      </span>
                    )}
                  </td>

                  <td>
                    ₹{Number(product.price).toFixed(2)}
                  </td>

                  <th>
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="btn btn-ghost btn-xs"
                    >
                      Details
                    </Link>
                  </th>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr>
                <th />
                <th>Product</th>
                <th>Stock Availability</th>
                <th>Price</th>
                <th />
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
};

export default DashboardProductTable;
