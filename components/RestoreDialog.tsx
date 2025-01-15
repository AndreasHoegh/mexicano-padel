"use client";

import { Button } from "./ui/button";

interface RestoreDialogProps {
  onRestore: () => void;
  onNew: () => void;
}

export default function RestoreDialog({
  onRestore,
  onNew,
}: RestoreDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full space-y-4">
        <h2 className="text-xl font-semibold">Previous Tournament Found</h2>
        <p className="text-gray-600">
          Would you like to restore the previous tournament or start a new one?
        </p>
        <div className="flex gap-3">
          <Button
            onClick={onRestore}
            className="flex-1 bg-green-500 hover:bg-green-600"
          >
            Restore Tournament
          </Button>
          <Button
            onClick={() => {
              onNew();
              window.location.reload();
            }}
            className="flex-1 bg-blue-500 hover:bg-blue-600"
          >
            New Tournament
          </Button>
        </div>
      </div>
    </div>
  );
}
