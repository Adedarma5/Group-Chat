"use client";

import "./globals.css";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showNavbar, setShowNavbar] = useState(false);

  useEffect(() => {
    setShowNavbar(pathname === "/" || pathname === "/auth/login");
  }, [pathname]);

  return (
    <html lang="en">
      <body className="min-h-screen overflow-y-auto bg-gray-50">
        {showNavbar && <Navbar />}
        {children}
      </body>
    </html>
  );
}
