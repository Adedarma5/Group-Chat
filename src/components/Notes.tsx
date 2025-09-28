"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import { Note } from "@/types";


type NoteWithBlocks = Omit<Note, "content"> & {
  content: { blocks: { text: string }[] };
};

export default function NotesPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = Number(params.groupId);
  const [notes, setNotes] = useState<NoteWithBlocks[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      const { data } = await supabase
        .from("notes")
        .select("*")
        .eq("group_id", groupId);

      setNotes((data as NoteWithBlocks[]) || []);
      setLoading(false);
    };
    fetchNotes();
  }, [groupId]);

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;

  return (
    <div className="p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Notes</h1>
      {notes.length === 0 ? (
        <p className="text-gray-500">No notes</p>
      ) : (
        <ul className="list-disc pl-5">
          {notes.map((n) => (
            <li key={n.id}>{n.content.blocks[0]?.text ?? "Empty note"}</li>
          ))}
        </ul>
      )}
      <button
        className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        onClick={() => router.back()}
      >
        Back to Chat
      </button>
    </div>
  );
}
