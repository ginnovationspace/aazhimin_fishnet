// *********************
// Role of the component: Modern hero component on home page
// Name of the component: Hero.tsx
// Developer: AI Assistant
// Version: 2.0
// Component call: <Hero />
// Input parameters: no input parameters
// Output: Modern hero component with fishing-specific messaging and call-to-action
// *********************

import React from "react";
import Link from "next/link";

const Hero = () => {
  return (
    <div className="relative h-[650px] w-full bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-44 h-44 bg-white/10 rounded-full -translate-x-16 -translate-y-16 animate-[float_6s_ease-in_out_infinite]"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/15 rounded-full -translate-x-8 translate-y-8 animate-[float_8s_ease-in_out_infinite]"></div>
      </div>

      <div className="relative z-10 flex h-full items-center px-6 md:px-12 lg:px-20">
        <div className="flex-1 max-w-2xl space-y-6">
          <h1 className="text-4xl font-extremely-bold tracking-tighter text-white md:text-5xl lg:text-6xl">
            Find the right fishnet for your fishing operation.
          </h1>

          <p className="text-lg text-white/90 max-w-xl md:text-xl">
            Discover fishnets from trusted sellers and suppliers, compare specifications, check availability, and order for your business or fishing needs.
          </p>

          <div className="flex flex-wrap gap-4 mt-8">
            <Link
              href="/shop"
              className="flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
            >
              Browse Fishnets
            </Link>
            <Link
              href="/register-seller"
              className="flex items-center justify-center px-8 py-4 bg-white/20 text-white border border-white/20 font-semibold rounded-lg hover:bg-white/30 hover:text-blue-600 transition-all duration-300 transform hover:-translate-y-1"
            >
              Sell on fishnet
            </Link>
          </div>
        </div>

        <div className="flex-1 flex justify-center hidden md:block">
          <img
            src="https://commons.wikimedia.org/wiki/Special:FilePath/Fishing_with_net.jpg?width=1280"
            alt="Professional fishing net in action"
            className="h-[400px] w-[500px] rounded-2xl border-4 border-white/20 object-cover shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
