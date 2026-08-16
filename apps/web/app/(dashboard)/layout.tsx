"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/auth-client";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.replace("/login");
    }
  }, [status]);

  if (status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
}
