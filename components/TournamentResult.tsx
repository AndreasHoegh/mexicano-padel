// padel-americano/components/TournamentResult.tsx
import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Tournament } from "../lib/types";

interface TournamentResultProps {
  tournament: Tournament;
}

const TournamentResult: React.FC<TournamentResultProps> = ({ tournament }) => {
  // Parse the scores JSON string stored in the tournament record.
  let results: Record<string, any> | null = null;
  try {
    results = JSON.parse(tournament.scoresJson);
  } catch (error) {
    console.error("Error parsing tournament scores:", error);
  }

  // New state for sorting criteria: "points" or "wins"
  const [sortBy, setSortBy] = useState<"points" | "wins">("points");
  // New state to control expand/collapse of tournament details
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-gray-300 bg-white/20 p-4 my-4 rounded">
      <div
        className="flex items-center justify-between mb-2 cursor-pointer"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <h4 className="text-xl font-bold">
          {tournament.tournamentName}{" "}
          <span className="text-sm">
            ({new Date(tournament.tournamentDate).toLocaleDateString()})
          </span>
        </h4>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-white" />
        ) : (
          <ChevronDown className="w-5 h-5 text-white" />
        )}
      </div>

      {isExpanded && (
        <>
          {/* Sorting Options */}
          <div className="flex space-x-2 mb-4">
            <button
              className={`px-2 py-1 border rounded ${
                sortBy === "points"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-200 text-black"
              }`}
              onClick={() => setSortBy("points")}
            >
              Sort by Points
            </button>
            <button
              className={`px-2 py-1 border rounded ${
                sortBy === "wins"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-200 text-black"
              }`}
              onClick={() => setSortBy("wins")}
            >
              Sort by Wins
            </button>
          </div>
          {results ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr>
                    <th className="border px-2 py-1">Player</th>
                    <th className="border px-2 py-1">Points</th>
                    <th className="border px-2 py-1">Wins</th>
                    <th className="border px-2 py-1">Matches Played</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(results)
                    .sort(([, dataA], [, dataB]) => {
                      if (sortBy === "points") {
                        if (dataB.points === dataA.points) {
                          return dataB.wins - dataA.wins;
                        }
                        return dataB.points - dataA.points;
                      } else {
                        // sortBy === "wins"
                        if (dataB.wins === dataA.wins) {
                          return dataB.points - dataA.points;
                        }
                        return dataB.wins - dataA.wins;
                      }
                    })
                    .map(([player, data]: [string, any]) => (
                      <tr key={player}>
                        <td className="border px-2 py-1">{player}</td>
                        <td className="border px-2 py-1">{data.points}</td>
                        <td className="border px-2 py-1">{data.wins}</td>
                        <td className="border px-2 py-1">
                          {data.matchesPlayed}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Unable to display results.</p>
          )}
        </>
      )}
    </div>
  );
};

export default TournamentResult;
