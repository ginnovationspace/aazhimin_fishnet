import type { Metadata } from "next";
import "./globals.css";
import 'svgmap/style.min';
import SessionProvider from "@/utils/SessionProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/Providers";
import SessionTimeoutWrapper from "@/components/SessionTimeoutWrapper";

export const metadata: Metadata = {
  title: "Aazhimin Fishnet Marketplace",
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
        <SessionProvider>
          <SessionTimeoutWrapper />
          <Header />
          <Providers>
            {children}
          </Providers>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
