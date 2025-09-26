"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar_url?: string | null;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const localUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!localUser.id) return;

    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, phone, avatar_url")
      .eq("id", localUser.id)
      .single();

    if (error) setError(error.message);
    else setUser(data);
  };

  const handleUpdate = async () => {
    if (!user) return;
    setLoading(true);
    setError("");

    let avatar_url = user.avatar_url;

    if (avatarFile) {
      const fileExt = avatarFile.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, avatarFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        setError(uploadError.message);
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      avatar_url = urlData.publicUrl;
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({
        name: user.name,
        email: user.email,
        avatar_url,
      })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      alert("Profil berhasil diperbarui!");
      fetchProfile();
    }
    setLoading(false);
  };

  if (!user) {
    return <div className="p-6">Memuat profil...</div>;
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-2xl p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4 text-center">Profil Saya</h2>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <div className="flex flex-col items-center mb-4">
        <img
          src={
            avatarFile
              ? URL.createObjectURL(avatarFile)
              : user.avatar_url || "/default-avatar.png"
          }
          alt="avatar"
          className="w-24 h-24 rounded-full object-cover mb-3"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
        />
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium">Nama</label>
          <input
            type="text"
            value={user.name || ""}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            value={user.email || ""}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Nomor HP</label>
          <input
            type="text"
            value={user.phone || ""}
            disabled
            className="w-full border rounded-lg px-3 py-2 mt-1 bg-gray-100 text-gray-600 cursor-not-allowed"
          />
        </div>
      </div>

      <button
        onClick={handleUpdate}
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-2 rounded-lg mt-4 hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </div>
  );
}
