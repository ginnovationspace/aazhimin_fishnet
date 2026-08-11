"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import apiClient from "@/lib/api";

interface Order {
  id: string;
  name: string;
  country: string;
  status: string;
  total: number;
  dateTime: string;
}

interface OrdersResponse {
  orders?: Order[];
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get("/api/orders");

        if (!response.ok) {
          throw new Error(
            `Failed to fetch orders: ${response.status} ${response.statusText}`
          );
        }

        const data: OrdersResponse = await response.json();

        setOrders(data.orders ?? []);
      } catch (error) {
        console.error("Failed to fetch orders:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load orders"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="w-full">
      <div className="rounded-xl bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-5">
          <h1 className="text-xl font-semibold text-gray-900">
            All orders
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage and review customer orders.
          </p>
        </div>

        {loading && (
          <div className="px-6 py-10 text-center text-sm text-gray-500">
            Loading orders...
          </div>
        )}

        {!loading && error && (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-red-600">
              {error}
            </p>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-gray-500">
              No orders found.
            </p>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-600">
                  <th className="px-6 py-4 font-medium">
                    Order ID
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Name and country
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Status
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Total
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Date
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50"
                  >
                    {/* Order ID */}
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">
                        #{order.id}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.name}
                        </p>

                        <p className="text-sm text-gray-500">
                          {order.country}
                        </p>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                        {order.status}
                      </span>
                    </td>

                    {/* Total */}
                    <td className="px-6 py-4 font-medium text-gray-900">
                      ${Number(order.total).toFixed(2)}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-gray-600">
                      {order.dateTime
                        ? new Date(order.dateTime).toLocaleDateString()
                        : "—"}
                    </td>

                    {/* Details */}
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        View details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr className="border-t border-gray-200 bg-gray-50">
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-sm text-gray-500"
                  >
                    {orders.length}{" "}
                    {orders.length === 1 ? "order" : "orders"} total
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;

