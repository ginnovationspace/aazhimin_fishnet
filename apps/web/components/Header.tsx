// *********************
// Role of the component: Enhanced header component with improved navigation and UX
// Name of the component: Header.tsx
// Developer: Enhanced by Claude
// Version: 2.0
// Component call: <Header />
// Input parameters: no input parameters
// Output: Header component with mega menu, better search, and improved user experience
// *********************

"use client";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import HeaderTop from "./HeaderTop";
import Image from "next/image";
import SearchInput from "./SearchInput";
import Link from "next/link";
import { FaBell, FaBars, FaXmark } from "react-icons/fa6";

import CartElement from "./CartElement";
import NotificationBell from "./NotificationBell";
import HeartElement from "./HeartElement";
import { signOut, useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useWishlistStore } from "@/app/_zustand/wishlistStore";
import apiClient from "@/lib/api";
import { categoryMenuList } from "@/lib/utils";

const Header = () => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { wishlist, setWishlist, wishQuantity } = useWishlistStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    setTimeout(() => signOut(), 1000);
    toast.success("Logout successful!");
  };

  // getting all wishlist items by user id
  const getWishlistByUserId = async (id: string) => {
    const response = await apiClient.get(`/api/wishlist/${id}`, {
      cache: "no-store",
    });
    const wishlistData = await response.json();
    const productArray: {
      id: string;
      title: string;
      price: number;
      image: string;
      slug:string
      stockAvailabillity: number;
    }[] = [];

    // temporary disable wishlist fetching while the issue is being resolved
    // wishlistData.map((item: any) => productArray.push({id: item?.product?.id, title: item?.product?.title, price: item?.product?.price, image: item?.product?.mainImage, slug: item?.product?.slug, stockAvailabillity: item?.product?.inStock}));
    // setWishlist(productArray);
  };

  // getting user by email so I can get his user id
  const getUserByEmail = async () => {
    if (session?.user?.email) {
      apiClient.get(`/api/users/email/${session?.user?.email}`, {
        cache: "no-store",
      })
        .then((response) => response.json())
        .then((data) => {
          getWishlistByUserId(data?.id);
        });
    }
  };

  useEffect(() => {
    getUserByEmail();
  }, [session?.user?.email, wishlist.length]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    // Prevent body scrolling when mobile menu is open
    document.body.style.overflow = mobileMenuOpen ? "" : "hidden";
  };

  return (
    <>
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={handleMobileMenuToggle}>
          <div className="fixed inset-y-0 left-0 w-64 bg-white z-50 flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <Link href="/">
                <Image
                  src="/logo v1 svg.svg"
                  width={200}
                  height={200}
                  alt="Aazhimin logo"
                  className="h-auto"
                />
              </Link>
              <button onClick={handleMobileMenuToggle} className="text-gray-500 hover:text-gray-700">
                <FaXmark className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Menu Categories */}
            <nav className="flex-1 overflow-y-auto">
              <ul className="space-y-2">
                {categoryMenuList.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={category.href}
                      className="block px-4 py-3 text-left text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                    >
                      {sanitize(category.title)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Mobile Menu Actions */}
            <div className="px-6 py-4 border-t">
              <div className="space-y-3">
                <Link
                  href="/cart"
                  className="block w-full text-center px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  View Cart ({/* cart count would go here */})
                </Link>
                <Link
                  href="/wishlist"
                  className="block w-full text-center px-4 py-3 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                >
                  Wishlist ({wishQuantity})
                </Link>
                {session ? (
                  <>
                    <Link
                      href="/admin"
                      className="block w-full text-center px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Admin Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-center px-4 py-3 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block w-full text-center px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="block w-full text-center px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white">
        <HeaderTop />
        {pathname.startsWith("/admin") === false && (
          <div className="relative">
            {/* Desktop Header */}
            <div className="hidden md:flex h-32 bg-white flex items-center justify-between px-16 max-[1320px]:px-16 max-md:px-6 max-lg:flex-col max-lg:gap-y-7 max-lg:justify-center max-lg:h-60 max-w-screen-2xl mx-auto">
              {/* Logo and Search */}
              <div className="flex items-center flex-1">
                <Link href="/">
                  <img
                    src="/logo v1 svg.svg"
                    width={250}
                    height={250}
                    alt="Aazhimin logo"
                    className="relative right-5 max-[1023px]:w-56"
                  />
                </Link>
                <div className="ml-10 flex-grow">
                  <form onSubmit={handleSearch} className="relative">
                    <SearchInput />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-3 py-2 rounded-r hover:bg-blue-700 transition-colors"
                    >
                      Search
                    </button>
                  </form>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-8">
                {/* Categories Dropdown */}
                <div className="relative group">
                  <button
                    className="flex items-center gap-2 text-gray-700 font-medium hover:text-blue-600 transition-colors"
                  >
                    Categories
                    <svg className="w-4 h-4 transition-transform duration-200 group-hover:-rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>

                  {/* Mega Menu Dropdown */}
                  <div className="absolute left-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 overflow-hidden z-20 origin-top-right group-hover:block">
                    <div className="py-1">
                      {/* Category Sections */}
                      {[["Fishing Essentials", ["Fishing Nets", "Fishing Rods", "Reels", "Fishing Lines", "Hooks & Sinkers"]],
                        ["Gear & Apparel", ["Bait & Lures", "Tackle Boxes", "Fishing Apparel", "Accessories"]],
                        ["Electronics", ["Fish Finders"]]].map(([sectionTitle, categories]) => (
                        <div key={sectionTitle} className="border-b border-gray-100 last:border-b-0">
                          <h3 className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">{sanitize(sectionTitle)}</h3>
                          <div className="space-y-1">
                            {categories.map((cat) => (
                              <Link
                                key={cat}
                                href={`/shop/${cat.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                              >
                                {sanitize(cat)}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Shop Link */}
                <Link
                  href="/shop"
                  className="flex items-center gap-2 text-gray-700 font-medium hover:text-blue-600 transition-colors"
                >
                  Shop
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l2.586 6a2 2 0 002.172 1.414H15.414a2 2 0 002.172-1.414L21 3H5z"></path>
                  </svg>
                </Link>
              </div>

              {/* User Actions */}
              <div className="flex gap-x-4 items-center">
                <NotificationBell />
                <HeartElement wishQuantity={wishQuantity} />
                <CartElement />

                {/* User Dropdown */}
                <div className="relative group">
                  {session ? (
                    <>
                      <div tabIndex={0} role="button" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100">
                        <Image
                          src="/randomuser.jpg"
                          alt="User profile"
                          width={30}
                          height={30}
                          className="w-full h-full rounded-full"
                        />
                      </div>
                      <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 overflow-hidden z-20 origin-top-right">
                        <div className="py-1">
                          <div className="px-4 py-2 text-sm font-medium text-gray-700">
                            {session.user?.name || session.user?.email?.split('@')[0] || "User"}
                          </div>
                          <div className="border-t border-gray-100"></div>
                          <div className="space-y-1">
                            <Link
                              href="/admin"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Admin Dashboard
                            </Link>
                            <Link
                              href="/wishlist"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Wishlist ({wishQuantity})
                            </Link>
                            <Link
                              href="/cart"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Cart
                            </Link>
                            <div className="border-t border-gray-100"></div>
                            <button
                              onClick={handleLogout}
                              className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Logout
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="flex items-center gap-2 text-gray-700 font-medium hover:text-blue-600 transition-colors"
                      >
                        Login
                        <FaXmark className="w-4 h-4" /> {/* Using times as user icon */}
                      </Link>
                      <Link
                        href="/register"
                        className="ml-4 flex items-center gap-2 text-gray-700 font-medium hover:text-blue-600 transition-colors"
                      >
                        Register
                        <FaBars className="w-4 h-4" /> {/* Using bars as register icon */}
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Header Button */}
            <div className="md:hidden px-4">
              <button onClick={handleMobileMenuToggle} className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <Link href="/">
                    <Image
                      src="/logo v1 svg.svg"
                      width={120}
                      height={120}
                      alt="Aazhimin logo"
                      className="h-auto"
                    />
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded hover:bg-gray-200">
                    <FaBars className="w-5 h-5 text-gray-600 hover:text-gray-800" />
                  </button>
                </div>
              </button>
            </div>
          </div>
        )}

        {pathname.startsWith("/admin") === true && (
          <div className="flex justify-between h-32 bg-white items-center px-16 max-[1320px]:px-10  max-w-screen-2xl mx-auto max-[400px]:px-5">
            <Link href="/">
              <Image
                src="/logo v1.png"
                width={130}
                height={130}
                alt="Aazhimin logo"
                className="w-56 h-auto"
              />
            </Link>
            <div className="flex gap-x-5 items-center">
              <NotificationBell />
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="w-10">
                  <Image
                    src="/randomuser.jpg"
                    alt="random profile photo"
                    width={30}
                    height={30}
                    className="w-full h-full rounded-full"
                  />
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                >
                  <li>
                    <Link href="/admin">Dashboard</Link>
                  </li>
                  <li>
                    <a>Profile</a>
                  </li>
                  <li onClick={handleLogout}>
                    <a href="#">Logout</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
