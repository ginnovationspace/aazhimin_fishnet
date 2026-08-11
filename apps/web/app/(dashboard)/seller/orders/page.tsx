// ============================================================
// FILE:
// apps/web/app/(dashboard)/seller/orders/page.tsx
// ============================================================

"use client";

import { SectionTitle } from "@/components";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface SellerOrderItem {
  id: string;
  quantity: number;
  product?: {
    title?: string;
  };
}

interface SellerOrder {
  id: string;
  status: string;
  marketplaceOrder?: {
    id?: string;
    buyerName?: string;
    buyerLastname?: string;
    totalAmount?: number;
  };
  orderItems?: SellerOrderItem[];
}

const SellerOrdersPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getMerchantId = async () => {
    if (!session?.user?.email) {
      return null;
    }

    try {
      const res = await apiClient.get(
        `/api/users/email/${session.user.email}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch user");
      }

      const userData = await res.json();

      return userData.merchant?.id || null;
    } catch (err) {
      console.error("Error fetching merchant ID:", err);
      return null;
    }
  };

  const fetchSellerOrders = async () => {
    if (!session?.user) {
      setError("User not found");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const merchantId = await getMerchantId();

      if (!merchantId) {
        throw new Error("Merchant not found for this user");
      }

      const res = await apiClient.get(
        `/api/seller/orders?merchantId=${merchantId}`
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch orders: ${res.status}`);
      }

      const data = await res.json();

      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching seller orders:", err);

      const message =
        err instanceof Error ? err.message : "Failed to load orders";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (
    sellerOrderId: string,
    newStatus: string
  ) => {
    try {
      const res = await apiClient.put(
        `/api/seller/orders/${sellerOrderId}/status`,
        {
          status: newStatus,
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to update order status: ${res.status}`);
      }

      await fetchSellerOrders();

      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    } catch (err) {
      console.error("Error updating order status:", err);

      const message =
        err instanceof Error
          ? err.message
          : "Failed to update order status";

      toast({
        title: "Error",
        description: message,
      });
    }
  };

  useEffect(() => {
    if (session?.user) {
      void fetchSellerOrders();
    }
  }, [session]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return <p>Redirecting to login...</p>;
  }

  if (session?.user?.role !== "SELLER") {
    if (session?.user?.role === "ADMIN") {
      router.push("/(dashboard)/admin");
    } else {
      router.push("/");
    }

    return <p>Redirecting...</p>;
  }

  return (
    <div className="bg-white">
      <SectionTitle
        title="Your Fishnet Orders"
        path="Home | Dashboard | Seller | Orders"
      />

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Your Fishnet Orders
        </h1>

        <p className="mt-4 text-lg text-gray-600">
          Manage your fishnet orders here. Update order status as you process
          them.
        </p>

        {error && (
          <div className="mb-4 mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading && (
          <div className="py-8 text-center">
            <p>Loading your fishnet orders...</p>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="py-8 text-center">
            <p>No fishnet orders yet.</p>

            <p className="mt-4">
              Your customers&apos; fishnet orders will appear here as they come
              in. Start by listing your products to begin receiving orders.
            </p>

            <div className="mt-6">
              <Link
                href="/seller/products"
                className="rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
              >
                Manage Your Fishnet Products
              </Link>
            </div>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="mt-6">
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 bg-white">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                      Order ID
                    </th>

                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                      Buyer
                    </th>

                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                      Fishnet Products
                    </th>

                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                      Amount
                    </th>

                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                      Status
                    </th>

                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">
                        {order.marketplaceOrder?.id || order.id}
                      </td>

                      <td className="px-4 py-2 text-sm text-gray-700">
                        {order.marketplaceOrder?.buyerName}{" "}
                        {order.marketplaceOrder?.buyerLastname}
                      </td>

                      <td className="px-4 py-2 text-sm text-gray-700">
                        {order.orderItems?.map((item) => (
                          <div key={item.id}>
                            <span className="block">
                              {item.product?.title || "Product"} x
                              {item.quantity}
                            </span>
                          </div>
                        ))}
                      </td>

                      <td className="px-4 py-2 text-sm font-medium text-gray-900">
                        $
                        {(
                          (order.marketplaceOrder?.totalAmount || 0) / 100
                        ).toFixed(2)}
                      </td>

                      <td className="px-4 py-2 text-sm">
                        <span
                          className={`rounded px-2 py-1 text-xs font-medium ${
                            order.status === "DELIVERED"
                              ? "bg-green-100 text-green-800"
                              : order.status === "SHIPPED"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "PROCESSING"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : order.status === "READY_TO_SHIP"
                                    ? "bg-indigo-100 text-indigo-800"
                                    : order.status === "PAYMENT_CONFIRMED"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.status
                            .split(/(?=[A-Z])/)
                            .join(" ")
                            .toLowerCase()
                            .split(" ")
                            .map(
                              (word: string) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")}
                        </span>
                      </td>

                      <td className="px-4 py-2 text-sm">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            void updateOrderStatus(
                              order.id,
                              e.target.value
                            )
                          }
                          className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="ORDER_PLACED">
                            Order Placed
                          </option>
                          <option value="PAYMENT_CONFIRMED">
                            Payment Confirmed
                          </option>
                          <option value="PROCESSING">Processing</option>
                          <option value="READY_TO_SHIP">
                            Ready to Ship
                          </option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="OUT_FOR_DELIVERY">
                            Out for Delivery
                          </option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                          <option value="REFUND_REQUESTED">
                            Refund Requested
                          </option>
                          <option value="REFUNDED">Refunded</option>
                          <option value="DISPUTED">Disputed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerOrdersPage;







