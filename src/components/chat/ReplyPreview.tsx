"use client";

import { Message } from "@/types";

interface ReplyPreviewProps {
  replyingTo: Message | null;
  onCancel: () => void;
}

export default function ReplyPreview({ replyingTo, onCancel }: ReplyPreviewProps) {
  if (!replyingTo) return null;

  return (
    <div className="flex items-center justify-between bg-gray-100 border-l-4 border-blue-500 px-3 py-2 rounded relative">
      <div className="text-sm text-gray-700 truncate">
        Membalas: {replyingTo.content || "Media"}
      </div>
      <button
        onClick={onCancel}
        className="ml-3 text-red-500 hover:text-red-600"
      >
        ✕
      </button>
    </div>
  );
}
