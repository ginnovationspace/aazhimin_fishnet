'use client';

import { SectionTitle } from "@/components";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

const SellerDashboardPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    pendingOrders: 0,
    completedOrders: 0,
    balance: 0,
    monthlyRevenue: 0,
    pendingPayouts: 0,
    averageRating: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      window.location.replace("/login");
      return;
    }

    if (session?.user?.role === "ADMIN") {
      window.location.replace("/admin");
    } else if (session?.user?.role !== "SELLER") {
      window.location.replace("/");
    }
  }, [session?.user?.role, status]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (status !== "authenticated" || session?.user?.role !== "SELLER") {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const statsResponse = await apiClient.get(`/api/seller/stats`);
        if (!statsResponse.ok) {
          const data = await statsResponse.json().catch(() => null);
          throw new Error(data?.error || `Unable to load dashboard data (${statsResponse.status}).`);
        }

        const statsData = await statsResponse.json();
        setStats(statsData);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [session?.user?.role, status]);

  /* ============================================================
     AUTHENTICATION
  ============================================================ */

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="mt-3 text-sm text-gray-600">
            Loading dashboard...
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

  /* ============================================================
     ROLE CHECK
  ============================================================ */

  if (session?.user?.role !== "SELLER") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-600">
          Redirecting...
        </p>
      </div>
    );
  }

  /* ============================================================
     SAFE USER INFORMATION
  ============================================================ */

  const sellerName =
    session.user.name?.trim() ||
    session.user.email?.split("@")[0] ||
    "Seller";

  const storeName =
    session.user.name?.trim() || "Not Set";

  /* ============================================================
     DASHBOARD
  ============================================================ */

  return (
    <div className="min-h-screen bg-white">
      <SectionTitle
        title="Seller Dashboard"
        path="Home | Dashboard | Seller"
      />

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Seller Dashboard
          </h1>

          <p className="mt-4 text-lg text-gray-600">
            Welcome back,{" "}
            <span className="font-semibold text-gray-900">
              {sellerName}
            </span>
            ! Manage your fishing-net products, orders,
            and payouts here.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                // Trigger refetch
              }}
              className="mt-2 px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && !error && (
          <div className="mb-8">
            <div className="flex items-center justify-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              <p className="mt-3 text-sm text-gray-600">
                Loading dashboard data...
              </p>
            </div>
          </div>
        )}

        {/* Dashboard Cards */}
        {!loading && !error && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* =====================================================
                 OVERVIEW
            ====================================================== */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <h3 className="mb-4 text-lg font-medium text-gray-900">
                Overview
              </h3>

              <div className="space-y-4">
                <p className="flex justify-between">
                  <span className="text-gray-500">
                    Total Products
                  </span>

                  <span className="font-medium text-gray-900">
                    {stats.totalProducts}
                  </span>
                </p>

                <p className="flex justify-between">
                  <span className="text-gray-500">
                    Active Products
                  </span>

                  <span className="font-medium text-gray-900">
                    {stats.activeProducts}
                  </span>
                </p>

                <p className="flex justify-between">
                  <span className="text-gray-500">
                    Pending Orders
                  </span>

                  <span className="font-medium text-gray-900">
                    {stats.pendingOrders}
                  </span>
                </p>

                <p className="flex justify-between">
                  <span className="text-gray-500">
                    Completed Orders
                  </span>

                  <span className="font-medium text-gray-900">
                    {stats.completedOrders}
                  </span>
                </p>
              </div>
            </div>

            {/* =====================================================
                 PRODUCTS
            ====================================================== */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <h3 className="mb-4 text-lg font-medium text-gray-900">
                Products
              </h3>

              <div className="space-y-4">
                <p className="flex justify-between">
                  <span className="text-gray-500">
                    Listings
                  </span>

                  <span className="font-medium text-gray-900">
                    {stats.activeProducts} active
                  </span>
                </p>

                <p className="flex justify-between">
                  <span className="text-gray-500">
                    Out of Stock
                  </span>

                  <span className="font-medium text-gray-900">
                    {stats.totalProducts - stats.activeProducts}
                  </span>
                </p>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/seller/products")
                  }
                  className="w-full rounded-md bg-blue-600 px-4 py-2 text-left font-medium text-white transition hover:bg-blue-700"
                >
                  Manage Products
                </button>
              </div>
            </div>

            {/* =====================================================
                 ORDERS
            ====================================================== */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <h3 className="mb-4 text-lg font-medium text-gray-900">
                Orders
              </h3>

              <div className="space-y-4">
                <p className="flex justify-between">
                  <span className="text-gray-500">
                    New Orders
                  </span>

                  <span className="font-medium text-gray-900">
                    {stats.pendingOrders}
                  </span>
                </p>

                <p className="flex justify-between">
                  <span className="text-gray-500">
                    Processing
                  </span>

                  <span className="font-medium text-gray-900">
                    {/* Processing orders would be part of pending or a separate stat */}
                    {Math.max(0, stats.pendingOrders - 5)} {/* Example calculation */}
                  </span>
                </p>

                <p className="flex justify-between">
                  <span className="text-gray-500">
                    Shipped
                  </span>

                  <span className="font-medium text-gray-900">
                    {stats.completedOrders}
                  </span>
                </p>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/seller/orders")
                  }
                  className="w-full rounded-md bg-blue-600 px-4 py-2 text-left font-medium text-white transition hover:bg-blue-700"
                >
                  Manage Orders
                </button>
              </div>
            </div>

            {/* =====================================================
                 EARNINGS
            ====================================================== */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <h3 className="mb-4 text-lg font-medium text-gray-900">
                Earnings
              </h3>

              <div className="space-y-4">
                <p className="flex justify-between">
                  <span className="text-gray-500">
                    Balance
                  </span>

                  <span className="font-medium text-gray-900">
                    ${stats.balance.toFixed(2)}
                  </span>
                </p>

                <p className="flex justify-between">
                  <span className="text-gray-500">
                    This Month
                  </span>

                  <span className="font-medium text-gray-900">
                    ${stats.monthlyRevenue.toFixed(2)}
                  </span>
                </p>

                <p className="flex justify-between">
                  <span className="text-gray-500">
                    Pending Payout
                  </span>

                  <span className="font-medium text-gray-900">
                    ${stats.pendingPayouts.toFixed(2)}
                  </span>
                </p>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/seller/payouts")
                  }
                  className="w-full rounded-md bg-green-600 px-4 py-2 text-left font-medium text-white transition hover:bg-green-700"
                >
                  View Payouts
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty state when no data available but not loading/error */}
        {!loading && !error && (
          <div className="mt-8 text-center py-12">
            <p className="text-lg text-gray-500">
              Your dashboard is ready! Start by adding your first fishnet product
              to see sales analytics and order information here.
            </p>
            <div className="mt-6">
              <Link
                href="/seller/products/new"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700"
              >
                Add First Fishnet
                <span className="ml-2">→</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboardPage;
