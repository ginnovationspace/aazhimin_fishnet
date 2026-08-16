"use client";

import { DashboardSidebar, SectionTitle } from "@/components";
import { useSession } from "@/lib/auth-client";
import { useCallback, useEffect, useState } from "react";
import apiClient from "@/lib/api";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

type ModerationTab = "products" | "users" | "reports";

interface Pagination {
  currentPage: number;
  total: number;
  hasMore: boolean;
  totalPages?: number;
  limit?: number;
}

interface Merchant {
  id?: string;
  name?: string | null;
  verificationStatus?: string | null;
}

interface ModerationProduct {
  id: string;
  title: string;
  price?: number | string | null;
  description?: string | null;
  merchant?: Merchant | null;
  createdAt?: string | null;
  status?: string | null;
  moderationStatus?: string | null;
}

interface ModerationUser {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: string | null;
  createdAt?: string | null;
  status?: string | null;
  moderationStatus?: string | null;
  merchant?: Merchant | null;
}

interface ModerationReport {
  id: string;
  type?: string | null;
  reporterEmail?: string | null;
  description?: string | null;
  status?: string | null;
  createdAt?: string | null;
  targetType?: string | null;
  targetId?: string | null;
}

interface ApiErrorResponse {
  error?: string;
  message?: string;
}

const getErrorMessage = async (
  response: Response,
  fallback: string
): Promise<string> => {
  try {
    const data = (await response.json()) as ApiErrorResponse;

    return (
      data?.error ||
      data?.message ||
      `${fallback} (${response.status})`
    );
  } catch {
    return `${fallback} (${response.status})`;
  }
};

const AdminModerationPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  /*
   * ------------------------------------------------------------
   * TAB STATE
   * ------------------------------------------------------------
   */

  const [activeTab, setActiveTab] =
    useState<ModerationTab>("products");

  /*
   * ------------------------------------------------------------
   * SEARCH
   * ------------------------------------------------------------
   */

  const [productSearch, setProductSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");

  /*
   * ------------------------------------------------------------
   * PRODUCTS
   * ------------------------------------------------------------
   */

  const [products, setProducts] = useState<
    ModerationProduct[]
  >([]);

  const [productsLoading, setProductsLoading] =
    useState(true);

  const [productsError, setProductsError] =
    useState<string | null>(null);

  const [productsPagination, setProductsPagination] =
    useState<Pagination | null>(null);

  /*
   * ------------------------------------------------------------
   * USERS
   * ------------------------------------------------------------
   */

  const [users, setUsers] = useState<ModerationUser[]>([]);

  const [usersLoading, setUsersLoading] =
    useState(false);

  const [usersError, setUsersError] =
    useState<string | null>(null);

  const [usersPagination, setUsersPagination] =
    useState<Pagination | null>(null);

  /*
   * ------------------------------------------------------------
   * REPORTS
   * ------------------------------------------------------------
   */

  const [reports, setReports] = useState<
    ModerationReport[]
  >([]);

  const [reportsLoading, setReportsLoading] =
    useState(false);

  const [reportsError, setReportsError] =
    useState<string | null>(null);

  const [reportsPagination, setReportsPagination] =
    useState<Pagination | null>(null);

  /*
   * ------------------------------------------------------------
   * MODERATION ACTION STATE
   * ------------------------------------------------------------
   */

  const [moderating, setModerating] =
    useState(false);

  const [moderationError, setModerationError] =
    useState<string | null>(null);

  const [moderationSuccess, setModerationSuccess] =
    useState<string | null>(null);

  /*
   * ------------------------------------------------------------
   * FETCH PRODUCTS
   * ------------------------------------------------------------
   */

  const fetchProductsForModeration = useCallback(
    async (page = 1, search = productSearch) => {
      setProductsLoading(true);
      setProductsError(null);

      try {
        const query = new URLSearchParams({
          page: String(page),
          limit: "10",
          search: search.trim(),
        });

        const response = await apiClient.get(
          `/api/admin/products/moderation?${query.toString()}`
        );

        if (!response.ok) {
          const message = await getErrorMessage(
            response,
            "Failed to load products"
          );

          throw new Error(message);
        }

        const data = await response.json();

        setProducts(
          Array.isArray(data?.products)
            ? data.products
            : []
        );

        setProductsPagination(
          data?.pagination || null
        );
      } catch (error) {
        console.error(
          "Error fetching products for moderation:",
          error
        );

        const message =
          error instanceof Error
            ? error.message
            : "Failed to load products";

        setProductsError(message);

        toast({
          title: "Products error",
          description: message,
        });
      } finally {
        setProductsLoading(false);
      }
    },
    [productSearch, toast]
  );

  /*
   * ------------------------------------------------------------
   * FETCH USERS
   * ------------------------------------------------------------
   */

  const fetchUsersForModeration = useCallback(
    async (page = 1, search = userSearch) => {
      setUsersLoading(true);
      setUsersError(null);

      try {
        const query = new URLSearchParams({
          page: String(page),
          limit: "10",
          search: search.trim(),
        });

        const response = await apiClient.get(
          `/api/admin/users/moderation?${query.toString()}`
        );

        if (!response.ok) {
          const message = await getErrorMessage(
            response,
            "Failed to load users"
          );

          throw new Error(message);
        }

        const data = await response.json();

        setUsers(
          Array.isArray(data?.users)
            ? data.users
            : []
        );

        setUsersPagination(
          data?.pagination || null
        );
      } catch (error) {
        console.error(
          "Error fetching users for moderation:",
          error
        );

        const message =
          error instanceof Error
            ? error.message
            : "Failed to load users";

        setUsersError(message);

        toast({
          title: "Users error",
          description: message,
        });
      } finally {
        setUsersLoading(false);
      }
    },
    [toast, userSearch]
  );

  /*
   * ------------------------------------------------------------
   * FETCH REPORTS
   * ------------------------------------------------------------
   */

  const fetchReports = useCallback(
    async (page = 1) => {
      setReportsLoading(true);
      setReportsError(null);

      try {
        const query = new URLSearchParams({
          page: String(page),
          limit: "10",
        });

        const response = await apiClient.get(
          `/api/admin/reports?${query.toString()}`
        );

        if (!response.ok) {
          const message = await getErrorMessage(
            response,
            "Failed to load reports"
          );

          throw new Error(message);
        }

        const data = await response.json();

        setReports(
          Array.isArray(data?.reports)
            ? data.reports
            : []
        );

        setReportsPagination(
          data?.pagination || null
        );
      } catch (error) {
        console.error(
          "Error fetching reports:",
          error
        );

        const message =
          error instanceof Error
            ? error.message
            : "Failed to load reports";

        setReportsError(message);

        toast({
          title: "Reports error",
          description: message,
        });
      } finally {
        setReportsLoading(false);
      }
    },
    [toast]
  );

  /*
   * ------------------------------------------------------------
   * PRODUCT MODERATION
   * ------------------------------------------------------------
   */

  const handleProductModeration = async (
    productId: string,
    action: string,
    reason = ""
  ) => {
    if (moderating) {
      return;
    }

    setModerating(true);
    setModerationError(null);
    setModerationSuccess(null);

    try {
      const response = await apiClient.put(
        `/api/admin/products/${productId}/moderate`,
        {
          action,
          reason,
        }
      );

      if (!response.ok) {
        const message = await getErrorMessage(
          response,
          "Failed to moderate product"
        );

        throw new Error(message);
      }

      const data = await response.json();

      const message =
        data?.message ||
        "Product moderation completed successfully.";

      setModerationSuccess(message);

      toast({
        title: "Product moderated",
        description: message,
      });

      const currentPage =
        productsPagination?.currentPage || 1;

      await fetchProductsForModeration(
        currentPage,
        productSearch
      );
    } catch (error) {
      console.error(
        "Error moderating product:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Failed to moderate product";

      setModerationError(message);

      toast({
        title: "Moderation failed",
        description: message,
      });
    } finally {
      setModerating(false);
    }
  };

  /*
   * ------------------------------------------------------------
   * USER MODERATION
   * ------------------------------------------------------------
   */

  const handleUserModeration = async (
    userId: string,
    action: string,
    reason = ""
  ) => {
    if (moderating) {
      return;
    }

    setModerating(true);
    setModerationError(null);
    setModerationSuccess(null);

    try {
      const response = await apiClient.put(
        `/api/admin/users/${userId}/moderate`,
        {
          action,
          reason,
        }
      );

      if (!response.ok) {
        const message = await getErrorMessage(
          response,
          "Failed to moderate user"
        );

        throw new Error(message);
      }

      const data = await response.json();

      const message =
        data?.message ||
        "User moderation completed successfully.";

      setModerationSuccess(message);

      toast({
        title: "User moderated",
        description: message,
      });

      const currentPage =
        usersPagination?.currentPage || 1;

      await fetchUsersForModeration(
        currentPage,
        userSearch
      );
    } catch (error) {
      console.error(
        "Error moderating user:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Failed to moderate user";

      setModerationError(message);

      toast({
        title: "Moderation failed",
        description: message,
      });
    } finally {
      setModerating(false);
    }
  };

  /*
   * ------------------------------------------------------------
   * REPORT RESOLUTION
   * ------------------------------------------------------------
   */

  const handleReportResolution = async (
    reportId: string,
    action: string,
    notes = ""
  ) => {
    if (moderating) {
      return;
    }

    setModerating(true);
    setModerationError(null);
    setModerationSuccess(null);

    try {
      const response = await apiClient.put(
        `/api/admin/reports/${reportId}/resolve`,
        {
          action,
          notes,
        }
      );

      if (!response.ok) {
        const message = await getErrorMessage(
          response,
          "Failed to resolve report"
        );

        throw new Error(message);
      }

      const data = await response.json();

      const message =
        data?.message ||
        "Report resolved successfully.";

      setModerationSuccess(message);

      toast({
        title: "Report resolved",
        description: message,
      });

      const currentPage =
        reportsPagination?.currentPage || 1;

      await fetchReports(currentPage);
    } catch (error) {
      console.error(
        "Error resolving report:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Failed to resolve report";

      setModerationError(message);

      toast({
        title: "Report resolution failed",
        description: message,
      });
    } finally {
      setModerating(false);
    }
  };

  /*
   * ------------------------------------------------------------
   * AUTHENTICATION / AUTHORIZATION
   * ------------------------------------------------------------
   */

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    if (
      status === "authenticated" &&
      session?.user?.role !== "ADMIN"
    ) {
      const role = session?.user?.role;

      if (role === "BUYER") {
        router.replace("/");
      } else if (role === "SELLER") {
        router.replace("/(dashboard)/seller");
      } else {
        router.replace("/(dashboard)/buyer/orders");
      }
    }
  }, [router, session?.user?.role, status]);

  /*
   * ------------------------------------------------------------
   * LOAD ACTIVE TAB
   * ------------------------------------------------------------
   */

  useEffect(() => {
    if (
      status !== "authenticated" ||
      session?.user?.role !== "ADMIN"
    ) {
      return;
    }

    if (activeTab === "products") {
      fetchProductsForModeration(
        1,
        productSearch
      );
      return;
    }

    if (activeTab === "users") {
      fetchUsersForModeration(1, userSearch);
      return;
    }

    if (activeTab === "reports") {
      fetchReports(1);
    }
  }, [
    activeTab,
    status,
    session?.user?.role,
    fetchProductsForModeration,
    fetchUsersForModeration,
    fetchReports,
  ]);

  /*
   * ------------------------------------------------------------
   * AUTH LOADING
   * ------------------------------------------------------------
   */

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="mt-4 text-gray-600">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-600">
          Redirecting to login...
        </p>
      </div>
    );
  }

  if (session?.user?.role !== "ADMIN") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-600">
          Redirecting...
        </p>
      </div>
    );
  }

  /*
   * ------------------------------------------------------------
   * RENDER
   * ------------------------------------------------------------
   */

  return (
    <div className="min-h-screen bg-white lg:flex">
      <DashboardSidebar />
      <div className="min-w-0 flex-1">
        <SectionTitle
          title="Content Moderation"
          path="Home | Dashboard | Admin | Moderation"
        />

        <div className="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">
        {/* Header */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Content Moderation
          </h1>

          <p className="mt-4 text-lg text-gray-600">
            Review and moderate content to maintain
            community standards.
          </p>
        </div>

        {/* Global moderation error */}

        {moderationError && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4"
          >
            <p className="text-sm font-medium text-red-700">
              {moderationError}
            </p>
          </div>
        )}

        {/* Global moderation success */}

        {moderationSuccess && (
          <div
            role="status"
            className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4"
          >
            <p className="text-sm font-medium text-green-700">
              {moderationSuccess}
            </p>
          </div>
        )}

        {/* =====================================================
            TABS
        ====================================================== */}

        <div className="mb-8 border-b border-gray-200">
          <div className="flex overflow-x-auto">
            <button
              type="button"
              onClick={() =>
                setActiveTab("products")
              }
              className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition ${
                activeTab === "products"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Products
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveTab("users")
              }
              className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition ${
                activeTab === "users"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Users
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveTab("reports")
              }
              className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition ${
                activeTab === "reports"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Reports
            </button>
          </div>
        </div>

        {/* =====================================================
            PRODUCTS
        ====================================================== */}

        {activeTab === "products" && (
          <div className="space-y-6">
            {/* Search */}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full max-w-md">
                <input
                  type="search"
                  value={productSearch}
                  onChange={(event) =>
                    setProductSearch(
                      event.target.value
                    )
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      fetchProductsForModeration(
                        1,
                        productSearch
                      );
                    }
                  }}
                  placeholder="Search products..."
                  className="w-full rounded-md border border-gray-300 px-4 py-2 pl-10 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />

                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m21 21-4.35-4.35M13.5 6.5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>

              <button
                type="button"
                onClick={() =>
                  fetchProductsForModeration(
                    1,
                    productSearch
                  )
                }
                disabled={productsLoading}
                className="rounded-md bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {productsLoading
                  ? "Searching..."
                  : "Search"}
              </button>
            </div>

            {/* Error */}

            {productsError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-700">
                  {productsError}
                </p>
              </div>
            )}

            {/* Loading */}

            {productsLoading &&
              products.length === 0 && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 py-12 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

                  <p className="mt-4 text-gray-600">
                    Loading products...
                  </p>
                </div>
              )}

            {/* Product results */}

            {!productsLoading &&
              products.length === 0 && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 py-12 text-center">
                  <p className="text-gray-500">
                    No products found matching your
                    criteria.
                  </p>
                </div>
              )}

            {products.length > 0 && (
              <>
                <div className="space-y-4">
                  {products.map((product) => {
                    const description =
                      product.description?.trim() ||
                      "No description provided.";

                    const merchantName =
                      product.merchant?.name ||
                      "Unknown seller";

                    const price = Number(
                      product.price || 0
                    );

                    return (
                      <div
                        key={product.id}
                        className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-gray-900">
                                {product.title}
                              </h3>

                              <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                                Pending Review
                              </span>
                            </div>

                            <p className="mt-1 text-sm text-gray-500">
                              Seller:{" "}
                              {merchantName}
                            </p>

                            <p className="mt-1 text-sm font-semibold text-gray-900">
                              $
                              {price.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="text-sm leading-6 text-gray-600">
                            {description.length >
                            180
                              ? `${description.substring(
                                  0,
                                  180
                                )}...`
                              : description}
                          </p>
                        </div>

                        {product.createdAt && (
                          <p className="mt-3 text-xs text-gray-400">
                            Created{" "}
                            {new Date(
                              product.createdAt
                            ).toLocaleDateString()}
                          </p>
                        )}

                        <div className="mt-5 flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            disabled={moderating}
                            onClick={() =>
                              handleProductModeration(
                                product.id,
                                "APPROVE",
                                "Product approved after moderation."
                              )
                            }
                            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Approve
                          </button>

                          <button
                            type="button"
                            disabled={moderating}
                            onClick={() =>
                              handleProductModeration(
                                product.id,
                                "REJECT",
                                "Product rejected because it does not meet community guidelines."
                              )
                            }
                            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Reject
                          </button>

                          <button
                            type="button"
                            disabled={moderating}
                            onClick={() =>
                              handleProductModeration(
                                product.id,
                                "FLAG",
                                "Product requires further manual review."
                              )
                            }
                            className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Flag
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Product pagination */}

                <div className="flex flex-col gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-gray-500">
                    Showing {products.length} of{" "}
                    {productsPagination?.total ||
                      products.length}{" "}
                    products
                  </p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={
                        !productsPagination ||
                        productsPagination.currentPage <=
                          1 ||
                        productsLoading
                      }
                      onClick={() =>
                        fetchProductsForModeration(
                          (productsPagination
                            ?.currentPage || 1) - 1,
                          productSearch
                        )
                      }
                      className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>

                    <button
                      type="button"
                      disabled={
                        !productsPagination?.hasMore ||
                        productsLoading
                      }
                      onClick={() =>
                        fetchProductsForModeration(
                          (productsPagination
                            ?.currentPage || 1) + 1,
                          productSearch
                        )
                      }
                      className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* =====================================================
            USERS
        ====================================================== */}

        {activeTab === "users" && (
          <div className="space-y-6">
            {/* Search */}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full max-w-md">
                <input
                  type="search"
                  value={userSearch}
                  onChange={(event) =>
                    setUserSearch(
                      event.target.value
                    )
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      fetchUsersForModeration(
                        1,
                        userSearch
                      );
                    }
                  }}
                  placeholder="Search users..."
                  className="w-full rounded-md border border-gray-300 px-4 py-2 pl-10 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />

                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m21 21-4.35-4.35M13.5 6.5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>

              <button
                type="button"
                onClick={() =>
                  fetchUsersForModeration(
                    1,
                    userSearch
                  )
                }
                disabled={usersLoading}
                className="rounded-md bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {usersLoading
                  ? "Searching..."
                  : "Search"}
              </button>
            </div>

            {/* Error */}

            {usersError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-700">
                  {usersError}
                </p>
              </div>
            )}

            {/* Loading */}

            {usersLoading && users.length === 0 && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 py-12 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

                <p className="mt-4 text-gray-600">
                  Loading users...
                </p>
              </div>
            )}

            {/* Empty */}

            {!usersLoading && users.length === 0 && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 py-12 text-center">
                <p className="text-gray-500">
                  No users found matching your
                  criteria.
                </p>
              </div>
            )}

            {/* Users */}

            {users.length > 0 && (
              <>
                <div className="space-y-4">
                  {users.map((user) => {
                    const userName =
                      user.name ||
                      user.email ||
                      "Unknown user";

                    const merchant =
                      user.merchant;

                    return (
                      <div
                        key={user.id}
                        className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-gray-900">
                                {userName}
                              </h3>

                              <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                                Pending Review
                              </span>
                            </div>

                            {user.email && (
                              <p className="mt-1 text-sm text-gray-500">
                                {user.email}
                              </p>
                            )}

                            <p className="mt-1 text-sm text-gray-500">
                              Role:{" "}
                              {user.role ||
                                "UNKNOWN"}
                            </p>
                          </div>
                        </div>

                        {merchant && (
                          <div className="mt-4 rounded-md bg-gray-50 p-3">
                            <p className="text-sm font-medium text-gray-700">
                              Merchant
                            </p>

                            <p className="mt-1 text-sm text-gray-600">
                              {merchant.name ||
                                "Unnamed merchant"}
                            </p>

                            {merchant.verificationStatus && (
                              <p className="mt-1 text-xs text-gray-500">
                                Verification:{" "}
                                {
                                  merchant.verificationStatus
                                }
                              </p>
                            )}
                          </div>
                        )}

                        {user.createdAt && (
                          <p className="mt-4 text-xs text-gray-400">
                            Joined{" "}
                            {new Date(
                              user.createdAt
                            ).toLocaleDateString()}
                          </p>
                        )}

                        <div className="mt-5 flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            disabled={moderating}
                            onClick={() =>
                              handleUserModeration(
                                user.id,
                                "WARN",
                                "Please review the community guidelines."
                              )
                            }
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Warn
                          </button>

                          <button
                            type="button"
                            disabled={moderating}
                            onClick={() =>
                              handleUserModeration(
                                user.id,
                                "SUSPEND",
                                "Account suspended due to repeated violations of community guidelines."
                              )
                            }
                            className="rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Suspend
                          </button>

                          <button
                            type="button"
                            disabled={moderating}
                            onClick={() =>
                              handleUserModeration(
                                user.id,
                                "BAN",
                                "Account banned due to severe violations of community guidelines."
                              )
                            }
                            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Ban
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* User pagination */}

                <div className="flex flex-col gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-gray-500">
                    Showing {users.length} of{" "}
                    {usersPagination?.total ||
                      users.length}{" "}
                    users
                  </p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={
                        !usersPagination ||
                        usersPagination.currentPage <=
                          1 ||
                        usersLoading
                      }
                      onClick={() =>
                        fetchUsersForModeration(
                          (usersPagination
                            ?.currentPage || 1) - 1,
                          userSearch
                        )
                      }
                      className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>

                    <button
                      type="button"
                      disabled={
                        !usersPagination?.hasMore ||
                        usersLoading
                      }
                      onClick={() =>
                        fetchUsersForModeration(
                          (usersPagination
                            ?.currentPage || 1) + 1,
                          userSearch
                        )
                      }
                      className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* =====================================================
            REPORTS
        ====================================================== */}

        {activeTab === "reports" && (
          <div className="space-y-6">
            {/* Error */}

            {reportsError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-700">
                  {reportsError}
                </p>
              </div>
            )}

            {/* Loading */}

            {reportsLoading &&
              reports.length === 0 && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 py-12 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

                  <p className="mt-4 text-gray-600">
                    Loading reports...
                  </p>
                </div>
              )}

            {/* Empty */}

            {!reportsLoading &&
              reports.length === 0 && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 py-12 text-center">
                  <p className="text-gray-500">
                    No reports found.
                  </p>
                </div>
              )}

            {/* Reports */}

            {reports.length > 0 && (
              <>
                <div className="space-y-4">
                  {reports.map((report) => {
                    const isPending =
                      report.status ===
                      "PENDING";

                    return (
                      <div
                        key={report.id}
                        className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-gray-900">
                                Report #
                                {report.id
                                  ? report.id.substring(
                                      0,
                                      8
                                    )
                                  : "unknown"}
                              </h3>

                              <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${
                                  isPending
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {report.status ||
                                  "UNKNOWN"}
                              </span>
                            </div>

                            <p className="mt-2 text-sm text-gray-500">
                              Type:{" "}
                              {report.type ||
                                "Unknown"}
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                              Reporter:{" "}
                              {report.reporterEmail ||
                                "Unknown"}
                            </p>

                            {report.targetType && (
                              <p className="mt-1 text-xs text-gray-400">
                                Target:{" "}
                                {
                                  report.targetType
                                }
                                {report.targetId
                                  ? ` #${report.targetId}`
                                  : ""}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 rounded-md bg-gray-50 p-4">
                          <p className="text-sm leading-6 text-gray-700">
                            {report.description ||
                              "No description provided."}
                          </p>
                        </div>

                        {report.createdAt && (
                          <p className="mt-3 text-xs text-gray-400">
                            Reported{" "}
                            {new Date(
                              report.createdAt
                            ).toLocaleDateString()}
                          </p>
                        )}

                        {isPending && (
                          <div className="mt-5 flex flex-wrap justify-end gap-2">
                            <button
                              type="button"
                              disabled={
                                moderating
                              }
                              onClick={() =>
                                handleReportResolution(
                                  report.id,
                                  "DISMISS",
                                  "No action required."
                                )
                              }
                              className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Dismiss
                            </button>

                            <button
                              type="button"
                              disabled={
                                moderating
                              }
                              onClick={() =>
                                handleReportResolution(
                                  report.id,
                                  "WARN_USER",
                                  "User needs to review community guidelines."
                                )
                              }
                              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Warn User
                            </button>

                            <button
                              type="button"
                              disabled={
                                moderating
                              }
                              onClick={() =>
                                handleReportResolution(
                                  report.id,
                                  "REMOVE_CONTENT",
                                  "Content violates community guidelines."
                                )
                              }
                              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Remove Content
                            </button>

                            <button
                              type="button"
                              disabled={
                                moderating
                              }
                              onClick={() =>
                                handleReportResolution(
                                  report.id,
                                  "SUSPEND_USER",
                                  "User violated community guidelines."
                                )
                              }
                              className="rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Suspend User
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Report pagination */}

                <div className="flex flex-col gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-gray-500">
                    Showing {reports.length} of{" "}
                    {reportsPagination?.total ||
                      reports.length}{" "}
                    reports
                  </p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={
                        !reportsPagination ||
                        reportsPagination.currentPage <=
                          1 ||
                        reportsLoading
                      }
                      onClick={() =>
                        fetchReports(
                          (reportsPagination
                            ?.currentPage || 1) - 1
                        )
                      }
                      className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>

                    <button
                      type="button"
                      disabled={
                        !reportsPagination?.hasMore ||
                        reportsLoading
                      }
                      onClick={() =>
                        fetchReports(
                          (reportsPagination
                            ?.currentPage || 1) + 1
                        )
                      }
                      className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default AdminModerationPage;
