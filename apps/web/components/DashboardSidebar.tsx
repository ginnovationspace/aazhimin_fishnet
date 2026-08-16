// *********************
// Role of the component: Sidebar on admin dashboard page
// Name of the component: DashboardSidebar.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <DashboardSidebar />
// Input parameters: no input parameters
// Output: sidebar for admin dashboard page
// *********************

import React from "react";
import { MdDashboard } from "react-icons/md";
import { FaTable, FaRegUser, FaGear, FaBagShopping, FaStore, FaPlus } from "react-icons/fa6";
import { MdCategory } from "react-icons/md";
import { FaFileUpload } from "react-icons/fa";

import Link from "next/link";

type DashboardRole = "ADMIN" | "SELLER";

const DashboardSidebar = ({ role = "ADMIN" }: { role?: DashboardRole }) => {
  const isSeller = role === "SELLER";
  const items = isSeller
    ? [
        { href: "/seller", label: "Dashboard", icon: MdDashboard },
        { href: "/seller/products", label: "My Products", icon: FaTable },
        { href: "/seller/products/new", label: "Add Product", icon: FaPlus },
        { href: "/seller/orders", label: "Orders", icon: FaBagShopping },
      ]
    : [
        { href: "/admin", label: "Dashboard", icon: MdDashboard },
        { href: "/admin/orders", label: "Orders", icon: FaBagShopping },
        { href: "/admin/products", label: "Products", icon: FaTable },
        { href: "/admin/bulk-upload", label: "Bulk Upload", icon: FaFileUpload },
        { href: "/admin/categories", label: "Categories", icon: MdCategory },
        { href: "/admin/users", label: "Users", icon: FaRegUser },
        { href: "/admin/merchant", label: "Sellers", icon: FaStore },
        { href: "/admin/moderation", label: "Moderation", icon: FaGear },
      ];

  return (
    <aside className="w-full shrink-0 bg-blue-600 text-white lg:w-64">
      <div className="border-b border-blue-500 px-5 py-5 text-lg font-semibold">
        {isSeller ? "Seller Center" : "Admin Center"}
      </div>
      <nav className="flex overflow-x-auto lg:block lg:overflow-visible">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex min-w-max items-center gap-3 px-5 py-4 text-sm font-medium hover:bg-blue-700 lg:min-w-0"
          >
            <Icon className="text-lg" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
