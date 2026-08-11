"use client";

import { SectionTitle } from "@/components";
import { useSession } from "@/lib/auth-client";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import apiClient from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface Product {
  id: string;
  title: string;
  mainImage?: string | null;
}

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number | string;
  totalPrice: number | string;
  product: Product;
}

interface Merchant {
  id?: string;
  name?: string;
}

interface SellerOrder {
  id: string;
  status: string;
  merchant: Merchant;
  orderItems: OrderItem[];
}

interface Payment {
  id: string;
  status: string;
  amount: number | string;
  method: string;
  transactionId?: string | null;
  createdAt: string;
}

interface Refund {
  id: string;
  status: string;
  amount: number | string;
  reason?: string | null;
  createdAt: string;
}

interface Dispute {
  id: string;
  status: string;
  reason?: string | null;
  description?: string | null;
  createdAt: string;
}

interface BuyerOrder {
  id: string;
  placedAt: string;
  status: string;
  totalAmount: number | string;

  buyerName?: string | null;
  buyerLastname?: string | null;
  buyerEmail?: string | null;
  buyerPhone?: string | null;
  buyerCompany?: string | null;
  buyerAddress?: string | null;
  buyerApartment?: string | null;
  buyerCity?: string | null;
  buyerPostalCode?: string | null;
  buyerCountry?: string | null;

  sellerOrders: SellerOrder[];
  payments?: Payment[];
  refunds?: Refund[];
  disputes?: Dispute[];
}

