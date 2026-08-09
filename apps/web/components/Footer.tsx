// *********************
// Role of the component: Enhanced footer component with better UX and features
// Name of the component: Footer.tsx
// Developer: Enhanced by Claude
// Version: 2.0
// Component call: <Footer />
// Input parameters: no input parameters
// Output: Enhanced footer with social media, newsletter, and better visual hierarchy
// *********************

"use client";

import { navigation } from "@/lib/utils";
import Image from "next/image";
import React, { useState } from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa6";

const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState(null); // null, 'success', 'error'

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      // In a real app, this would call an API to subscribe
      setNewsletterStatus('success');
      setNewsletterEmail("");
      // Reset status after 3 seconds
      setTimeout(() => setNewsletterStatus(null), 3000);
    } else {
      setNewsletterStatus('error');
      setTimeout(() => setNewsletterStatus(null), 3000);
    }
  };

  return (
    <footer className="bg-white" aria-labelledby="footer-heading">
      <div>
        <h2 id="footer-heading" className="sr-only">
          Footer
        </h2>
        <div className="mx-auto max-w-screen-2xl px-6 lg:px-8 pt-16 pb-10">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            {/* Logo Section */}
            <div className="flex flex-col items-center">
              <Image
                src="/logo v1.png"
                alt="Aazhimin logo"
                width={200}
                height={200}
                className="h-auto w-auto mb-4"
              />
              <p className="text-center text-gray-600">
                Equipping anglers since 2024
              </p>
              {/* Social Media */}
              <div className="mt-4 flex gap-3">
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-600 hover:text-white transition-colors text-blue-500"
                >
                  <FaFacebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-500 hover:text-white transition-colors text-blue-400"
                >
                  <FaTwitter className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-pink-500 hover:text-white transition-colors text-pink-500"
                >
                  <FaInstagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-500 hover:text-white transition-colors text-red-500"
                >
                  <FaYoutube className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black hover:text-white transition-colors text-black"
                >
                  <FaTiktok className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Navigation Columns */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold leading-6 text-blue-600 mb-4">
                Shop
              </h3>
              <ul className="space-y-2">
                {navigation.sale.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="text-sm leading-5 text-gray-600 hover:text-blue-600 transition-colors duration-200"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold leading-6 text-blue-600 mb-4">
                About
              </h3>
              <ul className="space-y-2">
                {navigation.about.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="text-sm leading-5 text-gray-600 hover:text-blue-600 transition-colors duration-200"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold leading-6 text-blue-600 mb-4">
                Support
              </h3>
              <ul className="space-y-2">
                {navigation.help.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="text-sm leading-5 text-gray-600 hover:text-blue-600 transition-colors duration-200"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold leading-6 text-blue-600 mb-4">
                Buying Guide
              </h3>
              <ul className="space-y-2">
                {navigation.buy.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="text-sm leading-5 text-gray-600 hover:text-blue-600 transition-colors duration-200"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-bold text-center text-blue-600 mb-4">
              Stay Updated
            </h3>
            <p className="text-center text-gray-600 mb-4 max-w-xl mx-auto">
              Get the latest fishing tips, product launches, and exclusive offers
            </p>
            <form onSubmit={handleNewsletterSubmit} className="max-w-xl mx-auto flex flex-col sm:flex-row">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                className="px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-[200px] sm:mr-2"
              />
              <button
                type="submit"
                className="px-5 py-3 bg-blue-600 text-white font-medium rounded-r-lg hover:bg-blue-700 transition-colors flex-1 sm:w-auto"
              >
                Subscribe
              </button>
              {newsletterStatus === "success" && (
                <p className="mt-2 text-center text-green-600 text-sm">
                  Thanks for subscribing!
                </p>
              )}
              {newsletterStatus === "error" && (
                <p className="mt-2 text-center text-red-600 text-sm">
                  Please enter a valid email address
                </p>
              )}
            </form>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
            <p className="flex flex-col sm:flex-row justify-center gap-2">
              <span>© 2024 Aazhimin Fishing Net. All rights reserved.</span>
              <span>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Privacy Policy
                </a>
              </span>
              <span>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Terms of Service
                </a>
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;