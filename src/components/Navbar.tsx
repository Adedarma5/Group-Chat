"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-white shadow-md border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-600">
          MyApp
        </Link>

        <div className="flex gap-6">
          <Link href="/" className="text-gray-700 hover:text-blue-600">
            Home
          </Link>
          <Link href="/auth/login" className="text-gray-700 hover:text-blue-600">
            Login
          </Link>
          <Link href="/auth/register" className="text-gray-700 hover:text-blue-600">
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}
