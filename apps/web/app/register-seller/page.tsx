"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api";
import { replaceClientSession, useSession } from "@/lib/auth-client";
import toast from "react-hot-toast";

interface SellerFormData {
  merchantName: string;
  merchantDescription: string;
  merchantPhone: string;
  merchantAddress: string;
}

const RegisterSellerPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [formData, setFormData] = useState<SellerFormData>({
    merchantName: "",
    merchantDescription: "",
    merchantPhone: "",
    merchantAddress: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?next=/register-seller");
    }

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    // Basic validation
    if (
      !formData.merchantName
    ) {
      toast.error(
        "Business name is required"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient.post("/api/seller/onboarding", {
        merchantName: formData.merchantName.trim(),
        merchantDescription: formData.merchantDescription.trim(),
        merchantPhone: formData.merchantPhone.trim(),
        merchantAddress: formData.merchantAddress.trim(),
      });

      if (response.ok) {
        const data = await response.json();
        replaceClientSession(data.token, data.user);
        toast.success(
          "Seller account created successfully!"
        );

        router.push("/seller");
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
            Add a seller profile to your existing fishnet account and start managing your fishnet listings.
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

        {status === "authenticated" && session?.user?.role === "BUYER" && <form
          className="space-y-8"
          onSubmit={handleSubmit}
        >
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
