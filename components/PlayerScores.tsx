"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, Target } from "lucide-react";
import DetailsModal from "./DetailsModal";

interface PlayerScoresProps {
  scores: {
    [key: string]: {
      points: number;
      wins: number;
      matchesPlayed: number;
      pointsPerRound: (number | "sitout")[];
    };
  };
}

export default function PlayerScores({ scores }: PlayerScoresProps) {
  const [sortBy, setSortBy] = useState<"points" | "wins">("points");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortedPlayers, setSortedPlayers] = useState<
    [string, PlayerScoresProps["scores"][string]][]
  >([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    const sorted = Object.entries(scores)
      .filter(([name]) => name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === "points") {
          if (a[1].points !== b[1].points) {
            return b[1].points - a[1].points;
          }
          return b[1].wins - a[1].wins;
        } else {
          if (a[1].wins !== b[1].wins) {
            return b[1].wins - a[1].wins;
          }
          return b[1].points - a[1].points;
        }
      });
    setSortedPlayers(sorted);
  }, [scores, sortBy]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 0:
        return "🥇";
      case 1:
        return "🥈";
      case 2:
        return "🥉";
      default:
        return `${rank + 1}`;
    }
  };

  const getRowColor = (index: number) => {
    if (index === 0) return "bg-yellow-100 dark:bg-yellow-900";
    if (index === 1) return "bg-gray-100 dark:bg-gray-800";
    if (index === 2) return "bg-orange-100 dark:bg-orange-900";
    return index % 2 === 0
      ? "bg-white dark:bg-gray-950"
      : "bg-gray-50 dark:bg-gray-900";
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={() => setSortBy("points")}
            variant={sortBy === "points" ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-2 flex-1 sm:flex-auto"
          >
            <Trophy className="h-4 w-4" />
            Points
          </Button>
          <Button
            onClick={() => setSortBy("wins")}
            variant={sortBy === "wins" ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-2 flex-1 sm:flex-auto"
          >
            <Target className="h-4 w-4" />
            Wins
          </Button>
          <Button
            onClick={() => setIsDetailsOpen(true)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            View Details
          </Button>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse table-auto">
          <thead className="bg-muted">
            <tr>
              <th className=" py-1 text-left whitespace-nowrap">Rank</th>
              <th className="px-1 py-2 text-left">Player</th>
              <th className="px-1 py-2 text-center whitespace-nowrap">
                Matches
              </th>
              <th className="px-1 py-2 text-center whitespace-nowrap">Wins</th>
              <th className=" py-2 text-center whitespace-nowrap">Points</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map(([name, stats], index) => (
              <tr
                key={name}
                className={`${getRowColor(
                  index
                )} transition-colors hover:bg-muted`}
              >
                <td className="px-2 py-2 text-center font-bold whitespace-nowrap">
                  {getRankIcon(index)}
                </td>
                <td className="px-2 py-2">
                  <div className="truncate max-w-[150px]" title={name}>
                    {name}
                  </div>
                </td>
                <td className="px-2 py-2 text-center whitespace-nowrap">
                  {stats.matchesPlayed}
                </td>
                <td className="px-2 py-2 text-center font-semibold text-green-600 whitespace-nowrap">
                  {stats.wins}
                </td>
                <td className="px-2 py-2 text-center font-semibold text-primary whitespace-nowrap">
                  {stats.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        scores={scores}
        sortedPlayers={sortedPlayers}
        getRowColor={getRowColor}
      />
    </div>
  );
}
