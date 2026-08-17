"use client";

import Link from "next/link";
import { FaFish } from "react-icons/fa6";

import CategoryItem from "./CategoryItem";
import Heading from "./Heading";
import { categoryMenuList } from "@/lib/utils";
import { sanitize } from "@/lib/sanitize";

const CategoryMenu = () => {
  return (
    <section className="bg-white py-8">
      <div className="mx-auto max-w-screen-2xl px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center text-gray-800">
          <Heading title="Explore Fishnet Categories"/>

          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            Discover fishnets by type, material, and application.
          </p>
        </div>

        {/* Categories */}
        <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {categoryMenuList.map((item) => {
            const title = sanitize(item.title);

            return (
              <CategoryItem
                key={item.id}
                title={title}
                href={item.href}
                className="group"
              >
                <div className="flex min-h-[150px] flex-col items-center justify-center">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 transition-colors duration-200 group-hover:bg-blue-50">
                    <FaFish
                      aria-hidden="true"
                      className="text-3xl text-blue-600 transition-transform duration-200 group-hover:-translate-y-1"
                    />
                  </div>

                  <p className="text-sm font-semibold text-gray-800 transition-colors duration-200 group-hover:text-blue-600">
                    {title}
                  </p>
                </div>
              </CategoryItem>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700"
          >
            See All Categories
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoryMenu;
