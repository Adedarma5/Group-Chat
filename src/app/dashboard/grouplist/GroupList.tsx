"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Plus, Trash2 } from "lucide-react";
import CreateGroupModal from "@/components/modals/CreateGroupModal";

interface Group {
  id: number;
  name: string;
  avatar_url?: string | null;
  created_at: string;
}

interface GroupListProps {
  onSelectGroup: (id: number) => void;
}

export default function GroupList({ onSelectGroup }: GroupListProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [lastMessages, setLastMessages] = useState<Record<number, any>>({});
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    const { data, error } = await supabase
      .from("groups")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && data) setGroups(data as Group[]);
  };

  const fetchLastMessage = async (groupId: number) => {
    const { data: msg } = await supabase
      .from("messages")
      .select("content, user_id, created_at")
      .eq("group_id", groupId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (msg) {
      const { data: user } = await supabase
        .from("users")
        .select("name")
        .eq("id", msg.user_id)
        .single();

      setLastMessages((prev) => ({
        ...prev,
        [groupId]: { ...msg, user_name: user?.name || "Unknown" },
      }));
    }
  };

  useEffect(() => {
    if (groups.length === 0) return;

    groups.forEach((g) => fetchLastMessage(g.id));

    const channel = supabase
      .channel("sidebar-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMsg = payload.new as any;
          fetchLastMessage(newMsg.group_id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groups]);

  const handleDeleteGroup = async (groupId: number) => {
    const confirm = window.confirm("Apakah kamu yakin ingin menghapus grup ini?");
    if (!confirm) return;

    const { error } = await supabase.from("groups").delete().eq("id", groupId);

    if (error) {
      alert("Gagal menghapus grup: " + error.message);
    } else {
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
    }
  };

  const formatLastTime = (ts: string) => {
    const date = new Date(ts);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (isToday) {
      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } else if (isYesterday) {
      return "Kemarin";
    } else if (diffDays < 7) {
      return date.toLocaleDateString("id-ID", { weekday: "long" });
    } else {
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  };

  const filteredGroups = groups
    .filter((g) => g.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const aTime = lastMessages[a.id]?.created_at || a.created_at;
      const bTime = lastMessages[b.id]?.created_at || b.created_at;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });

  return (
    <div className="flex flex-col h-full border-r bg-white">
      <div className="flex items-center justify-between p-4">
        <h2 className="font-bold text-lg text-indigo-700">Binder</h2>
        <button
          onClick={() => setOpenModal(true)}
          className="p-2 rounded-full hover:bg-gray-200 transition"
          title="Tambah grup"
        >
          <Plus className="w-5 h-5 text-indigo-700" />
        </button>
      </div>

      <div className="px-4 pb-2">
        <input
          type="text"
          placeholder="Cari grup..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-full px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-indigo-300"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredGroups.map((g) => {
          const lastMsg = lastMessages[g.id];

          return (
            <div
              key={g.id}
              onClick={() => onSelectGroup(g.id)}
              className="p-4 flex items-center cursor-pointer hover:bg-gray-100"
            >
              {/* Avatar grup */}
              <div className="w-12 h-12 rounded-full mr-3 overflow-hidden bg-gray-300 flex items-center justify-center">
                {g.avatar_url ? (
                  <img
                    src={g.avatar_url}
                    alt={g.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-lg">
                    {g.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-bold truncate">{g.name}</div>
                {lastMsg && (
                  <div className="text-sm text-gray-600 truncate">
                    {lastMsg.user_name}: {lastMsg.content}
                  </div>
                )}
              </div>

              {lastMsg && (
                <div className="flex flex-col items-end ml-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteGroup(g.id);
                    }}
                    className="text-red-500 hover:text-red-700 mb-4"
                    title="Hapus grup"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="text-xs text-gray-500">
                    {formatLastTime(lastMsg.created_at)}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredGroups.length === 0 && (
          <div className="p-4 text-sm text-gray-500">
            Tidak ada grup ditemukan
          </div>
        )}
      </div>

      <CreateGroupModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onCreated={fetchGroups}
      />
    </div>
  );
}
