"use client";

import { Note } from "@/types";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Trash, Check, Plus, Edit, X } from "lucide-react";

interface NotesManagerProps {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  groupId: number;
}

function NoteItem({
  note,
  isEditing,
  onEditBlock,
  onAddBlock,
  onDeleteBlock,
  onSave,
  onDelete,
  onStartEdit,
  onCancelEdit,
  loading,
}: {
  note: Note;
  isEditing: boolean;
  onEditBlock: (noteId: number, blockIndex: number, text: string) => void;
  onAddBlock: (noteId: number) => void;
  onDeleteBlock: (noteId: number, blockIndex: number) => void;
  onSave: (noteId: number) => void;
  onDelete: (noteId: number) => void;
  onStartEdit: (noteId: number) => void;
  onCancelEdit: () => void;
  loading: boolean;
}) {
  return (
    <div className="relative w-full p-3 rounded-lg bg-gray-50">
      <div className="absolute top-2 left-2 flex gap-1 z-10">
        {!isEditing && (
          <>
            <button
              onClick={() => onStartEdit(note.id)}
              className="p-1 rounded hover:bg-gray-200 text-gray-600"
              title="Edit Note"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(note.id)}
              className="p-1 rounded hover:bg-gray-200 text-red-600"
              title="Hapus Note"
              disabled={loading}
            >
              <Trash className="w-4 h-4" />
            </button>
          </>
        )}

        {isEditing && (
          <>
            <button
              onClick={() => onSave(note.id)}
              className="p-1 rounded hover:bg-gray-200 text-green-600"
              title="Simpan Note"
              disabled={loading}
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={onCancelEdit}
              className="p-1 rounded hover:bg-gray-200 text-gray-600"
              title="Batal Edit"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={() => onAddBlock(note.id)}
              className="p-1 rounded hover:bg-gray-200 text-indigo-600"
              title="Tambah Blok"
            >
              <Plus className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {note.content.map((block, idx) => (
        <div key={idx} className="relative mb-2 mt-6">
          <textarea
            className={`p-3 rounded border w-full min-h-[60px] resize-none shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 overflow-hidden ${isEditing ? "bg-white" : "bg-gray-100"
              }`}
            value={block.text}
            readOnly={!isEditing}
            onChange={(e) => onEditBlock(note.id, idx, e.target.value)}
          />
          {isEditing && (
            <button
              className="absolute top-2 right-2 p-1 rounded hover:bg-gray-200 text-red-600"
              onClick={() => onDeleteBlock(note.id, idx)}
              title="Hapus Blok"
            >
              <Trash className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default function NotesManager({ notes, setNotes, groupId }: NotesManagerProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("group_id", groupId)
      .order("updated_at", { ascending: false });

    if (!error && data) {
      const parsedData = data.map((note) => ({
        ...note,
        content:
          typeof note.content === "string" ? JSON.parse(note.content) : note.content,
      }));
      setNotes(parsedData);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [groupId]);

  const handleAddNote = async () => {
    const newNote = {
      group_id: groupId,
      user_id: null,
      content: JSON.stringify([{ type: "text", text: "" }]),
      updated_at: new Date().toISOString(),
    };

    setLoading(true);
    const { data, error } = await supabase
      .from("notes")
      .insert([newNote])
      .select()
      .maybeSingle();
    setLoading(false);

    if (error) return console.error(error.message);
    if (data) {
      const parsedNote = { ...data, content: JSON.parse(data.content) };
      setNotes((prev) => [parsedNote, ...prev]);
      setEditingId(parsedNote.id);
    }
  };

  const handleEditBlock = (noteId: number, blockIndex: number, text: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId
          ? { ...n, content: n.content.map((b, i) => (i === blockIndex ? { ...b, text } : b)) }
          : n
      )
    );
    setEditingId(noteId);
  };

  const handleAddBlock = (noteId: number) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId ? { ...n, content: [...n.content, { type: "text", text: "" }] } : n
      )
    );
  };

  const handleDeleteBlock = (noteId: number, blockIndex: number) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId
          ? { ...n, content: n.content.filter((_, i) => i !== blockIndex) }
          : n
      )
    );
  };

  const handleSave = async (noteId: number) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    setLoading(true);
    const { error } = await supabase
      .from("notes")
      .update({ content: JSON.stringify(note.content), updated_at: new Date().toISOString() })
      .eq("id", noteId);
    setLoading(false);

    if (error) return console.error(error.message);
    setEditingId(null);
  };

  const handleDelete = async (noteId: number) => {
    setLoading(true);
    const { error } = await supabase.from("notes").delete().eq("id", noteId);
    setLoading(false);

    if (error) return console.error(error.message);
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    if (editingId === noteId) setEditingId(null);
  };

  const handleStartEdit = (noteId: number) => setEditingId(noteId);
  const handleCancelEdit = () => setEditingId(null);

  return (
    <div className="flex flex-col gap-4 outline-none">
      <div className="flex justify-start items-center">
        <button
          onClick={handleAddNote}
          className="mt-2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50"
          disabled={loading}
          title="Tambah Note"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {notes.map((note) => (
        <NoteItem
          key={note.id}
          note={note}
          isEditing={editingId === note.id}
          onEditBlock={handleEditBlock}
          onAddBlock={handleAddBlock}
          onDeleteBlock={handleDeleteBlock}
          onSave={handleSave}
          onDelete={handleDelete}
          onStartEdit={handleStartEdit}
          onCancelEdit={handleCancelEdit}
          loading={loading}
        />
      ))}
    </div>
  );
}
