"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { User } from "@/types";
import Image from "next/image";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed: User = JSON.parse(storedUser);
        setUser(parsed);
        setName(parsed.name || "");
        setPhone(parsed.phone || "");
        setEmail(parsed.email || "");
        setAvatarUrl(parsed.avatar_url || "");
      } catch (err) {
        console.error("Invalid user data in localStorage:", err);
      }
    } else {
      router.push("/auth/login");
    }
  }, [router]);

  const uploadAvatar = async (file: File) => {
    if (!user) return null;
    const fileName = `${user.id}_${file.name}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true });

    if (error) {
      alert("Gagal upload avatar");
      return null;
    }

    const { data: publicData } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    return publicData.publicUrl;
  };

  const handleSave = async () => {
    if (!user) return;

    if (!name.trim() || !email.trim()) {
      alert("Nama dan Email wajib diisi");
      return;
    }

    setLoading(true);
    let uploadedUrl = avatarUrl;

    if (avatarFile) {
      const url = await uploadAvatar(avatarFile);
      if (!url) {
        setLoading(false);
        return;
      }
      uploadedUrl = url;
    }

    const { error } = await supabase
      .from("users")
      .update({
        name,
        email,
        avatar_url: uploadedUrl,
      })
      .eq("id", user.id);

    if (!error) {
      localStorage.setItem(
        "user",
        JSON.stringify({ ...user, name, email, avatar_url: uploadedUrl })
      );
      router.push("/dashboard");
    } else {
      alert("Gagal menyimpan profil");
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md flex flex-col gap-4">
        <h2 className="text-xl font-bold">Complete Your Profile</h2>

        <div className="flex flex-col gap-2">
          <label>Name</label>
          <input
            type="text"
            className="border p-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label>Email</label>
          <input
            type="email"
            className="border p-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label>Phone (readonly)</label>
          <input
            type="text"
            className="border p-2 rounded bg-gray-100"
            value={phone}
            readOnly
          />
        </div>

        <div className="flex flex-col gap-2">
          <label>Avatar</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setAvatarFile(e.target.files[0]);
              }
            }}
          />
          {avatarUrl && (
            <Image
              src={avatarUrl}
              alt="User avatar"
              width={96} 
              height={96}
              className="w-24 h-24 rounded-full mt-2 object-cover"
            />
          )}
        </div>

        <button
          className="bg-blue-500 text-white p-2 rounded mt-2"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}
