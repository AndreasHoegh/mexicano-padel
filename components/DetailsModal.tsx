"use client";

import { X, Pencil, Check } from "lucide-react";
import { useState, useEffect } from "react";

type PlayerScore = {
  points: number;
  wins: number;
  matchesPlayed: number;
  pointsPerRound: (number | "sitout")[];
};

type DetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  scores: {
    [key: string]: PlayerScore;
  };
  sortedPlayers: [string, PlayerScore][];
  getRowColor: (index: number) => string;
  onUpdateScores?: (newScores: { [key: string]: PlayerScore }) => void;
};

export default function DetailsModal({
  isOpen,
  onClose,
  scores,
  sortedPlayers,
  getRowColor,
  onUpdateScores,
}: DetailsModalProps) {
  const [localScores, setLocalScores] = useState(scores);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    setLocalScores(scores);
  }, [scores]);

  const handleScoreEdit = (
    playerName: string,
    roundIndex: number,
    value: string
  ) => {
    const newScores = { ...localScores };
    const newValue = value === "" ? ("sitout" as const) : Number(value);
    newScores[playerName].pointsPerRound[roundIndex] = newValue;

    // Update local state immediately
    setLocalScores(newScores);

    // Update global state - only sum numeric values
    newScores[playerName].points = newScores[
      playerName
    ].pointsPerRound.reduce<number>(
      (sum, score) => (typeof score === "number" ? sum + score : sum),
      0
    );
    onUpdateScores?.(newScores);
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold">Detailed Score History</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
                  transition-all duration-200 shadow-sm
                  ${
                    isEditMode
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700"
                  }
                `}
              >
                {isEditMode ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                ) : (
                  <>
                    <Pencil className="h-4 w-4" />
                    <span>Edit Scores</span>
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="w-full border-collapse table-auto">
              <thead className="bg-muted">
                <tr>
                  <th className="px-2 py-2 text-left">Player</th>
                  {localScores[Object.keys(localScores)[0]]?.pointsPerRound.map(
                    (_, i) => (
                      <th
                        key={i}
                        className="px-2 py-2 text-center whitespace-nowrap"
                      >
                        Round {i + 1}
                      </th>
                    )
                  )}
                  <th className="px-2 py-2 text-center whitespace-nowrap">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedPlayers.map(([name], index) => {
                  const localStats = localScores[name];
                  return (
                    <tr key={name} className={`${getRowColor(index)}`}>
                      <td className="px-2 py-2 whitespace-nowrap">{name}</td>
                      {localStats.pointsPerRound.map((points, i) => (
                        <td key={i} className="px-2 py-2 text-center">
                          {isEditMode ? (
                            <input
                              type="number"
                              value={points === "sitout" ? "" : points || ""}
                              onChange={(e) =>
                                handleScoreEdit(name, i, e.target.value)
                              }
                              onFocus={(e) => e.target.select()}
                              className="w-12 text-center border rounded"
                              min="0"
                              max={21}
                            />
                          ) : (
                            <span>{points === "sitout" ? "—" : points}</span>
                          )}
                        </td>
                      ))}
                      <td className="px-2 py-2 text-center font-semibold">
                        {localStats.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
