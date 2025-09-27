import React from "react";
import { supabase } from "@/lib/supabaseClient";
import { Group } from "@/types";
import ChatDetail from "@/app/dashboard/chats/ChatDetail";

interface ChatDetailPageProps {
  params: Promise<{ groupId: string }>;
}

export default async function ChatDetailPage({ params }: ChatDetailPageProps) {
  const { groupId } = await params; 
  const groupIdNum = Number(groupId);

  if (isNaN(groupIdNum)) return <div>Invalid group</div>;

const { data: group, error } = await supabase
  .from("groups")
  .select("*")
  .eq("id", groupIdNum)
  .maybeSingle();


  if (error) {
    console.error("Supabase fetch error:", error);
    return <div>Error fetching group</div>;
  }

  if (!group) return <div>Loading...</div>;

  return <ChatDetail group={group as Group} />;
}
