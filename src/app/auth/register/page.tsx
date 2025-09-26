"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) router.push("/auth/login");
    else setError(data.error);
  };

  return (
    <div className="grid grid-cols-2 h-screen items-center justify-center ">
      <div className="flex items-center justify-center">
        <img
          src="/assets/image-login.jpeg"
          className="w-full  object-cover"
        />
      </div>

      <div className="flex items-center justify-center">
        <form onSubmit={handleSubmit} className="p-6 w-100 flex flex-col gap-3">
          <h1 className="text-2xl text-center uppercase font-bold mb-4">Register</h1>
          {error && <p className="text-red-500">{error}</p>}
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="p-2 border rounded"
          /> 
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="p-2 border rounded"
          /> 
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="p-2 border rounded"
          />
          <div className="grid grid-cols-3 gap-4">
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded col-start-1 col-end-7">
              Register
            </button>

            <Link href="/auth/login" className="col-span-4 col-start-2 text-blue-400 hover:text-blue-600 underline">
              Sudah punya akun?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
