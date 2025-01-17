import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, Trophy } from "lucide-react";
import Image from "next/image";
import padelIcon from "../app/assets/padelIcon.png";
import { MatchCard } from "./MatchCard";
import Scoreboard from "./Scoreboard";
import DetailsModal from "./DetailsModal";
import { PlayerScore } from "@/lib/types";
import FinalRoundModal from "./FinalRoundModal";

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
  onPause: (paused: boolean) => void;
}

interface Scores {
  [key: string]: {
    points: number;
    wins: number;
    matchesPlayed: number;
    pointsPerRound: (number | "sitout")[];
    team?: string;
    teamName?: string;
  };
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
  onPause,
}: MatchesProps) {
  const [editingScores, setEditingScores] = useState<EditingScores>({});
  const [openPopovers, setOpenPopovers] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [sortedPlayers, setSortedPlayers] = useState<[string, PlayerScore][]>(
    []
  );
  const [getRowColor, setGetRowColor] = useState<(index: number) => string>(
    () => () => ""
  );
  const [scoresss, setScoresss] = useState<Scores>({});
  const [showFinalRoundModal, setShowFinalRoundModal] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const updateScores = useCallback((updatedScores: Scores) => {
    setScoresss(updatedScores);
  }, []);

  useEffect(() => {
    const initialEditingScores: EditingScores = {};
    matches.forEach((_, index) => {
      initialEditingScores[index] = {
        team1: 0,
        team2: 0,
      };
    });
    setEditingScores(initialEditingScores);
  }, [matches]);

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

  const areAllScoresValid = () => {
    return matches.every((_, index) => isScoreValid(index));
  };

  const handleNextRound = () => {
    if (!areAllScoresValid()) {
      alert(
        "Please ensure all match scores are valid before proceeding to the next round."
      );
      return;
    }

    // First update scores
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

  return (
    <div className="space-y-8 px-4 max-w-4xl mx-auto">
      <Card className="bg-gradient-to-br from-gray-400 to-gray-300 shadow-xl border border-gray-600">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-extrabold text-gray-200 flex items-center justify-center gap-3">
            <Image
              src={padelIcon || "/placeholder.svg"}
              alt="Padel Icon"
              width={36}
              height={36}
              className="opacity-90"
            />
            <span className="px-4 py-2 rounded-lg bg-gray-900/50 border border-gray-600">
              {isLastRound ? "Final Round" : `Round ${round}`}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
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
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button
              onClick={handleNextRound}
              className="hover:scale-105 text-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-none shadow-lg transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 w-48 h-12"
              disabled={!areAllScoresValid()}
            >
              Next Round <ChevronRight className="ml-1" />
            </Button>
            {mode === "individual" && (
              <Button
                onClick={() => {
                  if (areAllScoresValid()) {
                    setShowFinalRoundModal(true);
                  } else {
                    alert(
                      "Please ensure all match scores are valid before proceeding to the final round."
                    );
                  }
                }}
                className="hover:scale-105 text-lg bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-900 border-none shadow-lg transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 w-48 h-12"
                disabled={!areAllScoresValid()}
              >
                Final Round
              </Button>
            )}
          </div>
        ) : (
          <Button
            onClick={handleNextRound}
            className="hover:scale-105 text-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-none shadow-lg transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 w-48 h-12"
            disabled={!areAllScoresValid()}
          >
            Finish Tournament
          </Button>
        )}
      </div>
      <div className="mt-8 flex flex-col justify-center gap-3">
        <button
          onClick={openModal}
          className="hover:scale-105 bg-yellow-600 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center justify-center gap-2"
        >
          <Trophy className="h-5 w-5" />
          <span>View Standings</span>
        </button>

        <Button
          onClick={() => {
            setIsPaused(true);
            onPause(true); // Notify parent of the change
          }}
          className="hover:scale-105 bg-red-500 hover:bg-red-600 text-white px-6 py-3 flex items-center justify-center gap-2"
        >
          End Tournament
        </Button>
      </div>

      <Scoreboard
        isOpen={isModalOpen}
        onClose={closeModal}
        scores={scores}
        sortedPlayers={sortedPlayers}
        getRowColor={getRowColor}
        onUpdateScores={updateScores}
      />

      <DetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        scores={scores}
        sortedPlayers={sortedPlayers}
        getRowColor={getRowColor}
        onUpdateScores={updateScores}
      />

      <FinalRoundModal
        isOpen={showFinalRoundModal}
        onClose={() => setShowFinalRoundModal(false)}
        onConfirm={() => onStartFinalRound(editingScores)}
      />
    </div>
  );
}
