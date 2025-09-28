"use client";

import { Message, User, message_attachments } from "@/types";
import { MoreVertical, Loader2 } from "lucide-react";

interface ExtendedMessage extends Message {
  users?: User;
  message_attachments?: message_attachments[];
}

interface MessageItemProps {
  message: ExtendedMessage;
  isMine: boolean;
  messages: ExtendedMessage[];
  formatTime: (timestamp: string) => string;
  onSelect: (m: Message, isMine: boolean) => void;
}

export default function MessageItem({
  message,
  isMine,
  messages,
  formatTime,
  onSelect,
}: MessageItemProps) {
  const repliedMsg = message.reply_to
    ? messages.find((msg) => msg.id === message.reply_to)
    : null;

  const uploadingFiles = message.message_attachments?.filter((att) => att.uploading);

  return (
    <div
      className={`relative flex flex-col max-w-[70%] p-3 rounded-lg shadow-sm ${isMine ? "ml-auto bg-blue-500 text-white" : "mr-auto bg-gray-200 text-gray-900"
        }`}
    >
      <button
        onClick={() => onSelect(message, isMine)}
        className={`absolute top-2 ${isMine ? "-left-7" : "-right-7"
          } text-gray-500 hover:text-black`}
        aria-label="pesan actions"
      >
        <MoreVertical size={18} />
      </button>

      {!isMine && (
        <span className="font-medium text-sm mb-1">
          {message.users?.name || "Unknown"}
        </span>
      )}

      {repliedMsg && (
        <div
          className={`border-l-2 p-1 text-xs rounded mb-2 ${isMine
              ? "border-blue-200 bg-blue-400/30"
              : "border-blue-300 bg-white"
            }`}
        >
          <span className="block font-medium text-xs mb-1">
            {repliedMsg.users?.name || "Pengguna"}
          </span>
          {repliedMsg.content && (
            <span className="text-xs truncate block max-w-[150px]">
              {repliedMsg.content}
            </span>
          )}
        </div>
      )}

      {uploadingFiles && uploadingFiles.length > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <Loader2 size={16} className="animate-spin text-gray-500" />
          <span className="text-xs text-gray-500">Mengunggah file...</span>
        </div>
      )}

      {message.message_attachments
        ?.filter((att) => !att.uploading)
        .map((att) =>
          att.file_type === "image" ? (
            <img
              key={att.id}
              src={att.file_url}
              className="rounded-lg max-w-[200px] max-h-[200px] object-cover mb-2"
              alt="attachment"
            />
          ) : (
            <a
              key={att.id}
              href={att.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-sm mb-2"
            >
              Download File
            </a>
          )
        )}

      {message.content && (
        <span className="whitespace-pre-wrap break-words overflow-hidden text-wrap w-full">
          {message.content}
        </span>
      )}


      <span
        className={`text-xs mt-1 self-end ${isMine ? "text-blue-100" : "text-gray-600"
          }`}
      >
        {formatTime(message.created_at)}
      </span>
    </div>
  );
}
