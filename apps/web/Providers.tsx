"use client";
import { Toaster } from "react-hot-toast";

import React from "react";
import { AuthProvider } from "@/lib/auth-client";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <Toaster
        toastOptions={{
          className: "",
          style: {
            fontSize: "17px",
          },
        }}
      />
      {children}
    </AuthProvider>
  );
};

export default Providers;
