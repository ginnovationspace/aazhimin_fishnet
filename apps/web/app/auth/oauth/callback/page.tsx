"use client";

import { completeOAuthSignIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const safeRedirectPath = (next: string | null) => {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }

  return next;
};

export default function OAuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Completing sign in...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = params.get("access_token") || "";
    const next = safeRedirectPath(params.get("next"));

    window.history.replaceState(null, "", "/auth/oauth/callback");

    if (!accessToken) {
      const errorMessage = "Google sign in did not return an access token.";
      setMessage(errorMessage);
      toast.error(errorMessage);
      router.replace("/login");
      return;
    }

    completeOAuthSignIn(accessToken)
      .then(() => {
        toast.success("Signed in with Google");
        router.replace(next);
        router.refresh();
      })
      .catch((error) => {
        const errorMessage = error instanceof Error ? error.message : "Unable to complete Google sign in.";
        setMessage(errorMessage);
        toast.error(errorMessage);
        router.replace("/login");
      });
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <p className="text-center text-sm font-medium text-gray-700">{message}</p>
    </div>
  );
}
