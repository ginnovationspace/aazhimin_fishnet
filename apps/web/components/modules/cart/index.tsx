"use client";

import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { FaCheck, FaCircleQuestion, FaClock, FaXmark } from "react-icons/fa6";

import QuantityInputCart from "@/components/QuantityInputCart";
import { sanitize } from "@/lib/sanitize";
import {
  useCartProducts,
  useCartTotal,
  useProductStore,
} from "@/app/_zustand/store";

export const CartModule = () => {
  const products = useCartProducts();
  const removeFromCart = useProductStore((state) => state.removeFromCart);
  const total = useCartTotal();

  const groupedProducts = products.reduce(
    (acc, product) => {
      if (!acc[product.merchantId]) {
        acc[product.merchantId] = {
          sellerName: product.sellerName,
          items: [],
        };
      }

      acc[product.merchantId].items.push(product);

      return acc;
    },
    {} as Record<
      string,
      {
        sellerName: string;
        items: typeof products;
      }
    >
  );

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
    toast.success("Product removed from the cart");
  };

  const shipping = products.length > 0 ? 5 : 0;
  const tax = total > 0 ? total / 5 : 0;
  const orderTotal = total > 0 ? total + tax + shipping : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12">
        {/* Cart items */}
        <section
          aria-labelledby="cart-heading"
          className="lg:col-span-7"
        >
          <div className="mb-8">
            <h1
              id="cart-heading"
              className="text-2xl font-bold tracking-tight text-gray-900"
            >
              Items in your shopping cart
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Review your fishing net products before checkout.
            </p>
          </div>

          {Object.keys(groupedProducts).length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center">
              <p className="text-gray-600">
                Your cart is empty.
              </p>

              <Link
                href="/products"
                className="mt-5 inline-flex items-center rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Browse fishing nets
              </Link>
            </div>
          ) : (
            <>
              {Object.keys(groupedProducts).map((merchantId) => {
                const group = groupedProducts[merchantId];

                const sellerSubtotal = group.items.reduce(
                  (sum, item) => sum + item.price * item.amount,
                  0
                );

                return (
                  <div
                    key={merchantId}
                    className="mb-8 rounded-lg border border-gray-200 bg-white"
                  >
                    {/* Seller */}
                    <div className="border-b border-gray-200 px-5 py-4">
                      <h2 className="text-base font-semibold text-gray-900">
                        Seller: {sanitize(group.sellerName)}
                      </h2>
                    </div>

                    {/* Seller products */}
                    <ul
                      role="list"
                      className="divide-y divide-gray-200"
                    >
                      {group.items.map((product) => (
                        <li
                          key={product.id}
                          className="flex gap-4 p-5 sm:gap-6"
                        >
                          {/* Product image */}
                          <div className="flex-shrink-0">
                            <Image
                              width={192}
                              height={192}
                              src={
                                product.image
                                  ? `/${product.image}`
                                  : "/product_placeholder.jpg"
                              }
                              alt={sanitize(product.title)}
                              className="h-24 w-24 rounded-md object-cover sm:h-36 sm:w-36"
                            />
                          </div>

                          {/* Product details */}
                          <div className="flex min-w-0 flex-1 flex-col justify-between">
                            <div>
                              <div className="flex justify-between gap-4">
                                <div>
                                  <h3 className="text-sm font-medium text-gray-900">
                                    <Link
                                      href={`/products/${product.id}`}
                                      className="hover:text-blue-600"
                                    >
                                      {sanitize(product.title)}
                                    </Link>
                                  </h3>

                                  <p className="mt-2 text-sm font-semibold text-gray-900">
                                    ${product.price.toFixed(2)}
                                  </p>
                                </div>

                                {/* Remove */}
                                <button
                                  onClick={() =>
                                    handleRemoveItem(product.id)
                                  }
                                  type="button"
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600"
                                  aria-label={`Remove ${sanitize(
                                    product.title
                                  )}`}
                                >
                                  <FaXmark
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                  />
                                </button>
                              </div>

                              {/* Quantity */}
                              <div className="mt-4">
                                <QuantityInputCart product={product} />
                              </div>
                            </div>

                            {/* Stock */}
                            <p className="mt-4 flex items-center gap-2 text-sm text-gray-700">
                              <FaCheck
                                className="h-4 w-4 flex-shrink-0 text-green-500"
                                aria-hidden="true"
                              />

                              <span>In stock</span>
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>

                    {/* Seller subtotal */}
                    <div className="border-t border-gray-200 px-5 py-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-700">
                          Seller subtotal
                        </p>

                        <p className="text-sm font-semibold text-gray-900">
                          ${sellerSubtotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </section>

        {/* Order summary */}
        <section
          aria-labelledby="summary-heading"
          className="mt-10 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
        >
          <h2
            id="summary-heading"
            className="text-lg font-semibold text-gray-900"
          >
            Order summary
          </h2>

          <dl className="mt-6 space-y-4">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-600">
                Subtotal
              </dt>

              <dd className="text-sm font-medium text-gray-900">
                ${total.toFixed(2)}
              </dd>
            </div>

            {/* Shipping */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <dt className="flex items-center text-sm text-gray-600">
                <span>Shipping estimate</span>

                <span
                  className="ml-2 text-gray-400"
                  title="Shipping is calculated based on the order."
                >
                  <FaCircleQuestion
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </span>
              </dt>

              <dd className="text-sm font-medium text-gray-900">
                ${shipping.toFixed(2)}
              </dd>
            </div>

            {/* Tax */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <dt className="flex items-center text-sm text-gray-600">
                <span>Tax estimate</span>

                <span
                  className="ml-2 text-gray-400"
                  title="Estimated tax."
                >
                  <FaCircleQuestion
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </span>
              </dt>

              <dd className="text-sm font-medium text-gray-900">
                ${tax.toFixed(2)}
              </dd>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <dt className="text-base font-semibold text-gray-900">
                Order total
              </dt>

              <dd className="text-base font-semibold text-gray-900">
                ${orderTotal.toFixed(2)}
              </dd>
            </div>
          </dl>

          {/* Checkout */}
          {products.length > 0 && (
            <div className="mt-6">
              <Link
                href="/checkout"
                className="flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Proceed to checkout
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

