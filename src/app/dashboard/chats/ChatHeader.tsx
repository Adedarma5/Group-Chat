"use client";

import { useEffect, useState } from "react";
import { Settings } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface ChatHeaderProps {
  groupId: number;
  onToggleNotes: () => void;
  onOpenSettings?: () => void;
}
export default function ChatHeader({ groupId, onToggleNotes, onOpenSettings }: ChatHeaderProps) {
  const [groupName, setGroupName] = useState<string>("Group Chat");
  const [memberCount, setMemberCount] = useState<number>(0);


  useEffect(() => {
    const fetchGroupData = async () => {
      const { data: group } = await supabase
        .from("groups")
        .select("name")
        .eq("id", groupId)
        .single();

      if (group) setGroupName(group.name);

      const { count } = await supabase
        .from("group_members")
        .select("*", { count: "exact" })
        .eq("group_id", groupId);

      if (count !== null) setMemberCount(count);
    };

    fetchGroupData();
  }, [groupId]);

  return (
    <div className="flex justify-between items-center p-4 border border-gray-200">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="font-bold text-lg">{groupName}</h2>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          className="p-2 rounded-full hover:bg-gray-200 transition"
          onClick={onToggleNotes}
        >
          <Settings className="w-5 h-5 text-indigo-700" />
        </button>

        {onOpenSettings && (
          <button
            className="px-3 py-1 bg-gray-300 text-black rounded text-sm"
            onClick={onOpenSettings}
          >
            Settings
          </button>
        )}
      </div>
    </div>
  );
}
