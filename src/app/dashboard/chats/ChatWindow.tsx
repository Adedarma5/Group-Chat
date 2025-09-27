"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import ChatHeader from "./ChatHeader";
import ChatDetail from "./ChatDetail";
import { Message, User, Group } from "@/types";
import { Paperclip, Send, Loader2 } from "lucide-react";
import MessageActionsModal from "@/components/modals/MessageActionsModal";
import MessageList from "@/components/chat/MessageList";
import ReplyPreview from "@/components/chat/ReplyPreview";
import FilePreview from "@/components/chat/FilePreview";

// Tipe attachment Supabase
interface MessageAttachment {
  id: number;
  message_id: number;
  file_url: string;
  file_type: "image" | "file";
  uploading?: boolean;
}

// Message dengan relasi
interface MessageWithRelations extends Message {
  users?: User;
  message_attachments?: MessageAttachment[];
}

// Tipe payload Supabase channel
interface SupabaseInsertPayload<T> {
  new: T;
}

interface ChatWindowProps {
  groupId: number | null;
  user: User | null;
}

export default function ChatWindow({ groupId, user }: ChatWindowProps) {
  const [messages, setMessages] = useState<MessageWithRelations[]>([]);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [showDetail, setShowDetail] = useState(false);
  const [group, setGroup] = useState<Group | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [actionTarget, setActionTarget] = useState<{ message: Message | null; isMine: boolean }>({
    message: null,
    isMine: false,
  });
  const [showActions, setShowActions] = useState(false);
  const [sendingFiles, setSendingFiles] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const formatDateLabel = (timestamp: string) =>
    new Date(timestamp).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

  // Fetch messages dan subscribe ke channel
  useEffect(() => {
    if (!groupId || !user) return;
    let active = true;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select(
          `
          *,
          users(id, name, email),
          message_attachments(id, message_id, file_url, file_type)
          `
        )
        .eq("group_id", groupId)
        .order("created_at", { ascending: true });

      if (!error && active) setMessages((data as MessageWithRelations[]) || []);
    };
    fetchMessages();

    const channel = supabase
      .channel(`group-messages-${groupId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `group_id=eq.${groupId}` },
        async (payload: SupabaseInsertPayload<Message>) => {
          const { data: userData } = await supabase
            .from("users")
            .select("id, name, email")
            .eq("id", payload.new.user_id)
            .single();

          const newMessage: MessageWithRelations = {
            ...payload.new,
            users: userData || undefined,
            message_attachments: [],
          };

          setMessages((prev) =>
            prev.some((m) => m.id === newMessage.id) ? prev : [...prev, newMessage]
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "message_attachments" },
        (payload: SupabaseInsertPayload<MessageAttachment>) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.message_id
                ? {
                    ...msg,
                    message_attachments: [
                      ...(msg.message_attachments || []),
                      { ...payload.new, uploading: false },
                    ],
                  }
                : msg
            )
          );
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [groupId, user]);

  // Fetch group info
  useEffect(() => {
    if (!groupId) return;

    const fetchGroup = async () => {
      const { data } = await supabase
        .from("groups")
        .select("id, name, description, created_by")
        .eq("id", groupId)
        .single();

      if (data) setGroup(data as Group);
    };

    fetchGroup();
  }, [groupId]);

  // Auto scroll ke pesan terakhir
  useEffect(() => {
    if (!messagesEndRef.current) return;
    messagesEndRef.current.scrollIntoView({
      behavior: messages.length > 50 ? "auto" : "smooth",
    });
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    if ((!input.trim() && files.length === 0) || !groupId || !user) return;
    const hasFiles = files.length > 0;
    if (hasFiles) setSendingFiles(true);

    try {
      const { data: message, error: msgError } = await supabase
        .from("messages")
        .insert([
          {
            group_id: groupId,
            user_id: user.id,
            content: input.trim(),
            reply_to: replyingTo ? replyingTo.id : null,
          },
        ])
        .select()
        .single();

      if (msgError || !message) throw msgError;
      setInput("");
      setReplyingTo(null);

      if (hasFiles) {
        for (const file of files) {
          const filePath = `group_${groupId}/${Date.now()}_${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from("message_attachments")
            .upload(filePath, file);

          if (uploadError) continue;

          const { data: { publicUrl } } = supabase.storage
            .from("message_attachments")
            .getPublicUrl(filePath);

          await supabase.from("message_attachments").insert({
            message_id: message.id,
            file_url: publicUrl,
            file_type: file.type.startsWith("image/") ? "image" : "file",
          });
        }
      }

      setFiles([]);
    } catch (err) {
      console.error("Send error:", err);
    } finally {
      if (hasFiles) setSendingFiles(false);
    }
  };

  const handleReply = () => {
    if (actionTarget.message) setReplyingTo(actionTarget.message);
    setShowActions(false);
  };

  const handleDelete = async () => {
    if (!actionTarget.message) return;
    try {
      const { data: attachments } = await supabase
        .from("message_attachments")
        .select("id, file_url")
        .eq("message_id", actionTarget.message.id);

      if (attachments) {
        for (const att of attachments) {
          try {
            const filePath = att.file_url.split("/").slice(-2).join("/");
            await supabase.storage.from("message_attachments").remove([filePath]);
          } catch (err) {}
        }
      }

      await supabase.from("messages").delete().eq("id", actionTarget.message.id);

      setMessages((prev) => prev.filter((msg) => msg.id !== actionTarget.message?.id));
    } finally {
      setShowActions(false);
    }
  };

  if (!groupId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Pilih grup untuk memulai chat
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full relative bg-white">
      <ChatHeader groupId={groupId} onToggleNotes={() => setShowDetail((prev) => !prev)} />
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <MessageList
          messages={messages}
          user={user}
          formatDateLabel={formatDateLabel}
          formatTime={formatTime}
          onSelectMessage={(m: Message, isMine: boolean) => {
            setActionTarget({ message: m, isMine });
            setShowActions(true);
          }}
        />
        {sendingFiles && (
          <div className="flex justify-end">
            <div className="bg-blue-500 text-white px-4 py-2 rounded-2xl max-w-xs flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Mengunggah file...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ReplyPreview replyingTo={replyingTo} onCancel={() => setReplyingTo(null)} />
      <FilePreview
        files={files}
        onRemove={(i) => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
      />

      <div className="p-4 flex items-center gap-2 border-t bg-white">
        <label className="cursor-pointer text-gray-600 hover:text-blue-500">
          <Paperclip size={22} />
          <input
            type="file"
            multiple
            onChange={(e) =>
              setFiles((prev) => [
                ...prev,
                ...(e.target.files ? Array.from(e.target.files) : []),
              ])
            }
            className="hidden"
          />
        </label>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Tulis pesan..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-blue-400 text-sm"
        />

        <button
          onClick={sendMessage}
          className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition"
        >
          <Send size={20} />
        </button>
      </div>

      {showDetail && group && (
        <div className="absolute inset-0 bg-white shadow-lg z-10 overflow-y-auto">
          <ChatDetail group={group} onClose={() => setShowDetail(false)} />
        </div>
      )}

      <MessageActionsModal
        isOpen={showActions}
        onClose={() => setShowActions(false)}
        onReply={handleReply}
        onDelete={handleDelete}
        isMine={actionTarget.isMine}
      />
    </div>
  );
}
