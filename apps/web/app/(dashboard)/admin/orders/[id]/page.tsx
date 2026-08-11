
// ============================================================
// ADMIN ORDER DETAILS
// apps/web/app/(dashboard)/admin/orders/[id]/page.tsx
// ============================================================

"use client";

import { DashboardSidebar } from "@/components";
import apiClient from "@/lib/api";
import {
  isValidEmailAddressFormat,
  isValidNameOrLastname,
} from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { sanitize } from "@/lib/sanitize";

interface OrderProduct {
  id: string;
  customerOrderId: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    slug: string;
    title: string;
    mainImage: string;
    price: number;
    rating: number;
    description: string;
    manufacturer: string;
    inStock: number;
    categoryId: string;
  };
}

interface Order {
  id: string;
  adress: string;
  apartment: string;
  company: string;
  dateTime: string;
  email: string;
  lastname: string;
  name: string;
  phone: string;
  postalCode: string;
  city: string;
  country: string;
  orderNotice: string;
  status: "processing" | "delivered" | "canceled";
  total: number;
}

const AdminSingleOrder = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const orderId = params.id;

  const [orderProducts, setOrderProducts] = useState<
    OrderProduct[]
  >([]);

  const [order, setOrder] = useState<Order>({
    id: "",
    adress: "",
    apartment: "",
    company: "",
    dateTime: "",
    email: "",
    lastname: "",
    name: "",
    phone: "",
    postalCode: "",
    city: "",
    country: "",
    orderNotice: "",
    status: "processing",
    total: 0,
  });

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const response = await apiClient.get(
          `/api/orders/${orderId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch order");
        }

        const data: Order = await response.json();

        setOrder(data);
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("There was an error while loading the order");
      }
    };

    const fetchOrderProducts = async () => {
      try {
        const response = await apiClient.get(
          `/api/order-product/${orderId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch order products");
        }

        const data: OrderProduct[] = await response.json();

        setOrderProducts(data);
      } catch (error) {
        console.error(
          "Error fetching order products:",
          error
        );

        toast.error(
          "There was an error while loading order products"
        );
      }
    };

    if (orderId) {
      void fetchOrderData();
      void fetchOrderProducts();
    }
  }, [orderId]);

  const updateOrder = async () => {
    if (
      !order.name.trim() ||
      !order.lastname.trim() ||
      !order.phone.trim() ||
      !order.email.trim() ||
      !order.adress.trim() ||
      !order.city.trim() ||
      !order.country.trim() ||
      !order.postalCode.trim()
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!isValidNameOrLastname(order.name)) {
      toast.error("You entered invalid name format");
      return;
    }

    if (!isValidNameOrLastname(order.lastname)) {
      toast.error("You entered invalid lastname format");
      return;
    }

    if (!isValidEmailAddressFormat(order.email)) {
      toast.error("You entered invalid email format");
      return;
    }

    try {
      const response = await apiClient.put(
        `/api/orders/${order.id}`,
        order
      );

      if (!response.ok) {
        let message =
          "There was an error while updating the order";

        try {
          const data = await response.json();

          if (data?.error) {
            message = data.error;
          }
        } catch {
          // Response may not contain JSON.
        }

        throw new Error(message);
      }

      toast.success("Order updated successfully");
    } catch (error) {
      console.error("Error updating order:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "There was an error while updating the order"
      );
    }
  };

  const deleteOrder = async () => {
    if (!order.id) {
      toast.error("Order ID is missing");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this order?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const productResponse = await apiClient.delete(
        `/api/order-product/${order.id}`
      );

      if (
        !productResponse.ok &&
        productResponse.status !== 404
      ) {
        throw new Error(
          "There was an error while deleting order products"
        );
      }

      const orderResponse = await apiClient.delete(
        `/api/orders/${order.id}`
      );

      if (!orderResponse.ok) {
        throw new Error(
          "There was an error while deleting the order"
        );
      }

      toast.success("Order deleted successfully");

      router.push("/admin/orders");
    } catch (error) {
      console.error("Error deleting order:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "There was an error while deleting the order"
      );
    }
  };

  return (
    <div className="mx-auto flex max-w-screen-2xl justify-start bg-white xl:h-full max-xl:flex-col max-xl:gap-y-5">
      <DashboardSidebar />

      <div className="flex w-full flex-col gap-y-7 xl:ml-5 max-xl:px-5">
        <h1 className="text-3xl font-semibold">
          Order details
        </h1>

        <div className="mt-5">
          <div>
            <span className="text-xl font-bold">
              Order ID:
            </span>

            <span className="text-base">
              {" "}
              {order.id}
            </span>
          </div>
        </div>

        <div className="flex gap-x-2 max-sm:flex-col">
          <div>
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Name:</span>
              </div>

              <input
                type="text"
                className="input input-bordered w-full max-w-xs"
                value={order.name}
                onChange={(e) =>
                  setOrder({
                    ...order,
                    name: e.target.value,
                  })
                }
              />
            </label>
          </div>

          <div>
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">
                  Lastname:
                </span>
              </div>

              <input
                type="text"
                className="input input-bordered w-full max-w-xs"
                value={order.lastname}
                onChange={(e) =>
                  setOrder({
                    ...order,
                    lastname: e.target.value,
                  })
                }
              />
            </label>
          </div>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">
                Phone number:
              </span>
            </div>

            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={order.phone}
              onChange={(e) =>
                setOrder({
                  ...order,
                  phone: e.target.value,
                })
              }
            />
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">
                Email address:
              </span>
            </div>

            <input
              type="email"
              className="input input-bordered w-full max-w-xs"
              value={order.email}
              onChange={(e) =>
                setOrder({
                  ...order,
                  email: e.target.value,
                })
              }
            />
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">
                Company (optional):
              </span>
            </div>

            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={order.company}
              onChange={(e) =>
                setOrder({
                  ...order,
                  company: e.target.value,
                })
              }
            />
          </label>
        </div>

        <div className="flex gap-x-2 max-sm:flex-col">
          <div>
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">
                  Address:
                </span>
              </div>

              <input
                type="text"
                className="input input-bordered w-full max-w-xs"
                value={order.adress}
                onChange={(e) =>
                  setOrder({
                    ...order,
                    adress: e.target.value,
                  })
                }
              />
            </label>
          </div>

          <div>
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">
                  Apartment, suite, etc.:
                </span>
              </div>

              <input
                type="text"
                className="input input-bordered w-full max-w-xs"
                value={order.apartment}
                onChange={(e) =>
                  setOrder({
                    ...order,
                    apartment: e.target.value,
                  })
                }
              />
            </label>
          </div>
        </div>

        <div className="flex gap-x-2 max-sm:flex-col">
          <div>
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">City:</span>
              </div>

              <input
                type="text"
                className="input input-bordered w-full max-w-xs"
                value={order.city}
                onChange={(e) =>
                  setOrder({
                    ...order,
                    city: e.target.value,
                  })
                }
              />
            </label>
          </div>

          <div>
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">
                  Country:
                </span>
              </div>

              <input
                type="text"
                className="input input-bordered w-full max-w-xs"
                value={order.country}
                onChange={(e) =>
                  setOrder({
                    ...order,
                    country: e.target.value,
                  })
                }
              />
            </label>
          </div>

          <div>
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">
                  Postal Code:
                </span>
              </div>

              <input
                type="text"
                className="input input-bordered w-full max-w-xs"
                value={order.postalCode}
                onChange={(e) =>
                  setOrder({
                    ...order,
                    postalCode: e.target.value,
                  })
                }
              />
            </label>
          </div>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">
                Order status
              </span>
            </div>

            <select
              className="select select-bordered"
              value={order.status}
              onChange={(e) =>
                setOrder({
                  ...order,
                  status: e.target.value as Order["status"],
                })
              }
            >
              <option value="processing">
                Processing
              </option>

              <option value="delivered">
                Delivered
              </option>

              <option value="canceled">
                Canceled
              </option>
            </select>
          </label>
        </div>

        <div>
          <label className="form-control">
            <div className="label">
              <span className="label-text">
                Order notice:
              </span>
            </div>

            <textarea
              className="textarea textarea-bordered h-24"
              value={order.orderNotice || ""}
              onChange={(e) =>
                setOrder({
                  ...order,
                  orderNotice: e.target.value,
                })
              }
            />
          </label>
        </div>

        <div>
          {orderProducts.map((product) => (
            <div
              className="flex items-center gap-x-4"
              key={product.id}
            >
              <Image
                src={
                  product.product.mainImage
                    ? `/${product.product.mainImage}`
                    : "/product_placeholder.jpg"
                }
                alt={sanitize(product.product.title)}
                width={50}
                height={50}
                className="h-auto w-auto"
              />

              <div>
                <Link
                  href={`/product/${product.product.slug}`}
                >
                  {sanitize(product.product.title)}
                </Link>

                <p>
                  ${product.product.price} *{" "}
                  {product.quantity} items
                </p>
              </div>
            </div>
          ))}

          <div className="mt-10 flex flex-col gap-y-2">
            <p className="text-2xl">
              Subtotal: ${order.total.toFixed(2)}
            </p>

            <p className="text-2xl">
              Tax 20%: ${(order.total / 5).toFixed(2)}
            </p>

            <p className="text-2xl">
              Shipping: $5.00
            </p>

            <p className="text-3xl font-semibold">
              Total: $
              {(
                order.total +
                order.total / 5 +
                5
              ).toFixed(2)}
            </p>
          </div>

          <div className="mt-5 flex gap-x-2 max-sm:flex-col">
            <button
              type="button"
              className="border border-gray-300 bg-blue-500 px-10 py-5 text-lg font-bold uppercase text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2"
              onClick={() => void updateOrder()}
            >
              Update order
            </button>

            <button
              type="button"
              className="border border-gray-300 bg-red-600 px-10 py-5 text-lg font-bold uppercase text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2"
              onClick={() => void deleteOrder()}
            >
              Delete order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSingleOrder;