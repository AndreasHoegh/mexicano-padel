import React, { useRef, useState } from "react";
import PlayerScores from "./PlayerScores";
import { X } from "lucide-react";
import { PlayerScore } from "../lib/types";

type ScoreboardProps = {
  isOpen: boolean;
  onClose: () => void;
  scores: {
    [key: string]: PlayerScore;
  };
  sortedPlayers: [string, PlayerScore][];
  getRowColor: (index: number) => string;
  onUpdateScores: (newScores: { [key: string]: PlayerScore }) => void;
};

const Scoreboard: React.FC<ScoreboardProps> = ({ isOpen, onClose, scores }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [translateX, setTranslateX] = useState(0);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const currentTouch = e.targetTouches[0].clientX;
    const diff = touchStart! - currentTouch;

    // Only allow dragging to the right (positive direction)
    if (diff < 0) {
      const newTranslate = Math.abs(diff);
      setTranslateX(newTranslate);
    }
  };

  const onTouchEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);

    if (translateX > minSwipeDistance) {
      onClose();
    }

    // Reset translation
    setTranslateX(0);
  };

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
        ref={panelRef}
        className={`fixed top-0 right-0 h-full bg-white dark:bg-gray-800 w-full max-w-md shadow-lg transform transition-transform duration-300 ease-in-out z-50 flex flex-col
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{
          transform: `translateX(${isDragging ? translateX : 0}px) ${
            isOpen ? "translateX(0)" : "translateX(100%)"
          }`,
          touchAction: "pan-y pinch-zoom",
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
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
