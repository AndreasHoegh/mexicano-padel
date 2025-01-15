"use client";

import { X } from "lucide-react";

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  scores: {
    [key: string]: {
      points: number;
      wins: number;
      matchesPlayed: number;
      pointsPerRound: (number | "sitout")[];
    };
  };
  sortedPlayers: [
    string,
    {
      points: number;
      wins: number;
      matchesPlayed: number;
      pointsPerRound: (number | "sitout")[];
    }
  ][];
  getRowColor: (index: number) => string;
}

export default function DetailsModal({
  isOpen,
  onClose,
  scores,
  sortedPlayers,
  getRowColor,
}: DetailsModalProps) {
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
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="w-full border-collapse table-auto">
              <thead className="bg-muted">
                <tr>
                  <th className="px-2 py-2 text-left">Player</th>
                  {scores[Object.keys(scores)[0]]?.pointsPerRound.map(
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
                {sortedPlayers.map(([name, stats], index) => (
                  <tr key={name} className={`${getRowColor(index)}`}>
                    <td className="px-2 py-2 whitespace-nowrap">{name}</td>
                    {stats.pointsPerRound.map((points, i) => (
                      <td key={i} className="px-2 py-2 text-center">
                        {points === "sitout" ? (
                          <span className="text-gray-500">sitout</span>
                        ) : points !== undefined ? (
                          points.toString()
                        ) : (
                          "—"
                        )}
                      </td>
                    ))}
                    <td className="px-2 py-2 text-center font-semibold">
                      {stats.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
