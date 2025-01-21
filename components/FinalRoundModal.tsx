import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Trophy, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type FinalRoundModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function FinalRoundModal({
  isOpen,
  onClose,
  onConfirm,
}: FinalRoundModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>Start Final Round</DialogTitle>
        <DialogDescription>
          Are you ready to start the final round? This will pair players based
          on their current rankings.
        </DialogDescription>
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          onClick={onClose}
        />
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-2xl max-w-md w-full p-6 border border-yellow-500/20">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-yellow-500">
                <AlertTriangle className="h-6 w-6" />
                <h2 className="text-xl font-bold text-yellow-500">
                  Final Round
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="bg-yellow-500/10 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                  This will:
                </h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    Sort players by points
                  </li>
                  <li className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    Match top 4 players together
                  </li>
                  <li className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    End the tournament after this round
                  </li>
                </ul>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-gray-600 hover:bg-gray-700 text-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  Start Final Round
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
