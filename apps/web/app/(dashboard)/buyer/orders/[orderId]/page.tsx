// ============================================================
// FILE:
// apps/web/app/(dashboard)/buyer/orders/[orderId]/page.tsx
// ============================================================

"use client";

import { SectionTitle } from "@/components";
import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

const BuyerOrderDetailsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams<{ orderId: string }>();
  const orderId = params.orderId;
  const { toast } = useToast();

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatStatus = (value: string) => {
    return value
      .split(/(?=[A-Z])/)
      .join(" ")
      .toLowerCase()
      .split(" ")
      .map(
        (word: string) =>
          word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(" ");
  };

  const getStatusClass = (value: string) => {
    switch (value) {
      case "DELIVERED":
        return "bg-green-100 text-green-800";

      case "SHIPPED":
      case "OUT_FOR_DELIVERY":
        return "bg-blue-100 text-blue-800";

      case "PROCESSING":
      case "READY_TO_SHIP":
        return "bg-yellow-100 text-yellow-800";

      case "ORDER_PLACED":
      case "PAYMENT_CONFIRMED":
        return "bg-gray-100 text-gray-800";

      case "CANCELLED":
      case "REFUNDED":
        return "bg-red-100 text-red-800";

      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const fetchBuyerOrder = async () => {
    if (!session?.user) {
      setError("User not found");
      setLoading(false);
      return;
    }

    if (!orderId) {
      setError("Invalid order ID");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.get(`/api/buyer/orders/${orderId}`);

      if (!res.ok) {
        throw new Error(`Failed to fetch order: ${res.status}`);
      }

      const data = await res.json();

      setOrder(data);
    } catch (err) {
      console.error("Error fetching buyer order details:", err);

      const message =
        err instanceof Error ? err.message : "Failed to load order";

      setError(message);

      toast({
        title: "Error",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user && orderId) {
      void fetchBuyerOrder();
    }
  }, [session, orderId]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return <p>Redirecting to login...</p>;
  }

  if (session?.user?.role !== "BUYER") {
    if (session?.user?.role === "ADMIN") {
      router.push("/(dashboard)/admin");
    } else if (session?.user?.role === "SELLER") {
      router.push("/(dashboard)/seller");
    } else {
      router.push("/");
    }

    return <p>Redirecting...</p>;
  }

  if (!orderId) {
    return <p>Invalid order ID</p>;
  }

  if (loading) {
    return (
      <div className="bg-white">
        <SectionTitle
          title="Order Details"
          path="Home | Dashboard | Buyer | Orders | Details"
        />

        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order && error) {
    return (
      <div className="bg-white">
        <SectionTitle
          title="Order Details"
          path="Home | Dashboard | Buyer | Orders | Details"
        />

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return <p>Order not found</p>;
  }

  return (
    <div className="bg-white">
      <SectionTitle
        title="Order Details"
        path="Home | Dashboard | Buyer | Orders | Details"
      />

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Order Details
        </h1>

        <p className="mt-4 text-lg text-gray-600">
          View the details of your order #
          {order.id?.substring(0, 8)}.
        </p>

        {error && (
          <div className="mb-4 mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Order Summary */}
        <div className="mt-6 space-y-6">
          <div className="rounded-lg bg-gray-50 p-6">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Order Summary
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="text-lg font-medium">
                  #{order.id?.substring(0, 8)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="text-lg font-medium">
                  {order.placedAt
                    ? new Date(order.placedAt).toLocaleDateString()
                    : "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Status</p>

                <span
                  className={`rounded px-2 py-1 text-xs font-medium ${getStatusClass(
                    order.status
                  )}`}
                >
                  {formatStatus(order.status)}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-lg font-medium text-gray-900">
                  ${Number(order.totalAmount || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Buyer Information */}
          <div className="rounded-lg bg-gray-50 p-6">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Buyer Information
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-lg font-medium">
                  {order.buyerName} {order.buyerLastname}
                </p>

                <p className="mt-2 text-sm text-gray-500">Email</p>
                <p className="text-lg font-medium">
                  {order.buyerEmail}
                </p>

                <p className="mt-2 text-sm text-gray-500">Phone</p>
                <p className="text-lg font-medium">
                  {order.buyerPhone}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Company</p>
                <p className="text-lg font-medium">
                  {order.buyerCompany || "-"}
                </p>

                <p className="mt-2 text-sm text-gray-500">Address</p>
                <p className="text-lg font-medium">
                  {order.buyerAddress}
                  {order.buyerApartment
                    ? `, ${order.buyerApartment}`
                    : ""}
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  City, State, ZIP
                </p>
                <p className="text-lg font-medium">
                  {order.buyerCity}, {order.buyerPostalCode}
                </p>

                <p className="mt-2 text-sm text-gray-500">Country</p>
                <p className="text-lg font-medium">
                  {order.buyerCountry}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="rounded-lg bg-gray-50 p-6">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Order Items
            </h2>

            {order.sellerOrders &&
            order.sellerOrders.length > 0 ? (
              order.sellerOrders.map(
                (sellerOrder: any) => (
                  <div
                    key={sellerOrder.id}
                    className="mb-6 last:mb-0"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <h3 className="text-lg font-medium text-gray-900">
                        Items from{" "}
                        {sellerOrder.merchant?.name ||
                          "Seller"}
                      </h3>

                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${getStatusClass(
                          sellerOrder.status
                        )}`}
                      >
                        {formatStatus(
                          sellerOrder.status
                        )}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {sellerOrder.orderItems?.map(
                        (item: any) => (
                          <div
                            key={item.id}
                            className="flex items-start space-x-4 rounded-lg border border-gray-200 bg-white p-4"
                          >
                            <Image
                              src={
                                item.product?.mainImage
                                  ? `/${item.product.mainImage}`
                                  : "/product_placeholder.jpg"
                              }
                              alt={
                                item.product?.title ||
                                "Product"
                              }
                              width={80}
                              height={80}
                              className="h-20 w-20 flex-none rounded-md object-cover object-center"
                            />

                            <div className="flex-auto space-y-1">
                              <h4 className="font-medium">
                                {item.product?.title ||
                                  "Product"}
                              </h4>

                              <p className="text-sm text-gray-500">
                                Quantity: {item.quantity}
                              </p>

                              <p className="text-sm text-gray-500">
                                Unit Price: $
                                {Number(
                                  item.unitPrice || 0
                                ).toFixed(2)}
                              </p>

                              <p className="text-sm font-medium text-gray-500">
                                Total: $
                                {Number(
                                  item.totalPrice || 0
                                ).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )
              )
            ) : (
              <p className="py-4 text-center text-gray-500">
                No items found in this order.
              </p>
            )}
          </div>

          {/* Payments */}
          {order.payments &&
            order.payments.length > 0 && (
              <div className="rounded-lg bg-gray-50 p-6">
                <h2 className="mb-4 text-xl font-bold text-gray-900">
                  Payment Information
                </h2>

                <div className="space-y-4">
                  {order.payments.map(
                    (payment: any) => (
                      <div
                        key={payment.id}
                        className="rounded-lg border border-gray-200 bg-white p-4"
                      >
                        <div className="mb-2 flex items-start justify-between">
                          <h3 className="text-lg font-medium text-gray-900">
                            Payment #
                            {payment.id?.substring(
                              0,
                              8
                            )}
                          </h3>

                          <span
                            className={`rounded px-2 py-1 text-xs font-medium ${
                              payment.status ===
                              "PAID"
                                ? "bg-green-100 text-green-800"
                                : payment.status ===
                                    "FAILED"
                                  ? "bg-red-100 text-red-800"
                                  : payment.status ===
                                      "PROCESSING"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {formatStatus(
                              payment.status
                            )}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm text-gray-500">
                            Amount: $
                            {Number(
                              payment.amount || 0
                            ).toFixed(2)}
                          </p>

                          <p className="text-sm text-gray-500">
                            Method:{" "}
                            {payment.method
                              ? payment.method
                                  .charAt(0)
                                  .toUpperCase() +
                                payment.method.slice(1)
                              : "-"}
                          </p>

                          {payment.transactionId && (
                            <p className="text-sm text-gray-500">
                              Transaction ID:{" "}
                              {payment.transactionId}
                            </p>
                          )}

                          <p className="text-sm text-gray-500">
                            Date:{" "}
                            {payment.createdAt
                              ? new Date(
                                  payment.createdAt
                                ).toLocaleDateString()
                              : "-"}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

          {/* Refunds */}
          {order.refunds &&
            order.refunds.length > 0 && (
              <div className="rounded-lg bg-gray-50 p-6">
                <h2 className="mb-4 text-xl font-bold text-gray-900">
                  Refund Information
                </h2>

                <div className="space-y-4">
                  {order.refunds.map(
                    (refund: any) => (
                      <div
                        key={refund.id}
                        className="rounded-lg border border-gray-200 bg-white p-4"
                      >
                        <div className="mb-2 flex items-start justify-between">
                          <h3 className="text-lg font-medium text-gray-900">
                            Refund #
                            {refund.id?.substring(
                              0,
                              8
                            )}
                          </h3>

                          <span
                            className={`rounded px-2 py-1 text-xs font-medium ${
                              refund.status ===
                              "PAID"
                                ? "bg-green-100 text-green-800"
                                : refund.status ===
                                    "PENDING"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {formatStatus(
                              refund.status
                            )}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm text-gray-500">
                            Amount: $
                            {Number(
                              refund.amount || 0
                            ).toFixed(2)}
                          </p>

                          <p className="text-sm text-gray-500">
                            Reason: {refund.reason}
                          </p>

                          <p className="text-sm text-gray-500">
                            Date:{" "}
                            {refund.createdAt
                              ? new Date(
                                  refund.createdAt
                                ).toLocaleDateString()
                              : "-"}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

          {/* Disputes */}
          {order.disputes &&
            order.disputes.length > 0 && (
              <div className="rounded-lg bg-gray-50 p-6">
                <h2 className="mb-4 text-xl font-bold text-gray-900">
                  Dispute Information
                </h2>

                <div className="space-y-4">
                  {order.disputes.map(
                    (dispute: any) => (
                      <div
                        key={dispute.id}
                        className="rounded-lg border border-gray-200 bg-white p-4"
                      >
                        <div className="mb-2 flex items-start justify-between">
                          <h3 className="text-lg font-medium text-gray-900">
                            Dispute #
                            {dispute.id?.substring(
                              0,
                              8
                            )}
                          </h3>

                          <span
                            className={`rounded px-2 py-1 text-xs font-medium ${
                              dispute.status ===
                              "OPEN"
                                ? "bg-yellow-100 text-yellow-800"
                                : dispute.status ===
                                    "UNDER_REVIEW"
                                  ? "bg-blue-100 text-blue-800"
                                  : dispute.status ===
                                      "RESOLVED"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {formatStatus(
                              dispute.status
                            )}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm text-gray-500">
                            Reason: {dispute.reason}
                          </p>

                          {dispute.description && (
                            <p className="text-sm text-gray-500">
                              Description:{" "}
                              {dispute.description}
                            </p>
                          )}

                          <p className="text-sm text-gray-500">
                            Date:{" "}
                            {dispute.createdAt
                              ? new Date(
                                  dispute.createdAt
                                ).toLocaleDateString()
                              : "-"}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default BuyerOrderDetailsPage;
