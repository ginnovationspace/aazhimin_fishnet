'use client';

import { signOut, useSession } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import toast from "react-hot-toast";
import { FaHeadphones } from "react-icons/fa6";
import { FaRegEnvelope } from "react-icons/fa6";
import { FaLocationDot } from "react-icons/fa6";
import { FaRegUser } from "react-icons/fa6";

const HeaderTop = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = () => {
    setTimeout(() => signOut(), 1000);
    toast.success("Logout successful!");
  };

  return (
    <div className="h-10 bg-blue-500 text-white max-lg:h-16 max-lg:px-5 max-[573px]:px-0">
      <div className="mx-auto flex h-full max-w-screen-2xl items-center justify-between px-12 max-lg:flex-col max-lg:justify-center max-lg:items-center max-[573px]:px-0">

        {/* Left Information */}
        <ul className="flex h-full items-center gap-x-5 max-[370px]:gap-x-2 max-[370px]:text-sm">
          <li className="flex items-center gap-x-2 font-semibold">
            <FaHeadphones className="text-white" />
            <span>+123 456 7890</span>
          </li>

          <li className="flex items-center gap-x-2 font-semibold">
            <FaRegEnvelope className="text-xl text-white" />
            <span>info@aazhimin.com</span>
          </li>

          <li className="flex items-center gap-x-2 font-semibold">
            <FaLocationDot className="text-white" />
            <span>Serving Fishermen Worldwide</span>
          </li>
        </ul>

        {/* Right User Actions */}
        <ul className="flex h-full items-center gap-x-5 font-semibold max-[370px]:gap-x-2 max-[370px]:text-sm">

          {session ? (
            <>
              {/* User Email */}
              <li className="flex items-center">
                <span className="ml-10 max-w-[220px] truncate text-base">
                  {session.user?.email}
                </span>
              </li>

              {/* Buyer Orders */}
              {session.user?.role === "BUYER" && (
                <li className="flex items-center">
                  <Link
                    href="/buyer/orders"
                    onClick={(e) => {
                      e.preventDefault();
                      router.push("/buyer/orders");
                    }}
                    className="flex items-center gap-x-2 font-semibold transition-opacity hover:opacity-80"
                  >
                    <FaRegUser className="text-white" />
                    <span>My Orders</span>
                  </Link>
                </li>
              )}

              {/* Seller Orders */}
              {session.user?.role === "SELLER" && (
                <li className="flex items-center">
                  <Link
                    href="/seller/orders"
                    onClick={(e) => {
                      e.preventDefault();
                      router.push("/seller/orders");
                    }}
                    className="flex items-center gap-x-2 font-semibold transition-opacity hover:opacity-80"
                  >
                    <FaRegUser className="text-white" />
                    <span>Seller Orders</span>
                  </Link>
                </li>
              )}

              {/* Logout */}
              <li className="flex items-center">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-x-2 font-semibold transition-opacity hover:opacity-80"
                >
                  <FaRegUser className="text-white" />
                  <span>Log out</span>
                </button>
              </li>
            </>
          ) : null}

        </ul>
      </div>
    </div>
  );
};

export default HeaderTop;
