"use client";

import Link from "next/link";
import React, { useState } from "react";
import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa6";

type NewsletterStatus = "success" | "error" | null;

const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] =
    useState<NewsletterStatus>(null);

  const handleNewsletterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const email = newsletterEmail.trim();

    if (!email || !email.includes("@")) {
      setNewsletterStatus("error");

      setTimeout(() => {
        setNewsletterStatus(null);
      }, 3000);

      return;
    }

    setNewsletterStatus("success");
    setNewsletterEmail("");

    setTimeout(() => {
      setNewsletterStatus(null);
    }, 3000);
  };

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Main footer */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="text-2xl font-bold tracking-tight text-sky-700"
            >
              Aazhimin
            </Link>

            <p className="mt-4 max-w-md text-sm leading-6 text-slate-600">
              A specialized marketplace for fishnets and fishing equipment,
              connecting buyers and sellers.
            </p>

            <p className="mt-3 text-sm text-slate-500">
              Discover, compare, and purchase fishnets from trusted sellers.
            </p>

            {/* Social links */}
            <div className="mt-6 flex items-center gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-sky-500 hover:text-sky-600"
              >
                <FaFacebook />
              </a>

              <a
                href="#"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-sky-500 hover:text-sky-600"
              >
                <FaInstagram />
              </a>

              <a
                href="#"
                aria-label="YouTube"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-sky-500 hover:text-sky-600"
              >
                <FaYoutube />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Shop
            </h3>

            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/products"
                  className="text-sm text-slate-600 transition hover:text-sky-600"
                >
                  All Fishnets
                </Link>
              </li>

              <li>
                <Link
                  href="/categories"
                  className="text-sm text-slate-600 transition hover:text-sky-600"
                >
                  Categories
                </Link>
              </li>

              <li>
                <Link
                  href="/cart"
                  className="text-sm text-slate-600 transition hover:text-sky-600"
                >
                  Cart
                </Link>
              </li>

              <li>
                <Link
                  href="/orders"
                  className="text-sm text-slate-600 transition hover:text-sky-600"
                >
                  My Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Sell */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Sell
            </h3>

            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/seller"
                  className="text-sm text-slate-600 transition hover:text-sky-600"
                >
                  Seller Dashboard
                </Link>
              </li>

              <li>
                <Link
                  href="/seller/products"
                  className="text-sm text-slate-600 transition hover:text-sky-600"
                >
                  My Products
                </Link>
              </li>

              <li>
                <Link
                  href="/seller/orders"
                  className="text-sm text-slate-600 transition hover:text-sky-600"
                >
                  Seller Orders
                </Link>
              </li>

              <li>
                <Link
                  href="/seller/products/new"
                  className="text-sm text-slate-600 transition hover:text-sky-600"
                >
                  Add Fishnet
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Support
            </h3>

            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/help"
                  className="text-sm text-slate-600 transition hover:text-sky-600"
                >
                  Help Center
                </Link>
              </li>

              <li>
                <Link
                  href="/shipping"
                  className="text-sm text-slate-600 transition hover:text-sky-600"
                >
                  Shipping
                </Link>
              </li>

              <li>
                <Link
                  href="/returns"
                  className="text-sm text-slate-600 transition hover:text-sky-600"
                >
                  Returns
                </Link>
              </li>

              <li>
                <Link
                  href="/contact"
                  className="text-sm text-slate-600 transition hover:text-sky-600"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 border-t border-slate-200 pt-8">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-lg font-semibold text-slate-900">
              Get fishing-net marketplace updates
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Receive new fishnet listings and marketplace updates.
            </p>

            <form
              onSubmit={handleNewsletterSubmit}
              className="mx-auto mt-5 flex max-w-lg flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Your email address"
                aria-label="Email address"
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />

              <button
                type="submit"
                className="rounded-lg bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
              >
                Subscribe
              </button>
            </form>

            {newsletterStatus === "success" && (
              <p className="mt-3 text-sm text-emerald-600">
                Thanks for subscribing.
              </p>
            )}

            {newsletterStatus === "error" && (
              <p className="mt-3 text-sm text-red-600">
                Please enter a valid email address.
              </p>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 flex flex-col gap-4 border-t border-slate-200 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Aazhimin. All rights reserved.
          </p>

          <div className="flex gap-5">
            <Link
              href="/privacy"
              className="transition hover:text-sky-600"
            >
              Privacy
            </Link>

            <Link
              href="/terms"
              className="transition hover:text-sky-600"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;