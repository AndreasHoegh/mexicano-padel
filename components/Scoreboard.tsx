import React from "react";
import PlayerScores from "./PlayerScores";
import { X } from "lucide-react";

interface ScoreboardProps {
  isOpen: boolean;
  onClose: () => void;
  scores: {
    [key: string]: {
      points: number;
      wins: number;
    };
  };
}

const Scoreboard: React.FC<ScoreboardProps> = ({ isOpen, onClose, scores }) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sliding Panel */}
      <div
        className={`fixed top-0 right-0 h-full bg-white dark:bg-gray-800 w-full max-w-md shadow-lg transform transition-transform duration-300 ease-in-out z-50 flex flex-col
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Tournament Standings
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <PlayerScores scores={scores} />
        </div>
      </div>
    </>
  );
};

export default Scoreboard;
