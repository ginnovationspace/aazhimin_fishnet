// *********************
// Role of the component: Brand story section with modern design
// Name of the component: IntroducingSection.tsx
// Developer: AI Assistant
// Version: 2.0
// Component call: <IntroducingSection />
// Input parameters: no input parameters
// Output: Modern brand storytelling section with Aazhimin's mission and values
// *********************

import Link from "next/link";
import React from "react";

const IntroducingSection = () => {
  return (
    <div className="relative bg-white py-24">
      {/* Decorative elements */}
      <div className="absolute inset-0 -z-10">
        <svg className="absolute top-0 left-0 w-40 h-40 stroke-blue-500/20" viewBox="0 0 100 100" fill="none">
          <path d="M10,50 Q25,10 40,50 T70,50" strokeWidth="4"/>
        </svg>
        <svg className="absolute bottom-0 right-0 w-32 h-32 stroke-blue-400/15" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="40" strokeWidth="3"/>
        </svg>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-6 lg:text-5xl">
            About Aazhimin
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Aazhimin is a specialized marketplace connecting fishnet manufacturers, sellers, distributors, and buyers. We simplify the process of discovering, comparing, and purchasing fishing nets by providing a platform where businesses and individuals can find the right products for their needs.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-start">
          {/* Our Mission */}
          <div className="bg-blue-50 p-8 rounded-2xl border border-blue-200">
            <h3 className="text-2xl font-semibold text-blue-600 mb-4">Our Mission</h3>
            <p className="text-gray-700">
              To create a trusted, efficient marketplace that connects fishnet buyers and sellers, enabling seamless transactions and supporting the fishing industry&apos;s growth.
            </p>
          </div>

          {/* How It Works */}
          <div className="bg-blue-50 p-8 rounded-2xl border border-blue-200">
            <h3 className="text-2xl font-semibold text-blue-600 mb-4">How It Works</h3>
            <p className="text-gray-700">
              Sellers list their fishnets with detailed specifications, buyers search and compare products, and transactions are facilitated through our secure platform. We handle the complexities so you can focus on your fishing operations.
            </p>
          </div>

          {/* Our Commitment */}
          <div className="bg-blue-50 p-8 rounded-2xl border border-blue-200">
            <h3 className="text-2xl font-semibold text-blue-600 mb-4">Our Commitment</h3>
            <p className="text-gray-700">
              We are committed to promoting sustainable fishing practices by offering eco-friendly net options and supporting responsible sellers who prioritize quality and environmental stewardship.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/about"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
          >
            Our Story
            <span className="ml-2">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default IntroducingSection;
