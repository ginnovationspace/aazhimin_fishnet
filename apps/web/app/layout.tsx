import type { Metadata } from "next";
import "./globals.css";
import 'svgmap/style.min';
import AppChrome from "@/components/AppChrome";
import Providers from "@/Providers";
import SessionTimeoutWrapper from "@/components/SessionTimeoutWrapper";

export const metadata: Metadata = {
  title: "fishnet Fishnet Marketplace",
  description: "A specialized marketplace for fishnets and fishing equipment connecting buyers and sellers"
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <body>
        <Providers>
          <SessionTimeoutWrapper />
          <AppChrome>{children}</AppChrome>
        </Providers>
      </body>
    </html>
  );
}
