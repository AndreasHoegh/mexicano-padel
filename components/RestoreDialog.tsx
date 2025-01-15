"use client";

import { Button } from "./ui/button";

export default function RestoreDialog({
  onRestore,
  onNew,
}: {
  onRestore: () => void;
  onNew: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Restore Previous Tournament?
        </h2>
        <p className="text-gray-600">
          A previous tournament was found. Would you like to restore it or start
          a new one?
        </p>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            onClick={onRestore}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white"
          >
            Restore Previous
          </Button>
          <Button
            onClick={() => {
              onNew();
              window.location.reload();
            }}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
          >
            Start New
          </Button>
        </div>
      </div>
    </div>
  );
}
