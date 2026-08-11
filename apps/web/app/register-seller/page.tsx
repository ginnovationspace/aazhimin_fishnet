"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api";
import toast from "react-hot-toast";

interface SellerFormData {
  email: string;
  password: string;
  confirmPassword: string;
  merchantName: string;
  merchantDescription: string;
  merchantPhone: string;
  merchantAddress: string;
  verificationDocuments: string[];
}

const RegisterSellerPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<SellerFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    merchantName: "",
    merchantDescription: "",
    merchantPhone: "",
    merchantAddress: "",
    verificationDocuments: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    field: keyof Omit<SellerFormData, "verificationDocuments">,
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
      !formData.email ||
      !formData.password ||
      !formData.merchantName
    ) {
      toast.error(
        "Email, password, and merchant name are required"
      );
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient.post("/api/seller/register", {
        email: formData.email.trim(),
        password: formData.password,
        merchantName: formData.merchantName.trim(),
        merchantDescription: formData.merchantDescription.trim(),
        merchantPhone: formData.merchantPhone.trim(),
        merchantAddress: formData.merchantAddress.trim(),
        verificationDocuments: formData.verificationDocuments,
      });

      if (response.ok) {
        toast.success(
          "Seller registration submitted successfully! Awaiting approval."
        );

        router.push("/login");
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
            Register as a Fishnet Seller
          </h1>

          <p className="mt-4 max-w-3xl text-lg text-gray-600">
            Join Aazhimin as a fishing-net seller. Fill in the
            details below to get started selling your fishnets.
          </p>
        </div>

        <form
          className="space-y-8"
          onSubmit={handleSubmit}
        >
          {/* Account Information */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              Account Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Create the account you will use to manage your
              seller business.
            </p>

            <div className="mt-6 space-y-6">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Email address *
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    handleChange("email", e.target.value)
                  }
                  disabled={isSubmitting}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-sm"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Password *
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) =>
                    handleChange("password", e.target.value)
                  }
                  disabled={isSubmitting}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-sm"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 8 characters.
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Confirm Password *
                </label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleChange(
                      "confirmPassword",
                      e.target.value
                    )
                  }
                  disabled={isSubmitting}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-sm"
                />
              </div>
            </div>
          </section>

          {/* Merchant Information */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              Merchant Information
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
                  Merchant Name *
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

          {/* Verification Documents */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              Verification Documents
              <span className="ml-2 text-sm font-normal text-gray-500">
                Optional
              </span>
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              You can upload verification documents now or
              later from your seller dashboard. These documents
              help verify your fishing-net business.
            </p>

            <div className="mt-6">
              <label
                htmlFor="verificationDocuments"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Upload Documents
              </label>

              <input
                id="verificationDocuments"
                name="verificationDocuments"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                disabled={isSubmitting}
                onChange={(e) => {
                  if (!e.target.files) {
                    return;
                  }

                  const files = Array.from(e.target.files).map(
                    (file) => file.name
                  );

                  setFormData((previous) => ({
                    ...previous,
                    verificationDocuments: files,
                  }));
                }}
                className="block w-full cursor-pointer rounded-md border border-gray-300 bg-white text-sm text-gray-500 file:mr-4 file:cursor-pointer file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100 disabled:cursor-not-allowed"
              />

              {formData.verificationDocuments.length > 0 && (
                <div className="mt-3 rounded-md bg-gray-50 p-3">
                  <p className="text-sm font-medium text-gray-700">
                    Selected documents:
                  </p>

                  <ul className="mt-2 space-y-1">
                    {formData.verificationDocuments.map(
                      (fileName) => (
                        <li
                          key={fileName}
                          className="text-sm text-gray-500"
                        >
                          {fileName}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-4 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => router.push("/login")}
              disabled={isSubmitting}
              className="text-sm font-medium text-gray-600 transition hover:text-blue-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              Already have an account? Login
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-blue-600 px-6 py-3 font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Submitting..."
                : "Submit Registration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterSellerPage;
