"use client";

import { Group, Note } from "@/types";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import NotesManager from "./NotesManager";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface ChatDetailProps {
  group: Group;
  onClose?: () => void;
}

export default function ChatDetail({ group, onClose }: ChatDetailProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchNotes = async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("group_id", group.id);
      if (!error && data) {
        const parsed = data.map((note) => ({
          ...note,
          content:
            typeof note.content === "string" && note.content
              ? (() => {
                try {
                  return JSON.parse(note.content);
                } catch {
                  return [];
                }
              })()
              : note.content || [],
        }));
        setNotes(parsed);

      }
    };
    fetchNotes();
  }, [group.id]);

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex items-center gap-3 pb-2  ">
        <button
          onClick={onClose}
          className="px-3 py-1  "
        >
          <ArrowLeft />
        </button>

        <h1 className="text-xl font-bold">{group.name}</h1>
      </div>
      <p className="font-semibold">
        Deskripsi: {group.description}
      </p>

      <div>
        <h2 className="text-lg font-semibold mb-2">Notes</h2>
        <NotesManager notes={notes} setNotes={setNotes} groupId={group.id} />
      </div>
    </div>
  );
}
