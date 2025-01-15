import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import padelIcon from "../app/assets/padelIcon.png";
import { MatchCard } from "./MatchCard";

interface Match {
  team1: string[];
  team2: string[];
  team1Score: number;
  team2Score: number;
  isScoreSubmitted: boolean;
  team1Name?: string;
  team2Name?: string;
}

interface EditingScores {
  [key: number]: {
    team1: number;
    team2: number;
  };
}

interface Court {
  id: number;
  name: string;
}

interface MatchesProps {
  matches: Match[];
  scores: {
    [key: string]: {
      points: number;
      wins: number;
      matchesPlayed: number;
      pointsPerRound: (number | "sitout")[];
    };
  };
  onUpdateMatches: (updatedMatches: Match[]) => void;
  onUpdateScores: (updatedScores: {
    [key: string]: {
      points: number;
      wins: number;
      matchesPlayed: number;
      pointsPerRound: (number | "sitout")[];
    };
  }) => void;
  round: number;
  onNextRound: () => void;
  pointsPerMatch: number;
  isLastRound: boolean;
  courts: Court[];
  mode: "individual" | "team";
  sittingOutPlayers: string[];
  onStartFinalRound: (editingScores: EditingScores) => void;
}

export default function Matches({
  matches,
  scores,
  onUpdateMatches,
  onUpdateScores,
  round,
  onNextRound,
  pointsPerMatch,
  isLastRound,
  courts,
  mode,
  sittingOutPlayers,
  onStartFinalRound,
}: MatchesProps) {
  console.log("Rendering Matches Component");
  console.log("Matches:", matches);

  const [editingScores, setEditingScores] = useState<EditingScores>({});
  const [openPopovers, setOpenPopovers] = useState<{ [key: string]: boolean }>(
    {}
  );

  useEffect(() => {
    const initialEditingScores: EditingScores = {};
    matches.forEach((match, index) => {
      initialEditingScores[index] = {
        team1: 0,
        team2: 0,
      };
    });
    setEditingScores(initialEditingScores);
  }, [matches]); // Only run when matches change

  const handleScoreChange = (
    index: number,
    team: "team1" | "team2",
    value: number
  ) => {
    setEditingScores((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        [team]: value,
        [team === "team1" ? "team2" : "team1"]: pointsPerMatch - value,
      },
    }));
  };

  const isScoreValid = (index: number) => {
    const team1Score = editingScores[index]?.team1;
    const team2Score = editingScores[index]?.team2;

    return (
      team1Score !== undefined &&
      team2Score !== undefined &&
      team1Score + team2Score === pointsPerMatch
    );
  };

  const handleNextRound = () => {
    if (!areAllScoresValid()) {
      alert(
        "Please ensure all match scores are valid before proceeding to the next round."
      );
      return;
    }

    // First update scores and matches
    const newScores = { ...scores };

    // Mark sitting out players for this round
    sittingOutPlayers.forEach((player) => {
      newScores[player].pointsPerRound[round - 1] = "sitout";
    });

    // Update active players' scores
    matches.forEach((match, index) => {
      const team1Score = editingScores[index].team1;
      const team2Score = editingScores[index].team2;

      [...match.team1, ...match.team2].forEach((player) => {
        newScores[player].matchesPlayed += 1;
      });

      match.team1.forEach((player) => {
        newScores[player].points += team1Score;
        newScores[player].pointsPerRound[round - 1] = team1Score;
      });
      match.team2.forEach((player) => {
        newScores[player].points += team2Score;
        newScores[player].pointsPerRound[round - 1] = team2Score;
      });

      if (team1Score > team2Score) {
        match.team1.forEach((player) => {
          newScores[player].wins += 1;
        });
      } else if (team2Score > team1Score) {
        match.team2.forEach((player) => {
          newScores[player].wins += 1;
        });
      }
    });

    // Update matches
    const updatedMatches = matches.map((match, index) => ({
      ...match,
      team1Score: editingScores[index].team1,
      team2Score: editingScores[index].team2,
      isScoreSubmitted: true,
    }));

    // Update the scores and matches first
    onUpdateScores(newScores);
    onUpdateMatches(updatedMatches);

    // Then move to next round
    onNextRound();
  };

  const areAllScoresValid = () => {
    return matches.every((_, index) => isScoreValid(index));
  };

  return (
    <div className="space-y-8 mt-8 px-4 max-w-4xl mx-auto">
      <Card className="bg-gradient-to-r from-red-500 to-yellow-500">
        <CardHeader className="text-center">
          <CardTitle className="bg-transparent text-3xl rounded-lg font-extrabold text-gray-800 flex items-center justify-center gap-2">
            <Image
              src={padelIcon || "/placeholder.svg"}
              alt="Padel Icon"
              width={32}
              height={32}
            />
            <span className="px-4 py-2">
              {isLastRound ? "Final Round" : `Round ${round}`}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {matches.map((match, index) => (
            <MatchCard
              key={index}
              match={match}
              index={index}
              courtName={courts[index % courts.length]?.name || "Court 1"}
              mode={mode}
              editingScores={editingScores}
              pointsPerMatch={pointsPerMatch}
              openPopovers={openPopovers}
              setOpenPopovers={setOpenPopovers}
              handleScoreChange={handleScoreChange}
            />
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-col items-center gap-4">
        {!isLastRound ? (
          <>
            <div className="flex gap-4">
              <Button
                onClick={handleNextRound}
                className="text-lg bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-500"
                disabled={!areAllScoresValid()}
              >
                Next <ChevronRight />
              </Button>
            </div>
            {mode === "individual" && (
              <Button
                onClick={() => {
                  if (areAllScoresValid()) {
                    onStartFinalRound(editingScores);
                  } else {
                    alert(
                      "Please ensure all match scores are valid before proceeding to the final round."
                    );
                  }
                }}
                className="text-lg bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!areAllScoresValid()}
              >
                Final Round
              </Button>
            )}
          </>
        ) : (
          <Button
            onClick={handleNextRound}
            className="text-lg bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-500"
            disabled={!areAllScoresValid()}
          >
            Finish Tournament
          </Button>
        )}
      </div>
    </div>
  );
}
