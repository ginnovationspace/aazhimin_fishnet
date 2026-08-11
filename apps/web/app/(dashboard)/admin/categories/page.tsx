"use client";

import { DashboardSidebar } from "@/components";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { formatCategoryName } from "../../../../utils/categoryFormating";
import apiClient from "@/lib/api";

interface Category {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

const DashboardCategory = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get("/api/categories");

        if (!response.ok) {
          throw new Error(
            `Failed to load categories (${response.status})`
          );
        }

        const data = await response.json();

        /*
         * Support both:
         *
         * [
         *   { id, name }
         * ]
         *
         * and:
         *
         * {
         *   categories: [...]
         * }
         */
        const categoryData = Array.isArray(data)
          ? data
          : Array.isArray(data?.categories)
            ? data.categories
            : [];

        if (mounted) {
          setCategories(categoryData);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load categories"
          );
          setCategories([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <DashboardSidebar />
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  All Categories
                </h1>

                <p className="mt-2 text-sm text-gray-600">
                  Manage and view all product categories.
                </p>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-700">
                {error}
              </p>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="animate-pulse">
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                  <div className="h-4 w-24 rounded bg-gray-200" />
                </div>

                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b border-gray-100 px-6 py-5"
                  >
                    <div className="h-4 w-40 rounded bg-gray-200" />
                    <div className="h-8 w-16 rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              {categories.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px] text-left text-sm text-gray-600">
                    {/* Head */}
                    <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                      <tr>
                        <th
                          scope="col"
                          className="w-16 px-6 py-4"
                        >
                          #
                        </th>

                        <th
                          scope="col"
                          className="px-6 py-4"
                        >
                          Name
                        </th>

                        <th
                          scope="col"
                          className="px-6 py-4 text-right"
                        >
                          Action
                        </th>
                      </tr>
                    </thead>

                    {/* Body */}
                    <tbody className="divide-y divide-gray-100">
                      {categories.map((category, index) => (
                        <tr
                          key={category.id}
                          className="transition hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 font-medium text-gray-500">
                            {index + 1}
                          </td>

                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">
                                {formatCategoryName(category.name)}
                              </p>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <Link
                              href={`/admin/categories/${category.id}`}
                              className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-200"
                            >
                              Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>

                    {/* Foot */}
                    <tfoot className="border-t border-gray-200 bg-gray-50">
                      <tr>
                        <th
                          scope="row"
                          className="px-6 py-4"
                        >
                          #
                        </th>

                        <th className="px-6 py-4">
                          Name
                        </th>

                        <th className="px-6 py-4 text-right">
                          Action
                        </th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="px-6 py-16 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <svg
                      className="h-6 w-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 10h16M4 14h16M4 18h16"
                      />
                    </svg>
                  </div>

                  <h2 className="text-lg font-semibold text-gray-900">
                    No categories found
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    There are currently no categories available.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Summary */}
          {!loading && !error && (
            <div className="mt-4 text-sm text-gray-500">
              {categories.length}{" "}
              {categories.length === 1
                ? "category"
                : "categories"}{" "}
              available
            </div>
          )}
        </div>
    </div>
  );
};

export default DashboardCategory;

