"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep("otp");
        alert(`OTP: ${data.otp}`);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        if (!data.user.name) router.push("/profile");
        else router.push("/dashboard");
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-2 min-h-screen">
      <div className="flex items-center justify-center">
        <img src="/assets/image-login.jpeg" className="w-full object-cover" />
      </div>
      <div className="flex items-center justify-center">
        <div className="p-6 w-96 flex flex-col gap-3">
          <h1 className="text-2xl font-bold text-center uppercase">Selamat Datang</h1>
          <p className="mb-4 text-gray-400 text-center">Silahkan login dengan nomor HP</p>
          {error && <p className="text-red-500">{error}</p>}

          {step === "phone" ? (
            <>
              <input
                type="text"
                placeholder="+6281234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="p-2 border rounded-lg"
              />
              <button
                type="submit"
                onClick={sendOtp}
                disabled={loading}
                className={`p-2 rounded-lg text-white ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-500"
                  }`}
              >
                {loading ? "Mengirim..." : "Kirim OTP"}
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Masukkan kode OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="p-2 border rounded-lg"
              />
              <button
                type="submit"
                onClick={verifyOtp}
                disabled={loading}
                className={`p-2 rounded-lg text-white ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500"
                  }`}
              >
                {loading ? "Memverifikasi..." : "Verifikasi OTP"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
