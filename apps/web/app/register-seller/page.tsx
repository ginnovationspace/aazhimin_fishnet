"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api";
import config from "@/lib/config";
import { replaceClientSession, useSession } from "@/lib/auth-client";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";

interface SellerFormData {
  email: string;
  password: string;
  confirmPassword: string;
  merchantName: string;
  merchantDescription: string;
  merchantPhone: string;
  merchantAddress: string;
}

const RegisterSellerPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [formData, setFormData] = useState<SellerFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    merchantName: "",
    merchantDescription: "",
    merchantPhone: "",
    merchantAddress: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (session?.user?.role === "SELLER") {
      router.replace("/seller");
    }
  }, [router, session?.user?.role, status]);

  const handleChange = (
    field: keyof SellerFormData,
    value: string
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleGoogleSellerSignUp = () => {
    const params = new URLSearchParams({ next: "/register-seller" });
    window.location.assign(`${config.apiBaseUrl}/api/auth/oauth/google/start?${params.toString()}`);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!formData.merchantName.trim()) {
      toast.error("Business name is required");
      return;
    }

    if (status === "unauthenticated") {
      if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        toast.error("Enter a valid email address");
        return;
      }
      if (formData.password.length < 8) {
        toast.error("Password must be at least 8 characters long");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const sellerDetails = {
        merchantName: formData.merchantName.trim(),
        merchantDescription: formData.merchantDescription.trim(),
        merchantPhone: formData.merchantPhone.trim(),
        merchantAddress: formData.merchantAddress.trim(),
      };
      const response = await apiClient.post(
        status === "authenticated" ? "/api/seller/onboarding" : "/api/seller/register",
        status === "authenticated"
          ? sellerDetails
          : { ...sellerDetails, email: formData.email.trim(), password: formData.password }
      );

      if (response.ok) {
        const data = await response.json();
        replaceClientSession(data.token, data.user);
        toast.success(
          "Seller account created successfully!"
        );

        window.location.assign("/seller");
        return;
      }

      const errorData = await response.json();

      toast.error(
        errorData?.error || "Registration failed"
      );
    } catch (err) {
      console.error("Seller registration error:", err);

      toast.error(
        "Registration failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-4xl lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Become a Fishnet Seller
          </h1>

          <p className="mt-4 max-w-3xl text-lg text-gray-600">
            Create your seller account and store profile, then start adding products immediately.
          </p>

        {status === "authenticated" && session?.user?.email && (
            <p className="mt-3 text-sm text-sky-700">
              Applying as {session.user.email}
            </p>
          )}
        </div>

        {status === "loading" && (
          <p className="text-sm text-gray-600">Checking your account...</p>
        )}

        {status !== "loading" && (status === "unauthenticated" || session?.user?.role === "BUYER") && <form
          className="space-y-8"
          onSubmit={handleSubmit}
        >
          {status === "unauthenticated" && (
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">Seller account access</h2>
              <p className="mt-1 text-sm text-gray-500">This creates a seller account, not a buyer account.</p>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">Email address *</label>
                  <input id="email" type="email" autoComplete="email" required value={formData.email} onChange={(e) => handleChange("email", e.target.value)} disabled={isSubmitting} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 sm:text-sm" />
                </div>
                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">Password *</label>
                  <input id="password" type="password" autoComplete="new-password" required minLength={8} value={formData.password} onChange={(e) => handleChange("password", e.target.value)} disabled={isSubmitting} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 sm:text-sm" />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-700">Confirm password *</label>
                  <input id="confirmPassword" type="password" autoComplete="new-password" required minLength={8} value={formData.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)} disabled={isSubmitting} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 sm:text-sm" />
                </div>
              </div>
              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center"><span className="bg-white px-3 text-sm text-gray-500">or</span></div>
              </div>
              <button type="button" onClick={handleGoogleSellerSignUp} className="mt-5 flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 px-4 py-3 text-sm font-medium text-gray-800 transition hover:bg-gray-50">
                <FcGoogle className="h-5 w-5" /> Continue with Google
              </button>
              <p className="mt-3 text-center text-xs text-gray-500">Google creates a buyer account first; your seller account is created only after you submit the business details below.</p>
            </section>
          )}

          {/* Merchant Information */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              Seller Business Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Provide information about your fishing-net
              business.
            </p>

            <div className="mt-6 space-y-6">
              {/* Merchant Name */}
              <div>
                <label
                  htmlFor="merchantName"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Business Name *
                </label>

                <input
                  id="merchantName"
                  name="merchantName"
                  type="text"
                  autoComplete="organization"
                  required
                  value={formData.merchantName}
                  onChange={(e) =>
                    handleChange(
                      "merchantName",
                      e.target.value
                    )
                  }
                  disabled={isSubmitting}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="merchantDescription"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Merchant Description
                </label>

                <textarea
                  id="merchantDescription"
                  name="merchantDescription"
                  rows={3}
                  value={formData.merchantDescription}
                  onChange={(e) =>
                    handleChange(
                      "merchantDescription",
                      e.target.value
                    )
                  }
                  disabled={isSubmitting}
                  placeholder="Tell buyers about your fishing-net business..."
                  className="block w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-sm"
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="merchantPhone"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Merchant Phone
                </label>

                <input
                  id="merchantPhone"
                  name="merchantPhone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.merchantPhone}
                  onChange={(e) =>
                    handleChange(
                      "merchantPhone",
                      e.target.value
                    )
                  }
                  disabled={isSubmitting}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-sm"
                />
              </div>

              {/* Address */}
              <div>
                <label
                  htmlFor="merchantAddress"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Merchant Address
                </label>

                <textarea
                  id="merchantAddress"
                  name="merchantAddress"
                  rows={3}
                  autoComplete="street-address"
                  value={formData.merchantAddress}
                  onChange={(e) =>
                    handleChange(
                      "merchantAddress",
                      e.target.value
                    )
                  }
                  disabled={isSubmitting}
                  placeholder="Enter your business address..."
                  className="block w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-sm"
                />
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-4 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => router.push("/")}
              disabled={isSubmitting}
              className="text-sm font-medium text-gray-600 transition hover:text-blue-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-blue-600 px-6 py-3 font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Submitting..."
                : "Create seller account"}
            </button>
          </div>
        </form>}
      </div>
    </div>
  );
};

export default RegisterSellerPage;
