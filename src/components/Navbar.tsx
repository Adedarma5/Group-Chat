"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const handelOnClick = () => {
    router.push("/auth/login")
  }

  return (
    <nav className="w-full bg-white shadow-lg absolute">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-600">
          Binder
        </Link>

        <div className="flex items-center font-semibold">
          <Link href="/" className="text-gray-700 hover:text-blue-600">
            Home
          </Link>
        </div>

        <button
          onClick={handelOnClick}
          className="border-2 border-indigo-500 text-indigo-500 hover:bg-indigo-500 hover:text-white px-6 py-1  rounded-full font-semibold transition-all duration-300">
          Login
        </button>
      </div>
    </nav>
  );
}
