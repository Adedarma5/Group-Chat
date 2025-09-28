"use client";

import { Message, User, message_attachments } from "@/types";
import MessageItem from "./MessageItem";
import { Loader2 } from "lucide-react";

export interface ExtendedMessage extends Message {
  users?: User;
  message_attachments?: message_attachments[];
}

interface MessageListProps {
  messages: ExtendedMessage[];
  user: User | null;
  formatDateLabel: (timestamp: string) => string;
  formatTime: (timestamp: string) => string;
  onSelectMessage: (msg: Message, isMine: boolean) => void;
}

export default function MessageList({
  messages,
  user,
  formatDateLabel,
  formatTime,
  onSelectMessage,
}: MessageListProps) {
  return (
    <>
      {messages.map((m, i) => {
        const isMine = m.user_id === user?.id;
        const prevMsg = messages[i - 1];
        const showDateSeparator =
          !prevMsg ||
          new Date(prevMsg.created_at).toDateString() !==
            new Date(m.created_at).toDateString();

        const uniqueKey = `${m.id}-${m.created_at}-${i}`;
        const isPending = m.id.toString().startsWith("temp-"); 

        return (
          <div key={uniqueKey} data-message-date={m.created_at}>
            {showDateSeparator && (
              <div className="text-center text-xs text-gray-500 my-3">
                {formatDateLabel(m.created_at)}
              </div>
            )}

            <div className="relative">
              <MessageItem
                message={m}
                isMine={isMine}
                messages={messages}
                formatTime={formatTime}
                onSelect={onSelectMessage}
              />

              {isPending && isMine && (
                <Loader2
                  size={14}
                  className="absolute bottom-1 right-2 text-gray-400 animate-spin"
                />
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
