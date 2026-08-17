import Link from "next/link";
import React, { type ReactNode } from "react";
import { sanitize } from "@/lib/sanitize";

interface CategoryItemProps {
  children: ReactNode;
  title: string;
  href: string;
  className?: string;
}

const CategoryItem = ({
  title,
  children,
  href,
  className = "",
}: CategoryItemProps) => {
  return (
    <Link
      href={href}
      // aria-label={`Browse ${sanitize(title)}`}
      className={`group block rounded-xl border border-gray-200 bg-white p-4 transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md ${className}`}
    >
      <div className="flex min-h-[150px] flex-col items-center justify-center">
        {children}

        <h3 className="mt-2 text-center text-sm font-semibold text-gray-800 transition-colors duration-200 group-hover:text-blue-600">
          {sanitize(title)}
        </h3>
      </div>
    </Link>
  );
};

export default CategoryItem;