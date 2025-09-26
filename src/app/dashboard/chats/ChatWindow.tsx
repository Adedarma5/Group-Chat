"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import ChatHeader from "./ChatHeader";
import { Message, User, Group } from "@/types";
import ChatDetail from "./ChatDetail";

interface ChatWindowProps {
  groupId: number | null;
  user: User | null;
}

export default function ChatWindow({ groupId, user }: ChatWindowProps) {
  const [messages, setMessages] = useState<(Message & { users?: User })[]>([]);
  const [input, setInput] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [group, setGroup] = useState<Group | null>(null);
  const [activeDate, setActiveDate] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!groupId || !user) return;
    let active = true;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*, users(id, name, email)")
        .eq("group_id", groupId)
        .order("created_at", { ascending: true });

      if (!error && active) {
        setMessages((data as (Message & { users?: User })[]) || []);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel(`group-messages-${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `group_id=eq.${groupId}`,
        },
        async (payload) => {
          const { data: userData } = await supabase
            .from("users")
            .select("id, name, email")
            .eq("id", payload.new.user_id)
            .single();

          const newMessage: Message & { users?: User } = {
            ...(payload.new as Message),
            users: (userData as User) || undefined,
          };

          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [groupId, user]);

  useEffect(() => {
    if (!groupId) return;

    const fetchGroup = async () => {
      const { data, error } = await supabase
        .from("groups")
        .select("id, name, description, created_by")
        .eq("id", groupId)
        .single();

      if (!error && data) {
        setGroup(data as Group);
      }
    };

    fetchGroup();
  }, [groupId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !groupId || !user) return;

    const { error } = await supabase.from("messages").insert([
      {
        group_id: groupId,
        user_id: user.id,
        content: input.trim(),
      },
    ]);

    if (!error) setInput("");
  };



  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta",
    });

  const formatDateLabel = (timestamp: string): string => {
    const today = new Date();
    const date = new Date(timestamp);

    const isToday = date.toDateString() === today.toDateString();

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return "Hari ini";
    if (isYesterday) return "Kemarin";

    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const children = containerRef.current.querySelectorAll<HTMLDivElement>(
      "[data-message-date]"
    );

    let currentDate: string | null = null;
    for (const el of Array.from(children)) {
      const rect = el.getBoundingClientRect();
      if (rect.top >= 80) {
        currentDate = el.dataset.messageDate || null;
        break;
      }
    }

    if (currentDate) setActiveDate(formatDateLabel(currentDate));
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [messages, handleScroll]);

  if (!groupId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Select a group
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full relative bg-white">
      <ChatHeader
        groupId={groupId}
        onToggleNotes={() => setShowDetail((prev) => !prev)}
      />

      {activeDate && (
        <div className="absolute top-25 left-1/2 -translate-x-1/2 z-10">
          <span className=" text-black bg-white text-xs font-medium px-3 py-1 rounded-full shadow-xl ">
            {activeDate}
          </span>
        </div>
      )}

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
      >
        {messages.map((m, i) => {
          const isMine = m.user_id === user?.id;

          const prevMsg = messages[i - 1];
          const showDateSeparator =
            !prevMsg ||
            new Date(prevMsg.created_at).toDateString() !==
            new Date(m.created_at).toDateString();

          return (
            <div key={m.id} data-message-date={m.created_at}>
              {showDateSeparator && (
                <div className="text-center text-xs text-gray-500 my-3">
                  {formatDateLabel(m.created_at)}
                </div>
              )}

              <div
                className={`flex flex-col max-w-[70%] p-3 rounded-lg shadow-sm ${isMine
                    ? "ml-auto bg-blue-500 text-white"
                    : "mr-auto bg-gray-200 text-gray-900"
                  }`}
              >
                {!isMine && (
                  <span className="font-medium text-sm mb-1">
                    {m.users?.name || "Unknown"}
                  </span>
                )}
                <span>{m.content}</span>
                <span
                  className={`text-xs mt-1 self-end ${isMine ? "text-blue-100" : "text-gray-600"
                    }`}
                >
                  {formatTime(m.created_at)}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 flex gap-2 border-t bg-white">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Tulis pesan..."
          className="flex-1 bg-gray-100 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
        >
          Kirim
        </button>
      </div>

      {showDetail && group && (
        <div className="absolute inset-0 bg-white shadow-lg z-10 overflow-y-auto">
          <ChatDetail group={group}  onClose={() => setShowDetail(false)} />
        </div>
      )}
    </div>
  );
}
