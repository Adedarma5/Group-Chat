"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { X } from "lucide-react";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateGroupModal({
  isOpen,
  onClose,
  onCreated,
}: CreateGroupModalProps) {
  const [form, setForm] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");

  const uploadAvatar = async (file: File) => {
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from("group-avatars")
      .upload(fileName, file, { upsert: true });

    if (error) {
      setError("Gagal upload gambar grup");
      return null;
    }

    const { data: publicData } = supabase.storage
      .from("group-avatars")
      .getPublicUrl(fileName);

    return publicData.publicUrl;
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return setError("Nama grup wajib diisi");
    setLoading(true);
    setError("");

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    let uploadedUrl = avatarUrl;
    if (avatarFile) {
      const url = await uploadAvatar(avatarFile);
      if (!url) {
        setLoading(false);
        return;
      }
      uploadedUrl = url;
    }

    const { error: insertError } = await supabase.from("groups").insert([
      {
        name: form.name,
        description: form.description,
        avatar_url: uploadedUrl,
        created_by: user.id,
      },
    ]);

    setLoading(false);

    if (insertError) setError(insertError.message);
    else {
      setForm({ name: "", description: "" });
      setAvatarFile(null);
      setAvatarUrl("");
      onCreated();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Buat Grup Baru</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-black" />
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <input
          type="text"
          placeholder="Nama grup..."
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full p-2 rounded-lg border bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
        />
        <textarea
          placeholder="Deskripsi (opsional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full p-2 rounded-lg border bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
          rows={3}
        />

        <div className="flex flex-col gap-2 mb-3">
          <label className="text-sm font-medium">Gambar Grup (opsional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) setAvatarFile(e.target.files[0]);
            }}
          />
          {avatarFile && (
            <p className="text-sm text-gray-500">{avatarFile.name}</p>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm bg-gray-200 hover:bg-gray-300"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
