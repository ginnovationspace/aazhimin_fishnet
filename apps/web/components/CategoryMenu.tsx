// *********************
// Role of the component: Modern category showcase with hover effects
// Name of the component: CategoryMenu.tsx
// Developer: AI Assistant
// Version: 2.0
// Component call: <CategoryMenu />
// Input parameters: no input parameters
// Output: Enhanced category menu with better visual hierarchy and interactions
// ******************* */

import React from "react";
import CategoryItem from "./CategoryItem";
import Image from "next/image";
import { categoryMenuList } from "@/lib/utils";
import Heading from "./Heading";
import { sanitize } from "@/lib/sanitize";

const CategoryMenu = () => {
  return (
    <div className="bg-white py-16">
      <div className="max-w-screen-2xl mx-auto px-6">
        <Heading title="Explore Fishnet Categories" />
        <p className="text-center text-gray-600 max-w-2xl mx-auto mt-4">
          Discover fishnets by type, material, and application
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categoryMenuList.map((item) => (
            <CategoryItem
              key={item.id}
              title={sanitize(item.title)}
              href={item.href}
              className="group"
            >
              <Image
                src={item.src}
                width={64}
                height={64}
                alt={sanitize(item.title)}
                className="mx-auto mb-4 transition-transform duration-300 group-hover:-translate-y-1"
              />
              <p className="text-center text-gray-700 font-medium">{sanitize(item.title)}</p>
            </CategoryItem>
          ))}
        </div>

        <div className="mt-16 text-center">
          <a
            href="/shop"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300"
          >
            See All Categories
            <span className="ml-2">→</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default CategoryMenu;