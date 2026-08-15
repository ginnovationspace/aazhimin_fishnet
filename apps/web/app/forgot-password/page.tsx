"use client";

import apiClient from "@/lib/api";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaArrowLeft, FaEnvelope } from "react-icons/fa6";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      toast.error("Please enter your email address.");
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setError("Please enter a valid email address.");
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient.post("/api/auth/forgot-password", {
        email: normalizedEmail,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          data?.error ||
          "Unable to process your request. Please try again.";

        setError(message);
        toast.error(message);
        return;
      }

      /*
       * Do not reveal whether an account exists.
       * The API should return the same successful response
       * whether or not the email belongs to an account.
       */
      setSubmitted(true);
      toast.success("If an account exists, a reset link has been sent.");
    } catch (err) {
      console.error("Forgot password error:", err);

      const message =
        "Something went wrong. Please try again in a moment.";

      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="flex min-h-screen flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          {/* Header */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-sky-600 transition hover:text-sky-700"
            >
              fishnet Fishnet Marketplace
            </Link>

            <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Forgot your password?
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Enter the email address associated with your account and
              we&apos;ll send you a link to reset your password.
            </p>
          </div>

          {/* Card */}
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white px-6 py-8 shadow-sm sm:px-10">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Email address
                  </label>

                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <FaEnvelope className="h-4 w-4 text-gray-400" />
                    </div>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      autoFocus
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                      placeholder="you@example.com"
                      className="block w-full rounded-lg border-0 py-3 pl-10 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-sm"
                    />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-3"
                  >
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting
                    ? "Sending reset link..."
                    : "Send reset link"}
                </button>
              </form>
            ) : (
              /* Success */
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-50">
                  <FaEnvelope className="h-6 w-6 text-sky-600" />
                </div>

                <h2 className="mt-5 text-xl font-semibold text-gray-900">
                  Check your email
                </h2>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  If an account exists for{" "}
                  <span className="font-medium text-gray-900">
                    {email}
                  </span>
                  , you&apos;ll receive instructions to reset your password.
                </p>

                <p className="mt-3 text-xs leading-5 text-gray-500">
                  The email may take a few minutes to arrive. Please also
                  check your spam or junk folder.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setEmail("");
                    setError("");
                  }}
                  className="mt-6 text-sm font-semibold text-sky-600 hover:text-sky-700"
                >
                  Try another email
                </button>
              </div>
            )}

            {/* Login link */}
            <div className="mt-8 border-t border-gray-200 pt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 transition hover:text-sky-600"
              >
                <FaArrowLeft className="h-3.5 w-3.5" />
                Back to login
              </Link>
            </div>
          </div>

          {/* Register */}
          <p className="mt-8 text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-sky-600 hover:text-sky-700"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default ForgotPasswordPage;
