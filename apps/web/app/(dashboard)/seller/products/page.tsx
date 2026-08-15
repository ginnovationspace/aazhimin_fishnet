'use client';
import { SectionTitle } from "@/components";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  title: string;
  price: number | string;
  inStock: number;
  mainImage?: string | null;
  description?: string | null;
  category?: {
    id?: string;
    name?: string;
  } | null;
  // Fishnet-specific fields
  netType?: string;
  meshSize?: string;
  material?: string;
  netLength?: number | string;
  netHeight?: number | string;
}

interface UserData {
  id: string;
  email?: string | null;
  merchant?: {
    id: string;
    name?: string;
  } | null;
}

const SellerProductsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /**
   * Show a toast using the toast API used by this project.
   *
   * Your useToast() does NOT expose:
   *   toast.success()
   *   toast.error()
   *
   * It exposes:
   *   toast({ title, description })
   */
  const showToast = (
    title: string,
    description: string
  ) => {
    toast({
      title,
      description,
    });
  };

  /**
   * Get the merchant ID belonging to the logged-in seller.
   */
  const getMerchantId = async (
    email: string
  ): Promise<string | null> => {
    try {
      const res = await apiClient.get(
        `/api/users/email/${encodeURIComponent(email)}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch seller information");
      }

      const userData: UserData = await res.json();

      return userData.merchant?.id ?? null;
    } catch (err) {
      console.error("Error fetching merchant ID:", err);
      return null;
    }
  };

  /**
   * Fetch all products belonging to the logged-in seller.
   */
  const fetchSellerProducts = async () => {
    if (!session?.user) {
      setError("User not found");
      setLoading(false);
      return;
    }

    const email = session.user.email;

    if (!email) {
      setError("Your account does not have an email address.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      /*
       * Verify that this seller has a merchant account.
       */
      const merchantId = await getMerchantId(email);

      if (!merchantId) {
        throw new Error(
          "Merchant account not found for this seller."
        );
      }

      /*
       * The backend should use the authenticated session/token
       * to determine which seller owns these products.
       */
      const res = await apiClient.get("/api/seller/products");

      if (!res.ok) {
        throw new Error(
          `Failed to fetch products: ${res.status}`
        );
      }

      const data = await res.json();

      /*
       * Support either:
       *
       * { products: [...] }
       *
       * or directly:
       *
       * [...]
       */
      const productList = Array.isArray(data)
        ? data
        : Array.isArray(data.products)
          ? data.products
          : [];

      setProducts(productList);
    } catch (err: unknown) {
      console.error("Error fetching seller products:", err);

      const message =
        err instanceof Error
          ? err.message
          : "Failed to load products";

      setError(message);

      showToast(
        "Unable to load products",
        message
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete a product.
   */
  const deleteProduct = async (productId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(productId);

    try {
      const res = await apiClient.delete(
        `/api/seller/products/${productId}`
      );

      if (!res.ok) {
        let message = `Failed to delete product: ${res.status}`;

        try {
          const data = await res.json();

          if (data?.error) {
            message = data.error;
          }
        } catch {
          // Response may not contain JSON.
        }

        throw new Error(message);
      }

      /*
       * Remove immediately from local state.
       */
      setProducts((currentProducts) =>
        currentProducts.filter(
          (product) => product.id !== productId
        )
      );

      showToast(
        "Product deleted",
        "The product was deleted successfully."
      );
    } catch (err: unknown) {
      console.error("Error deleting product:", err);

      const message =
        err instanceof Error
          ? err.message
          : "Failed to delete product";

          showToast(
            "Delete failed",
            message
          );
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * Load seller products when the authenticated session is ready.
   */
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      fetchSellerProducts();
    }
  }, [status, session]);

  /**
   * Authentication loading state.
   */
  if (status === "loading") {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-600">
          Loading...
        </p>
      </div>
    );
  }

  /**
   * Not authenticated.
   */
  if (status === "unauthenticated") {
    router.replace("/login");

    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-600">
          Redirecting to login...
        </p>
      </div>
    );
  }

  /**
   * Only SELLER accounts can access this page.
   */
  if (session?.user?.role !== "SELLER") {
    if (session?.user?.role === "ADMIN") {
      router.replace("/admin");
    } else {
      router.replace("/");
    }

    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-600">
          Redirecting...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <SectionTitle
        title="Your Fishnet Products"
        path="Home | Dashboard | Seller | Products"
      />

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Manage Your Fishnet Products
            </h1>

            <p className="mt-4 text-lg text-gray-600">
              Add, edit, and manage your fishing-net products here.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/seller/products/new")
            }
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Add Fishnet
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-medium text-red-800">
                  Unable to load products
                </h2>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={fetchSellerProducts}
                className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-8 rounded-lg border border-gray-200 bg-white py-16 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

            <p className="mt-4 text-gray-600">
              Loading products...
            </p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && products.length === 0 && (
          <div className="mt-8 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              No fishnet products yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-gray-600">
              Add your first fishing-net product to start selling
              on fishnet.
            </p>

            <div className="mt-6">
              <button
                type="button"
                onClick={() =>
                  router.push("/seller/products/new")
                }
                className="rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
              >
                Add First Fishnet
              </button>
            </div>
          </div>
        )}

        {/* Products */}
        {!loading && !error && products.length > 0 && (
          <div className="mt-8">
            {/* Product count */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {products.length}{" "}
                {products.length === 1
                  ? "product"
                  : "products"}
              </p>

              <button
                type="button"
                onClick={fetchSellerProducts}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Refresh
              </button>
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto rounded-lg border border-gray-200 md:block">
              <table className="min-w-full divide-y divide-gray-200 bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Fishnet
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Category
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Price
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Stock
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => {
                    const inStock =
                      Number(product.inStock) || 0;

                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50"
                      >
                        {/* Fishnet */}
                        <td className="whitespace-nowrap px-4 py-4">
                          <div className="flex items-center gap-3">
                            {product.mainImage ? (
                              <img
                                src={product.mainImage}
                                alt={
                                  product.title ||
                                  "Fishnet image"
                                }
                                className="h-14 w-14 rounded-md object-cover"
                              />
                            ) : (
                              <div className="flex h-14 w-14 items-center justify-center rounded-md bg-gray-100 text-xs text-gray-500">
                                No Image
                              </div>
                            )}

                            <div>
                              <p className="font-medium text-gray-900">
                                {product.title}
                              </p>

                              {product.description && (
                                <p className="mt-1 max-w-xs truncate text-sm text-gray-500">
                                  {product.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                          {product.category?.name ||
                            "Uncategorized"}
                        </td>

                        {/* Price */}
                        <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900">
                          $
                          {Number(product.price).toFixed(2)}
                        </td>

                        {/* Stock */}
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                          {inStock}
                        </td>

                        {/* Status */}
                        <td className="whitespace-nowrap px-4 py-4 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              inStock > 0
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {inStock > 0
                              ? "In Stock"
                              : "Out of Stock"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="whitespace-nowrap px-4 py-4 text-right text-sm">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                router.push(
                                  `/seller/products/${product.id}`
                                )
                              }
                              className="rounded-md bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              disabled={
                                deletingId === product.id
                              }
                              onClick={() =>
                                deleteProduct(product.id)
                              }
                              className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingId === product.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

{/* Mobile cards */}
<div className="space-y-4 md:hidden">
  {products.map((product) => {
    const inStock = Number(product.inStock) || 0;

    return (
      <div
        key={product.id}
        className="rounded-lg border border-gray-200 bg-white p-4"
      >
        <div className="flex gap-4">
          {product.mainImage ? (
            <img
              src={product.mainImage}
              alt={product.title || "Fishnet image"}
              className="h-20 w-20 flex-shrink-0 rounded-md object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-md bg-gray-100 text-xs text-gray-500">
              No Image
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-gray-900">
              {product.title}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {product.category?.name || "Uncategorized"}
            </p>

            <p className="mt-2 font-medium text-gray-900">
              ${Number(product.price).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          <div>
            <p className="text-sm text-gray-500">Stock</p>

            <p className="font-medium text-gray-900">
              {inStock}
            </p>
          </div>

          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              inStock > 0
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {inStock > 0 ? "In Stock" : "Out of Stock"}
          </span>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() =>
              router.push(`/seller/products/${product.id}`)
            }
            className="flex-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Edit
          </button>

          <button
            type="button"
            disabled={deletingId === product.id}
            onClick={() => deleteProduct(product.id)}
            className="flex-1 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deletingId === product.id
              ? "Deleting..."
              : "Delete"}
          </button>
        </div>
      </div>
    );
  })}
</div>


          </div>
        )}
      </div>
    </div>
  );
};

export default SellerProductsPage;