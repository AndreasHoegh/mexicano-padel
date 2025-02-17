"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, Trophy } from "lucide-react";
import Image from "next/image";
import padelIcon from "@/app/assets/padelIcon.png";
import Scoreboard from "../match/Scoreboard";
import DetailsModal from "../match/DetailsModal";
import type { Match, EditingScores, Court, Scores } from "@/lib/types";
import FinalRoundModal from "../match/FinalRoundModal";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";
import { Timer } from "../match/Timer";
import { MatchList } from "../match/MatchList";
import TournamentPaused from "../match/TournamentPaused";
import { saveScores } from "@/lib/tournamentStorage";

interface MatchesProps {
  matches: Match[];
  scores: Scores;
  onUpdateMatches: (updatedMatches: Match[]) => void;
  onUpdateScores: (updatedScores: Scores) => void;
  round: number;
  maxRounds: number | null;
  onNextRound: () => void;
  pointsPerMatch: number;
  pointSystem: "pointsToPlay" | "pointsToWin" | "TimePlay";
  isLastRound: boolean;
  courts: Court[];
  mode: "individual" | "team";
  sittingOutPlayers: string[];
  onStartFinalRound: (editingScores: EditingScores) => void;
  onPause: (paused: boolean) => void;
  format?: "mexicano" | "americano";
  editingScores: EditingScores;
  onUpdateEditingScores: (newEditingScores: EditingScores) => void;
  tournamentId: string;
  onTournamentComplete: () => void;
}