const formatStatus = (status: string): string => {
  return status
    .split(/(?=[A-Z])/)
    .join(" ")
    .toLowerCase()
    .split(" ")
    .map((word: string) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};

const getStatusClasses = (status: string): string => {
  switch (status) {
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

const BuyerOrderDetailsPage = () => {
  const { data: session, status } = useSession();

  const router = useRouter();

  /*
   * useRouter() does not contain params.
   *
   * For a route such as:
   * /buyer/orders/[orderId]
   *
   * useParams() returns:
   * { orderId: "..." }
   */
  const params = useParams<{ orderId: string }>();

  const { toast } = useToast();

  const orderId = params?.orderId;

  const [order, setOrder] = useState<BuyerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBuyerOrder = useCallback(async () => {
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
      const response = await apiClient.get(
        `/api/buyer/orders/${encodeURIComponent(orderId)}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch order. Server returned ${response.status}.`
        );
      }

      const data = (await response.json()) as BuyerOrder;

      setOrder(data);
    } catch (err: unknown) {
      console.error("Error fetching buyer order details:", err);

      const message =
        err instanceof Error
          ? err.message
          : "Failed to load order";

      setError(message);

      /*
       * Your useToast() hook exposes toast(...)
       * rather than toast.error(...).
       */
      toast({
        title: "Unable to load order",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }, [session?.user, orderId, toast]);

  useEffect(() => {
    if (status === "authenticated" && orderId) {
      void fetchBuyerOrder();
    }

    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [
    status,
    orderId,
    fetchBuyerOrder,
    router,
  ]);

  /*
   * Authentication loading
   */
  if (status === "loading") {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  /*
   * Not authenticated
   */
  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-600">
          Redirecting to login...
        </p>
      </div>
    );
  }

  /*
   * Invalid order ID
   */
  if (!orderId) {
    return (
      <div className="bg-white">
        <SectionTitle
          title="Order Details"
          path="Home | Dashboard | Buyer | Orders | Details"
        />

        <div className="mx-auto max-w-7xl px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Invalid Order ID
          </h1>

          <p className="mt-3 text-gray-600">
            The order you are looking for does not exist.
          </p>

          <button
            type="button"
            onClick={() => router.push("/buyer/orders")}
            className="mt-6 rounded-md bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  /*
   * Check buyer role
   */
  if (session?.user?.role !== "BUYER") {
    const role = session?.user?.role;

    if (role === "ADMIN") {
      router.replace("/admin");
    } else if (role === "SELLER") {
      router.replace("/seller");
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

  /*
   * Loading order
   */
  if (loading) {
    return (
      <div className="bg-white">
        <SectionTitle
          title="Order Details"
          path="Home | Dashboard | Buyer | Orders | Details"
        />

        <div className="mx-auto max-w-7xl px-4 py-24 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="mt-5 text-gray-600">
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  /*
   * Error
   */
  if (error) {
    return (
      <div className="bg-white">
        <SectionTitle
          title="Order Details"
          path="Home | Dashboard | Buyer | Orders | Details"
        />

        <div className="mx-auto max-w-7xl px-4 py-24 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <span className="text-2xl font-bold text-red-600">
              !
            </span>
          </div>

          <h1 className="mt-6 text-2xl font-bold text-gray-900">
            Unable to load order
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-gray-600">
            {error}
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => void fetchBuyerOrder()}
              className="rounded-md bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700"
            >
              Try Again
            </button>

            <button
              type="button"
              onClick={() => router.push("/buyer/orders")}
              className="rounded-md bg-gray-200 px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-300"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  /*
   * Order not found
   */
  if (!order) {
    return (
      <div className="bg-white">
        <SectionTitle
          title="Order Details"
          path="Home | Dashboard | Buyer | Orders | Details"
        />

        <div className="mx-auto max-w-7xl px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Order Not Found
          </h1>

          <p className="mt-3 text-gray-600">
            We couldn't find this order.
          </p>

          <button
            type="button"
            onClick={() => router.push("/buyer/orders")}
            className="mt-6 rounded-md bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <SectionTitle
        title="Order Details"
        path="Home | Dashboard | Buyer | Orders | Details"
      />

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Order Details
            </h1>

            <p className="mt-3 text-lg text-gray-600">
              View the details of your order #
              {order.id.substring(0, 8)}.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/buyer/orders")}
            className="rounded-md bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
          >
            ← Back to Orders
          </button>
        </div>

        <div className="space-y-6">

          {/* --------------------------------------------------------- */}
          {/* Order Summary */}
          {/* --------------------------------------------------------- */}

          <div className="rounded-lg bg-gray-50 p-6">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Order Summary
            </h2>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

              <div>
                <p className="text-sm text-gray-500">
                  Order ID
                </p>

                <p className="mt-1 text-lg font-medium text-gray-900">
                  #{order.id.substring(0, 8)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Date
                </p>

                <p className="mt-1 text-lg font-medium text-gray-900">
                  {new Date(order.placedAt).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Status
                </p>

                <span
                  className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                    order.status
                  )}`}
                >
                  {formatStatus(order.status)}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Total Amount
                </p>

                <p className="mt-1 text-lg font-bold text-gray-900">
                  ${order.totalAmount}
                </p>
              </div>

            </div>
          </div>

          {/* --------------------------------------------------------- */}
          {/* Buyer Information */}
          {/* --------------------------------------------------------- */}

          <div className="rounded-lg bg-gray-50 p-6">
            <h2 className="mb-6 text-xl font-bold text-gray-900">
              Buyer Information
            </h2>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">
                    Name
                  </p>

                  <p className="text-lg font-medium text-gray-900">
                    {order.buyerName || "-"}{" "}
                    {order.buyerLastname || ""}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Email
                  </p>

                  <p className="text-lg font-medium text-gray-900">
                    {order.buyerEmail || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Phone
                  </p>

                  <p className="text-lg font-medium text-gray-900">
                    {order.buyerPhone || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Company
                  </p>

                  <p className="text-lg font-medium text-gray-900">
                    {order.buyerCompany || "-"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">

                <div>
                  <p className="text-sm text-gray-500">
                    Address
                  </p>

                  <p className="text-lg font-medium text-gray-900">
                    {order.buyerAddress || "-"}
                    {order.buyerApartment
                      ? `, ${order.buyerApartment}`
                      : ""}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    City, State, ZIP
                  </p>

                  <p className="text-lg font-medium text-gray-900">
                    {order.buyerCity || "-"}
                    {order.buyerPostalCode
                      ? `, ${order.buyerPostalCode}`
                      : ""}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Country
                  </p>

                  <p className="text-lg font-medium text-gray-900">
                    {order.buyerCountry || "-"}
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* --------------------------------------------------------- */}
          {/* Order Items */}
          {/* --------------------------------------------------------- */}

          <div className="rounded-lg bg-gray-50 p-6">
            <h2 className="mb-6 text-xl font-bold text-gray-900">
              Order Items
            </h2>

            {order.sellerOrders?.length > 0 ? (
              <div className="space-y-8">

                {order.sellerOrders.map(
                  (sellerOrder: SellerOrder) => (
                    <div
                      key={sellerOrder.id}
                      className="rounded-lg border border-gray-200 bg-white p-5"
                    >

                      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                        <h3 className="text-lg font-medium text-gray-900">
                          Items from{" "}
                          {sellerOrder.merchant?.name ||
                            "Seller"}
                        </h3>

                        <span
                          className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
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
                          (item: OrderItem) => (
                            <div
                              key={item.id}
                              className="flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-4"
                            >
                              <Image
                                src={
                                  item.product?.mainImage
                                    ? item.product.mainImage.startsWith(
                                        "/"
                                      )
                                      ? item.product.mainImage
                                      : `/${item.product.mainImage}`
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

                              <div className="min-w-0 flex-auto space-y-1">
                                <h4 className="font-medium text-gray-900">
                                  {item.product?.title ||
                                    "Product"}
                                </h4>

                                <p className="text-sm text-gray-500">
                                  Quantity:{" "}
                                  {item.quantity}
                                </p>

                                <p className="text-sm text-gray-500">
                                  Unit Price: $
                                  {item.unitPrice}
                                </p>

                                <p className="text-sm font-medium text-gray-900">
                                  Total: $
                                  {item.totalPrice}
                                </p>
                              </div>
                            </div>
                          )
                        )}

                      </div>
                    </div>
                  )
                )}

              </div>
            ) : (
              <p className="py-8 text-center text-gray-500">
                No items found in this order.
              </p>
            )}
          </div>

          {/* --------------------------------------------------------- */}
          {/* Payments */}
          {/* --------------------------------------------------------- */}

          {order.payments &&
            order.payments.length > 0 && (
              <div className="rounded-lg bg-gray-50 p-6">
                <h2 className="mb-6 text-xl font-bold text-gray-900">
                  Payment Information
                </h2>

                <div className="space-y-4">

                  {order.payments.map(
                    (payment: Payment) => (
                      <div
                        key={payment.id}
                        className="rounded-lg border border-gray-200 bg-white p-5"
                      >

                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                          <h3 className="text-lg font-medium text-gray-900">
                            Payment #
                            {payment.id.substring(0, 8)}
                          </h3>

                          <span
                            className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${
                              payment.status === "PAID"
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
                            Amount: ${payment.amount}
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
                            {new Date(
                              payment.createdAt
                            ).toLocaleDateString()}
                          </p>

                        </div>
                      </div>
                    )
                  )}

                </div>
              </div>
            )}

          {/* --------------------------------------------------------- */}
          {/* Refunds */}
          {/* --------------------------------------------------------- */}

          {order.refunds &&
            order.refunds.length > 0 && (
              <div className="rounded-lg bg-gray-50 p-6">
                <h2 className="mb-6 text-xl font-bold text-gray-900">
                  Refund Information
                </h2>

                <div className="space-y-4">

                  {order.refunds.map(
                    (refund: Refund) => (
                      <div
                        key={refund.id}
                        className="rounded-lg border border-gray-200 bg-white p-5"
                      >

                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                          <h3 className="text-lg font-medium text-gray-900">
                            Refund #
                            {refund.id.substring(0, 8)}
                          </h3>

                          <span
                            className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${
                              refund.status === "PAID"
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
                            Amount: ${refund.amount}
                          </p>

                          <p className="text-sm text-gray-500">
                            Reason:{" "}
                            {refund.reason || "-"}
                          </p>

                          <p className="text-sm text-gray-500">
                            Date:{" "}
                            {new Date(
                              refund.createdAt
                            ).toLocaleDateString()}
                          </p>

                        </div>
                      </div>
                    )
                  )}

                </div>
              </div>
            )}

          {/* --------------------------------------------------------- */}
          {/* Disputes */}
          {/* --------------------------------------------------------- */}

          {order.disputes &&
            order.disputes.length > 0 && (
              <div className="rounded-lg bg-gray-50 p-6">
                <h2 className="mb-6 text-xl font-bold text-gray-900">
                  Dispute Information
                </h2>

                <div className="space-y-4">

                  {order.disputes.map(
                    (dispute: Dispute) => (
                      <div
                        key={dispute.id}
                        className="rounded-lg border border-gray-200 bg-white p-5"
                      >

                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                          <h3 className="text-lg font-medium text-gray-900">
                            Dispute #
                            {dispute.id.substring(0, 8)}
                          </h3>

                          <span
                            className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${
                              dispute.status === "OPEN"
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
                            Reason:{" "}
                            {dispute.reason || "-"}
                          </p>

                          {dispute.description && (
                            <p className="text-sm text-gray-500">
                              Description:{" "}
                              {dispute.description}
                            </p>
                          )}

                          <p className="text-sm text-gray-500">
                            Date:{" "}
                            {new Date(
                              dispute.createdAt
                            ).toLocaleDateString()}
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
