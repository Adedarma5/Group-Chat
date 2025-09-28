"use client";

import "./globals.css";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const showNavbar = pathname === "/" || pathname === "/auth/login";

  return (
    <html lang="en">
      <body className="h-screen w-screen overflow-hidden bg-gray-50">
        {showNavbar && <Navbar />}
        {children}
      </body>
    </html>
  );
}
