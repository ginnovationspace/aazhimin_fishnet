"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { usePathname } from "next/navigation";
import DashboardSidebar from "@/components/DashboardSidebar";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isSellerRoute = pathname.startsWith("/seller");
  const isAdminRoute = pathname.startsWith("/admin");
  const hasRequiredRole =
    (!isSellerRoute || session?.user?.role === "SELLER") &&
    (!isAdminRoute || session?.user?.role === "ADMIN");

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.replace(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (status === "authenticated" && !hasRequiredRole) {
      window.location.replace("/");
    }
  }, [hasRequiredRole, status]);

  if (status !== "authenticated" || !hasRequiredRole) {
    return null;
  }

  if (isSellerRoute) {
    return (
      <div className="min-h-screen bg-white lg:flex">
        <DashboardSidebar role="SELLER" />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    );
  }

  return <>{children}</>;
}
