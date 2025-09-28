"use client";

import { useState, useEffect } from "react";
import { User } from "@/types";
import GroupList from "@/app/dashboard/grouplist/GroupList";
import ChatWindow from "@/app/dashboard/chats/ChatWindow";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed: User = JSON.parse(storedUser);
        setUser(parsed);
      } catch (err) {
        console.error("Invalid user data in localStorage:", err);
      }
    }
  }, []);

  if (!user) {
    return <div className="flex-1 flex items-center justify-center text-gray-400">Loading user...</div>;
  }

  return (
    <div className="flex h-full w-full">
      <div className="w-96 border-r overflow-y-auto">
        <GroupList onSelectGroup={(id: number) => setSelectedGroupId(id)} />
      </div>

      <div className="flex-1 flex flex-col bg-white">
        <ChatWindow groupId={selectedGroupId} user={user} />
      </div>
    </div>
  );
}
