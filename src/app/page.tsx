"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const handleOnclick = () => {
    router.push("/auth/login")
  }

  return (
    <div className="grid grid-cols-2 min-h-screen">
      <div className=" flex items-center justify-center relative z-10 px-4 ">
        <div className="max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-indigo-700 to-indigo-500 bg-clip-text text-transparent">
              Binder
            </span>
          </h1>
          <p className="text-xl md:text-1xl text-black font-semibold uppercase">
            Pengalaman Berdiskusi Dengan Tenang dan Cepat, 
          </p>
          <p className="mb-8 text-gray-500 font-semibold uppercase">
            <span className="text-indigo-700">Yuk </span>
            kita ngobrol dan berbagi cerita atau sekedar seru-seruan bareng
          </p>
          <div className="flex flex-col sm:flex-row gap-4 ">
            <button
              type="submit"
              onClick={handleOnclick}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 shadow-2xl hover:shadow-amber-500/25 transform hover:-translate-y-1">
              Mulai Sekarang
            </button>

            <button className="border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300">
              Jelajahi Lebih Lanjut
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <img src="/assets/home.png" className="w-full object-cover" />
      </div>


    </div>
  );
}
