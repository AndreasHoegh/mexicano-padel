import { useState } from "react";
import { Button } from "./ui/button";
import { Trophy, Target } from "lucide-react";

interface PlayerScoresProps {
  scores: {
    [key: string]: {
      points: number;
      wins: number;
    };
  };
}

export default function PlayerScores({ scores }: PlayerScoresProps) {
  const [sortBy, setSortBy] = useState<"points" | "wins">("points");

  const sortedPlayers = Object.entries(scores).sort((a, b) => {
    if (sortBy === "points") {
      return b[1].points - a[1].points;
    }
    if (b[1].wins === a[1].wins) {
      return b[1].points - a[1].points;
    }
    return b[1].wins - a[1].wins;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-2">
        <Button
          onClick={() => setSortBy("points")}
          variant={sortBy === "points" ? "default" : "outline"}
          className="flex items-center gap-2"
        >
          <Trophy className="h-4 w-4" />
          Sort by Points
        </Button>
        <Button
          onClick={() => setSortBy("wins")}
          variant={sortBy === "wins" ? "default" : "outline"}
          className="flex items-center gap-2"
        >
          <Target className="h-4 w-4" />
          Sort by Wins
        </Button>
      </div>

      <div className="space-y-2">
        {sortedPlayers.map(([name, stats], index) => (
          <div
            key={name}
            className="flex justify-between items-center p-2 bg-white rounded-lg shadow"
          >
            <span className="font-medium">
              {index + 1}. {name}
            </span>
            <div className="space-x-4">
              <span className="text-yellow-600">
                {stats.wins} {stats.wins === 1 ? "win" : "wins"}
              </span>
              <span className="text-blue-600">{stats.points} points</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
