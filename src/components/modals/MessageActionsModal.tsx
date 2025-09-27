interface MessageActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReply: () => void;
  onDelete: () => void;
  isMine: boolean;
}

export default function MessageActionsModal({
  isOpen,
  onClose,
  onReply,
  onDelete,
  isMine,
}: MessageActionsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-48 overflow-hidden transform transition-all scale-100">
        <div className="flex flex-col divide-y">
          <button
            onClick={() => {
              onReply();
              onClose();
            }}
            className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm font-medium"
          >
            Reply
          </button>

          {isMine && (
            <button
              onClick={() => {
                onDelete();
                onClose();
              }}
              className="w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100 text-sm font-medium"
            >
              Delete
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm text-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
