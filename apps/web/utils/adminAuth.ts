import { redirect } from "next/navigation";
import { getServerAuthSession } from "./auth";

export async function requireAdmin() {
  const session = await getServerAuthSession();
  
  if (!session) {
    redirect("/login");
  }
  
  if (session.user?.role !== "ADMIN") {
    redirect("/");
  }
  
  return session;
}

export async function isAdmin(): Promise<boolean> {
  const session = await getServerAuthSession();
  return session?.user?.role === "ADMIN";
}
