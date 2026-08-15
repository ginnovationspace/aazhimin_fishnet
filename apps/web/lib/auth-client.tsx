"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import apiClient from "./api";

const tokenKey = "fishnet_access_token";
const userKey = "fishnet_user";
const authChangeEvent = "fishnet-auth-change";

export type AuthUser = {
  name: any;
  id?: string;
  email?: string | null;
  role?: "BUYER" | "SELLER" | "ADMIN" | string | null;
  merchant?: {
    id: string;
    name: string;
    verificationStatus?: string;
    status?: string;
  } | null;
};

export type AuthSession = {
  user: AuthUser;
  accessToken: string;
  expires?: string;
};

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  data: AuthSession | null;
  status: AuthStatus;
  update: () => Promise<AuthSession | null>;
};

const AuthContext = createContext<AuthContextValue>({
  data: null,
  status: "loading",
  update: async () => null,
});

const readStoredSession = (): AuthSession | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const token = window.localStorage.getItem(tokenKey);
  const storedUser = window.localStorage.getItem(userKey);

  if (!token || !storedUser) {
    return null;
  }

  try {
    return {
      user: JSON.parse(storedUser),
      accessToken: token,
    };
  } catch {
    window.localStorage.removeItem(tokenKey);
    window.localStorage.removeItem(userKey);
    return null;
  }
};

const persistSession = (token: string, user: AuthUser) => {
  window.localStorage.setItem(tokenKey, token);
  window.localStorage.setItem(userKey, JSON.stringify(user));
  document.cookie = `${tokenKey}=${token}; path=/; max-age=86400; SameSite=Lax`;
  window.dispatchEvent(new Event(authChangeEvent));
};

const clearSession = () => {
  window.localStorage.removeItem(tokenKey);
  window.localStorage.removeItem(userKey);
  document.cookie = `${tokenKey}=; path=/; max-age=0; SameSite=Lax`;
  window.dispatchEvent(new Event(authChangeEvent));
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const refreshSession = useCallback(async () => {
    const storedSession = readStoredSession();

    if (!storedSession) {
      setSession(null);
      setStatus("unauthenticated");
      return null;
    }

    setSession(storedSession);
    setStatus("authenticated");

    try {
      const response = await apiClient.get("/api/auth/me");

      if (!response.ok) {
        clearSession();
        setSession(null);
        setStatus("unauthenticated");
        return null;
      }

      const data = await response.json();
      persistSession(storedSession.accessToken, data.user);

      const refreshedSession = {
        user: data.user,
        accessToken: storedSession.accessToken,
      };

      setSession(refreshedSession);
      return refreshedSession;
    } catch {
      return storedSession;
    }
  }, []);

  useEffect(() => {
    refreshSession();

    const handleAuthChange = () => {
      const storedSession = readStoredSession();
      setSession(storedSession);
      setStatus(storedSession ? "authenticated" : "unauthenticated");
    };

    window.addEventListener(authChangeEvent, handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener(authChangeEvent, handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [refreshSession]);

  const value = useMemo(
    () => ({
      data: session,
      status,
      update: refreshSession,
    }),
    [refreshSession, session, status]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useSession = () => useContext(AuthContext);

export const signIn = async (
  provider: string,
  options: { redirect?: boolean; email?: string; password?: string; callbackUrl?: string } = {}
) => {
  if (provider !== "credentials") {
    return { error: "This sign-in provider is not enabled on the Node API." };
  }

  const response = await apiClient.post("/api/auth/login", {
    email: options.email,
    password: options.password,
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return { error: data.error || "Invalid email or password" };
  }

  persistSession(data.token, data.user);

  if (options.redirect !== false) {
    window.location.href = options.callbackUrl || "/";
  }

  return { ok: true, error: null, url: options.callbackUrl || "/", user: data.user };
};

export const completeOAuthSignIn = async (accessToken: string) => {
  if (!accessToken) {
    throw new Error("OAuth access token is required");
  }

  window.localStorage.setItem(tokenKey, accessToken);

  const response = await apiClient.get("/api/auth/me");
  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.user) {
    clearSession();
    throw new Error(data.error || "Unable to complete OAuth sign in");
  }

  persistSession(accessToken, data.user);

  return {
    user: data.user,
    accessToken,
  };
};

export const replaceClientSession = (accessToken: string, user: AuthUser) => {
  persistSession(accessToken, user);
};

export const signOut = async (options: { callbackUrl?: string; redirect?: boolean } = {}) => {
  try {
    await apiClient.post("/api/auth/logout");
  } finally {
    clearSession();
  }

  if (options.redirect !== false) {
    window.location.href = options.callbackUrl || "/login";
  }

  return { url: options.callbackUrl || "/login" };
};

export const getClientSession = readStoredSession;
