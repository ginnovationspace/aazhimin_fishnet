"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status]);

  if (status === "loading" || status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
}
