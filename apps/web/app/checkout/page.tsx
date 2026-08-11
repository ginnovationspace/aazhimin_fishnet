"use client";

import { useProductStore } from "../_zustand/store";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useSession } from "@/lib/auth-client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api";
import { loadStripe, type Stripe } from "@stripe/stripe-js";

type CheckoutProduct = {
  id: string;
  title: string;
  price: number | string;
  amount: number;
  mainImage?: string | null;
};

type CheckoutForm = {
  name: string;
  lastname: string;
  phone: string;
  email: string;
  company: string;
  adress: string;
  apartment: string;
  city: string;
  country: string;
  postalCode: string;
  orderNotice: string;
  paymentMethod: string;
};

type PaymentIntentResponse = {
  clientSecret?: string;
  error?: string;
  message?: string;
};

const SHIPPING_COST = 5;
const TAX_RATE = 0.2;

const CheckoutPage = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const [checkoutForm, setCheckoutForm] = useState<CheckoutForm>({
    name: "",
    lastname: "",
    phone: "",
    email: "",
    company: "",
    adress: "",
    apartment: "",
    city: "",
    country: "",
    postalCode: "",
    orderNotice: "",
    paymentMethod: "card",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const { products, clearCart } = useProductStore();

  /**
   * The existing Zustand ProductInCart type does not currently
   * expose mainImage, but products returned from the application
   * can contain it.
   */
  const checkoutProducts =
    products as unknown as CheckoutProduct[];

  /**
   * Cart subtotal.
   */
  const subtotal = checkoutProducts.reduce(
    (sum, product) =>
      sum +
      Number(product.price) * Number(product.amount),
    0
  );

  /**
   * Tax.
   */
  const tax = subtotal * TAX_RATE;

  /**
   * Final checkout amount.
   */
  const total =
    subtotal + tax + SHIPPING_COST;

  /**
   * Stripe instance.
   */
  const stripePromise = useRef<Promise<Stripe | null> | null>(
    null
  );

  /**
   * Initialize Stripe on the client.
   */
  useEffect(() => {
    const publishableKey =
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      console.warn(
        "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured"
      );
      return;
    }

    stripePromise.current =
      loadStripe(publishableKey);
  }, []);

  /**
   * Populate checkout email from the authenticated session.
   *
   * Capture the email first so TypeScript knows that it exists.
   */
  useEffect(() => {
    const email = session?.user?.email;

    if (!email) {
      return;
    }

    setCheckoutForm((previous) => ({
      ...previous,
      email,
    }));
  }, [session?.user?.email]);

  /**
   * Initialize Stripe PaymentIntent.
   */
  const initializePayment = async () => {
    if (checkoutProducts.length === 0) {
      toast.error("Your cart is empty");
      return null;
    }

    try {
      setPaymentError(null);
      setPaymentProcessing(true);

      const response = await apiClient.post(
        "/api/payment/create-payment-intent",
        {
          amount: Math.round(total * 100),
          currency: "usd",
          metadata: {
            email: checkoutForm.email,
          },
        }
      );

      const data =
        (await response
          .json()
          .catch(() => null)) as PaymentIntentResponse | null;

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Unable to initialize payment"
        );
      }

      if (!data?.clientSecret) {
        throw new Error(
          "Payment client secret was not returned"
        );
      }

      setClientSecret(data.clientSecret);

      return data.clientSecret;
    } catch (error) {
      console.error(
        "Payment initialization error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Unable to initialize payment";

      setPaymentError(message);
      toast.error(message);

      return null;
    } finally {
      setPaymentProcessing(false);
    }
  };

  /**
   * Validate checkout fields.
   */
  const validateCheckoutForm = (): boolean => {
    const requiredFields: Array<
      [string, string]
    > = [
      ["Name", checkoutForm.name],
      ["Lastname", checkoutForm.lastname],
      ["Phone", checkoutForm.phone],
      ["Email", checkoutForm.email],
      ["Address", checkoutForm.adress],
      ["City", checkoutForm.city],
      ["Country", checkoutForm.country],
      ["Postal Code", checkoutForm.postalCode],
    ];

    for (const [label, value] of requiredFields) {
      if (!value.trim()) {
        toast.error(`${label} is required`);
        return false;
      }
    }

    return true;
  };

  /**
   * Create the order.
   */
  const createOrder = async (): Promise<boolean> => {
    if (!validateCheckoutForm()) {
      return false;
    }

    if (checkoutProducts.length === 0) {
      toast.error("Your cart is empty");
      return false;
    }

    try {
      setIsSubmitting(true);

      const orderData = {
        ...checkoutForm,
        total,
        subtotal,
        tax,
        shipping: SHIPPING_COST,
        products: checkoutProducts.map(
          (product) => ({
            productId: product.id,
            quantity: product.amount,
            price: Number(product.price),
          })
        ),
      };

      const response = await apiClient.post(
        "/api/orders",
        orderData
      );

      const data =
        await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Unable to create order"
        );
      }

      return true;
    } catch (error) {
      console.error(
        "Order creation error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Unable to create order";

      toast.error(message);

      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Reset checkout state and cart.
   */
  const clearFormAndCart = () => {
    setCheckoutForm({
      name: "",
      lastname: "",
      phone: "",
      email: "",
      company: "",
      adress: "",
      apartment: "",
      city: "",
      country: "",
      postalCode: "",
      orderNotice: "",
      paymentMethod: "card",
    });

    setClientSecret(null);
    setPaymentError(null);

    clearCart();
  };

  /**
   * Main checkout handler.
   */
  const handleCheckout = async () => {
    if (!validateCheckoutForm()) {
      return;
    }

    if (checkoutProducts.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    /**
     * Card payment.
     */
    if (checkoutForm.paymentMethod === "card") {
      const secret =
        clientSecret ||
        (await initializePayment());

      if (!secret) {
        return;
      }

      try {
        setPaymentProcessing(true);

        const stripe =
          await stripePromise.current;

        if (!stripe) {
          throw new Error(
            "Stripe could not be initialized"
          );
        }

        const result =
          await stripe.confirmPayment({
            clientSecret: secret,
            redirect: "if_required",
          });

        if (result.error) {
          throw new Error(
            result.error.message ||
              "Payment failed"
          );
        }

        const paymentIntent =
          result.paymentIntent;

        if (
          paymentIntent &&
          paymentIntent.status !== "succeeded"
        ) {
          throw new Error(
            `Payment was not completed. Status: ${paymentIntent.status}`
          );
        }

        const orderCreated =
          await createOrder();

        if (!orderCreated) {
          return;
        }

        toast.success(
          "Payment and order completed successfully"
        );

        clearFormAndCart();

        router.push("/order-success");
      } catch (error) {
        console.error(
          "Checkout payment error:",
          error
        );

        const message =
          error instanceof Error
            ? error.message
            : "Payment failed";

        setPaymentError(message);
        toast.error(message);
      } finally {
        setPaymentProcessing(false);
      }

      return;
    }

    /**
     * Non-card payment methods.
     *
     * These currently create the order directly.
     * The actual UPI/GPay payment integration should
     * be implemented in the backend/payment provider
     * before using these methods in production.
     */
    const orderCreated =
      await createOrder();

    if (!orderCreated) {
      return;
    }

    toast.success("Order placed successfully");

    clearFormAndCart();

    router.push("/order-success");
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-5 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-10">

        {/* Checkout form */}
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-y-6">

            <h2 className="text-2xl font-semibold">
              Billing details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* First name */}
              <div>
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">
                      First name
                    </span>
                  </div>

                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={checkoutForm.name}
                    onChange={(e) =>
                      setCheckoutForm({
                        ...checkoutForm,
                        name: e.target.value,
                      })
                    }
                  />
                </label>
              </div>

              {/* Last name */}
              <div>
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">
                      Last name
                    </span>
                  </div>

                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={checkoutForm.lastname}
                    onChange={(e) =>
                      setCheckoutForm({
                        ...checkoutForm,
                        lastname: e.target.value,
                      })
                    }
                  />
                </label>
              </div>

              {/* Phone */}
              <div>
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">
                      Phone
                    </span>
                  </div>

                  <input
                    type="tel"
                    className="input input-bordered w-full"
                    value={checkoutForm.phone}
                    onChange={(e) =>
                      setCheckoutForm({
                        ...checkoutForm,
                        phone: e.target.value,
                      })
                    }
                  />
                </label>
              </div>

              {/* Email */}
              <div>
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">
                      Email
                    </span>
                  </div>

                  <input
                    type="email"
                    className="input input-bordered w-full"
                    value={checkoutForm.email}
                    onChange={(e) =>
                      setCheckoutForm({
                        ...checkoutForm,
                        email: e.target.value,
                      })
                    }
                  />
                </label>
              </div>

              {/* Company */}
              <div>
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">
                      Company
                    </span>
                  </div>

                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={checkoutForm.company}
                    onChange={(e) =>
                      setCheckoutForm({
                        ...checkoutForm,
                        company: e.target.value,
                      })
                    }
                  />
                </label>
              </div>

              {/* Address */}
              <div>
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">
                      Address
                    </span>
                  </div>

                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={checkoutForm.adress}
                    onChange={(e) =>
                      setCheckoutForm({
                        ...checkoutForm,
                        adress: e.target.value,
                      })
                    }
                  />
                </label>
              </div>

              {/* Apartment */}
              <div>
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">
                      Apartment, suite, etc.
                    </span>
                  </div>

                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={checkoutForm.apartment}
                    onChange={(e) =>
                      setCheckoutForm({
                        ...checkoutForm,
                        apartment: e.target.value,
                      })
                    }
                  />
                </label>
              </div>

              {/* City */}
              <div>
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">
                      City
                    </span>
                  </div>

                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={checkoutForm.city}
                    onChange={(e) =>
                      setCheckoutForm({
                        ...checkoutForm,
                        city: e.target.value,
                      })
                    }
                  />
                </label>
              </div>

              {/* Country */}
              <div>
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">
                      Country
                    </span>
                  </div>

                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={checkoutForm.country}
                    onChange={(e) =>
                      setCheckoutForm({
                        ...checkoutForm,
                        country: e.target.value,
                      })
                    }
                  />
                </label>
              </div>

              {/* Postal code */}
              <div>
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">
                      Postal code
                    </span>
                  </div>

                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={checkoutForm.postalCode}
                    onChange={(e) =>
                      setCheckoutForm({
                        ...checkoutForm,
                        postalCode: e.target.value,
                      })
                    }
                  />
                </label>
              </div>
            </div>

            {/* Order notice */}
            <div>
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text">
                    Order notice
                  </span>
                </div>

                <textarea
                  className="textarea textarea-bordered h-32"
                  value={checkoutForm.orderNotice}
                  onChange={(e) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      orderNotice: e.target.value,
                    })
                  }
                />
              </label>
            </div>

            {/* Payment method */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">
                Payment method
              </h2>

              <div className="flex flex-col gap-y-3">

                {/* Card */}
                <label className="flex items-center gap-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    className="radio"
                    checked={
                      checkoutForm.paymentMethod ===
                      "card"
                    }
                    onChange={(e) =>
                      setCheckoutForm({
                        ...checkoutForm,
                        paymentMethod:
                          e.target.value,
                      })
                    }
                  />

                  <span>
                    Credit / Debit Card
                  </span>
                </label>

                {/* UPI */}
                <label className="flex items-center gap-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    className="radio"
                    checked={
                      checkoutForm.paymentMethod ===
                      "upi"
                    }
                    onChange={(e) =>
                      setCheckoutForm({
                        ...checkoutForm,
                        paymentMethod:
                          e.target.value,
                      })
                    }
                  />

                  <span>UPI</span>
                </label>

                {/* Google Pay */}
                <label className="flex items-center gap-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="gpay"
                    className="radio"
                    checked={
                      checkoutForm.paymentMethod ===
                      "gpay"
                    }
                    onChange={(e) =>
                      setCheckoutForm({
                        ...checkoutForm,
                        paymentMethod:
                          e.target.value,
                      })
                    }
                  />

                  <span>Google Pay</span>
                </label>
              </div>
            </div>

            {/* Payment error */}
            {paymentError && (
              <div className="alert alert-error">
                <span>{paymentError}</span>
              </div>
            )}

            {/* Submit */}
            <div>
              <button
                type="button"
                disabled={
                  isSubmitting ||
                  paymentProcessing ||
                  checkoutProducts.length === 0
                }
                onClick={handleCheckout}
                className="uppercase bg-blue-500 px-10 py-5 text-lg border border-gray-300 font-bold text-white shadow-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paymentProcessing
                  ? "Processing payment..."
                  : isSubmitting
                    ? "Creating order..."
                    : "Place order"}
              </button>
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div>
          <div className="border border-gray-300 p-6">

            <h2 className="text-2xl font-semibold mb-6">
              Your order
            </h2>

            <div className="flex flex-col gap-y-5">

              {checkoutProducts.length === 0 ? (
                <p>Your cart is empty.</p>
              ) : (
                checkoutProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between gap-x-4"
                  >
                    <div className="flex items-center gap-x-3">

                      <Image
                        src={
                          product.mainImage
                            ? `/${product.mainImage}`
                            : "/product_placeholder.jpg"
                        }
                        alt={product.title}
                        width={60}
                        height={60}
                        className="w-[60px] h-[60px] object-cover"
                      />

                      <div>
                        <p className="font-semibold">
                          {product.title}
                        </p>

                        <p className="text-sm text-gray-500">
                          {product.amount} × $
                          {Number(
                            product.price
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <p className="font-semibold">
                      $
                      {(
                        Number(product.price) *
                        Number(product.amount)
                      ).toFixed(2)}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Totals */}
            <div className="border-t border-gray-300 mt-6 pt-6 flex flex-col gap-y-3">

              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Tax</span>
                <span>
                  ${tax.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  ${SHIPPING_COST.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-2xl font-bold border-t border-gray-300 pt-4">
                <span>Total</span>

                <span>
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;
