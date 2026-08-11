"use client";
import React from "react";
import { AuthProvider } from "@/lib/auth-client";

const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

export default SessionProvider;
