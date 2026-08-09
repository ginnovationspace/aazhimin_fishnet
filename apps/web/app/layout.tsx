import type { Metadata } from "next";
import "./globals.css";
import { getServerSession } from "next-auth/next";
import 'svgmap/style.min';
import SessionProvider from "@/utils/SessionProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/Providers";
import SessionTimeoutWrapper from "@/components/SessionTimeoutWrapper";

export const metadata: Metadata = {
  title: "Aazhimin Fishing Net eCommerce",
  description: "A modern fishing net e-commerce platform with admin dashboard built with Next.js and Node.js"
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();
  return (
    <html lang="en" data-theme="light">
      <body>
        <SessionProvider session={session}>
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