export default function Matches({
  matches,
  scores,
  onUpdateMatches,
  onUpdateScores,
  round,
  onNextRound,
  pointsPerMatch,
  pointSystem,
  isLastRound,
  courts,
  mode,
  sittingOutPlayers,
  onStartFinalRound,
  onPause,
  format,
  editingScores,
  onUpdateEditingScores,
  tournamentId,
  onTournamentComplete,
}: MatchesProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [sortedPlayers, setSortedPlayers] = useState<
    [string, Scores[string]][]
  >([]);
  const [localScores, setLocalScores] = useState<Scores>(scores);
  const [showFinalRoundModal, setShowFinalRoundModal] = useState(false);
  const [localMatches, setLocalMatches] = useState<Match[]>(matches);
  const [localRound, setLocalRound] = useState(round);
  const [tournamentCompleted, setTournamentCompleted] =
    useState<boolean>(false);

  const { language } = useLanguage();
  const t = translations[language];

  const handleScoreChange = (
    index: number,
    team: "team1" | "team2",
    value: number
  ) => {
    const newScores = { ...editingScores };
    if (!newScores[index]) {
      newScores[index] = { team1: 0, team2: 0 };
    }
    if (pointSystem === "pointsToPlay") {
      if (team === "team1") {
        newScores[index].team1 = value;
        newScores[index].team2 = pointsPerMatch - value;
      } else {
        newScores[index].team2 = value;
        newScores[index].team1 = pointsPerMatch - value;
      }
    } else {
      newScores[index][team] = value;
    }
    onUpdateEditingScores(newScores);

    // Save scores to localStorage
    saveScores(tournamentId, newScores);
  };

  const isScoreValid = (key: string) => {
    const scores = editingScores[key];
    if (!scores) return false;

    const team1Score = scores.team1;
    const team2Score = scores.team2;

    if (team1Score === undefined || team2Score === undefined) return false;

    let isValid = false;
    if (pointSystem === "pointsToPlay") {
      isValid = team1Score + team2Score === pointsPerMatch;
    } else if (pointSystem === "pointsToWin") {
      isValid = team1Score === pointsPerMatch || team2Score === pointsPerMatch;
    } else if (pointSystem === "TimePlay") {
      isValid = team1Score + team2Score > 0;
    }

    return isValid;
  };

  const areAllScoresValid = () => {
    return localMatches.every((_, index) => isScoreValid(index.toString()));
  };

  const handleNextRound = () => {
    if (!areAllScoresValid()) {
      alert("Please ensure all match scores are valid before proceeding.");
      return;
    }

    if (tournamentCompleted) {
      alert("Tournament has already been completed.");
      return;
    }

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

    onUpdateScores(newScores);

    if (isLastRound) {
      setTournamentCompleted(true);
      onTournamentComplete();
    } else {
      onNextRound();
    }
  };

  const handlePauseClick = () => {
    setIsPaused((prev) => {
      const newPausedState = !prev;
      onPause(newPausedState);
      return newPausedState;
    });
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="space-y-8 px-4  mx-auto" key={localRound}>
      {tournamentCompleted ? (
        <TournamentPaused
          isFinished={tournamentCompleted}
          scores={localScores}
          setIsPaused={setIsPaused}
          setIsFinished={setTournamentCompleted}
          onTournamentComplete={onTournamentComplete}
        />
      ) : (
        <>
          <Card className="bg-transparent border-none shadow-none">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-3xl font-extrabold text-gray-200 flex items-center justify-center gap-3">
                <Image
                  src={padelIcon || "/placeholder.svg"}
                  alt="Padel Icon"
                  width={36}
                  height={36}
                  className="opacity-90"
                />
                <span className="px-4 py-2 rounded-lg">
                  {isLastRound ? t.finalRound : `${t.round} ${localRound}`}
                </span>
              </CardTitle>
            </CardHeader>
            {pointSystem === "TimePlay" && (
              <div className="mt-2 flex justify-center">
                <Timer
                  initialMinutes={pointsPerMatch}
                  onTimeUp={() => {
                    console.log("Time's up!");
                  }}
                />
              </div>
            )}
            {pointSystem === "TimePlay" && (
              <span className="mt-2 px-6 text-center text-white text-xs flex justify-center">
                {t.timePlayTip}
              </span>
            )}
            <CardContent className="space-y-6 pt-6">
              <MatchList
                matches={localMatches}
                editingScores={editingScores}
                handleScoreChange={handleScoreChange}
                pointsPerMatch={pointsPerMatch}
                pointSystem={pointSystem}
                courts={courts}
                format={format}
                mode={mode}
              />
            </CardContent>
          </Card>

          <div className="flex flex-col items-center gap-4">
            {!isLastRound ? (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Button
                  onClick={handleNextRound}
                  className="hover:scale-105 text-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-none shadow-lg transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 w-48 h-12"
                  disabled={!areAllScoresValid() || tournamentCompleted}
                >
                  {t.nextRound} <ChevronRight className="ml-1" />
                </Button>
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
                  disabled={!areAllScoresValid() || tournamentCompleted}
                >
                  {t.startFinalRound}
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleNextRound}
                className="hover:scale-105 text-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-none shadow-lg transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 w-48 h-12"
                disabled={!areAllScoresValid() || tournamentCompleted}
              >
                {t.endTournament}
              </Button>
            )}
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3">
            <Button
              onClick={openModal}
              className="hover:scale-105 bg-yellow-600 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center justify-center gap-2"
            >
              <Trophy className="h-5 w-5" />
              <span>{t.viewStandings}</span>
            </Button>

            <Button
              onClick={handlePauseClick}
              variant={isPaused ? "default" : "outline"}
              className="hover:scale-105 bg-red-600 hover:bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center justify-center gap-2"
            >
              {isPaused ? t.resume : t.endTournament}
            </Button>
          </div>

          <Scoreboard
            isOpen={isModalOpen}
            onClose={closeModal}
            scores={localScores}
            sortedPlayers={sortedPlayers}
            onUpdateScores={setLocalScores}
          />

          <DetailsModal
            isOpen={isDetailsOpen}
            onClose={() => setIsDetailsOpen(false)}
            scores={localScores}
            sortedPlayers={sortedPlayers}
            onUpdateScores={setLocalScores}
          />

          <FinalRoundModal
            isOpen={showFinalRoundModal}
            onClose={() => setShowFinalRoundModal(false)}
            onConfirm={() => onStartFinalRound(editingScores)}
          />
        </>
      )}
    </div>
  );
}
