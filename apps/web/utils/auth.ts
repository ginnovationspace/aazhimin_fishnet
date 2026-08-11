import { cookies } from "next/headers";
import config from "@/lib/config";

const tokenKey = "aazhimin_access_token";

export async function getServerAuthSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(tokenKey)?.value;

  if (!token) {
    return null;
  }

  const response = await fetch(`${config.apiBaseUrl}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();

  return {
    user: data.user,
    accessToken: token,
  };
}

export async function isAdmin(): Promise<boolean> {
  const session = await getServerAuthSession();
  return session?.user?.role === "ADMIN";
}

export async function requireAdmin() {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error("Admin access required");
  }
}
