"use client";

import { Paperclip } from "lucide-react";

interface FilePreviewProps {
  files: File[];
  onRemove: (idx: number) => void;
}

export default function FilePreview({ files, onRemove }: FilePreviewProps) {
  if (files.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3 bg-gray-100 rounded-lg p-2 relative">
      {files.map((file, idx) => (
        <div key={idx} className="relative flex flex-col items-start">
          {file.type.startsWith("image/") ? (
            <img
              src={URL.createObjectURL(file)}
              alt="preview"
              className="h-24 w-24 rounded-lg object-cover mb-1"
            />
          ) : (
            <div className="flex items-center gap-2 bg-white p-2 rounded-lg mb-1">
              <Paperclip size={18} className="text-gray-600" />
              <span className="text-sm text-gray-700 truncate max-w-[100px]">
                {file.name}
              </span>
            </div>
          )}
          <button
            onClick={() => onRemove(idx)}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
