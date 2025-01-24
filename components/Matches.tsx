"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, Trophy } from "lucide-react";
import Image from "next/image";
import padelIcon from "../app/assets/padelIcon.png";
import { MatchCard } from "./MatchCard";
import Scoreboard from "./Scoreboard";
import DetailsModal from "./DetailsModal";
import type {
  PlayerScore,
  Match,
  EditingScores,
  GroupStanding,
} from "@/lib/types";
import FinalRoundModal from "./FinalRoundModal";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";
import { Timer } from "./Timer";
import { GroupStandings } from "./GroupStandings";
import KnockoutBracket from "./KnockoutBracket";
import { generateKnockoutMatches } from "@/lib/groupGenerator";
import { calculateUpdatedScores } from "@/lib/updateScores";
import { MatchList } from "./MatchList";
import { TournamentResults } from "./TournamentResults";

interface Court {
  id: number;
  name: string;
}

interface KnockoutMatch {
  team1: string[];
  team2: string[];
  round: number;
  matchNumber: number;
  team1Score: number;
  team2Score: number;
  isScoreSubmitted: boolean;
  isKnockout: boolean;
  knockoutRound: string;
}

interface MatchesProps {
  matches: Match[];
  knockoutMatches?: KnockoutMatch[];
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
  format?: "mexicano" | "americano" | "groups";
  groupStandings?: { [key: number]: GroupStanding[] };
  isGroupStage?: boolean;
  onUpdateGroupStandings?: (newStandings: {
    [key: number]: GroupStanding[];
  }) => void;
  onStartKnockoutStage?: (updatedKnockoutMatches: KnockoutMatch[]) => void;
  teamsAdvancing?: number;
  onUpdateKnockoutMatches: (updatedKnockoutMatches: KnockoutMatch[]) => void;
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
  knockoutMatches,
  onUpdateKnockoutMatches,
  onUpdateScores,
  round,
  onNextRound,
  pointsPerMatch,
  pointSystem,
  isLastRound,
  courts,
  maxRounds,
  mode,
  sittingOutPlayers,
  onStartFinalRound,
  onPause,
  format,
  groupStandings,
  isGroupStage,
  onUpdateGroupStandings,
  onStartKnockoutStage,
  teamsAdvancing,
}: MatchesProps) {
  const [editingScores, setEditingScores] = useState<EditingScores>({});
  const [editingKnockoutScores, setEditingKnockoutScores] =
    useState<EditingScores>({});
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
  const [localScores, setLocalScores] = useState<Scores>(scores);
  const [showFinalRoundModal, setShowFinalRoundModal] = useState(false);
  const [localMatches, setLocalMatches] = useState<Match[]>(matches);
  const [localKnockoutMatches, setLocalKnockoutMatches] = useState<
    KnockoutMatch[] | undefined
  >(knockoutMatches);
  const [localIsGroupStage, setLocalIsGroupStage] = useState<
    boolean | undefined
  >(isGroupStage);
  const [localRound, setLocalRound] = useState(round);
  const [currentKnockoutRound, setCurrentKnockoutRound] = useState<
    string | null
  >(null);
  const [tournamentCompleted, setTournamentCompleted] =
    useState<boolean>(false);
  const STORAGE_KEY = "tournament_state";

  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    console.log("Matches component mounted");
    console.log("Initial state:", {
      localIsGroupStage,
      localKnockoutMatches,
      editingKnockoutScores,
    });
  }, []);

  useEffect(() => {
    console.log("Matches or Knockout Matches updated:", {
      localMatches,
      localKnockoutMatches,
    });
  }, [localMatches, localKnockoutMatches]);

  useEffect(() => {
    const initialEditingScores: EditingScores = {};
    localMatches.forEach((_, index) => {
      initialEditingScores[index] = { team1: 0, team2: 0 };
    });
    localKnockoutMatches?.forEach((_, index) => {
      initialEditingScores[`knockout-${index}`] = { team1: 0, team2: 0 };
    });
    setEditingScores(initialEditingScores);
    setEditingKnockoutScores(initialEditingScores);

    console.log("Initial editing scores set:", initialEditingScores);
  }, [localMatches, localKnockoutMatches]);

  const handleScoreChange = (
    index: number,
    team: "team1" | "team2",
    value: number,
    isKnockout = false
  ) => {
    console.log("handleScoreChange called:", {
      index,
      team,
      value,
      isKnockout,
    });

    if (isKnockout) {
      setEditingKnockoutScores((prev) => {
        const newScores = { ...prev };
        newScores[`knockout-${index}`] = {
          ...newScores[`knockout-${index}`],
          [team]: value,
        };
        if (pointSystem === "pointsToPlay") {
          if (newScores[`knockout-${index}`].team1 > pointsPerMatch)
            newScores[`knockout-${index}`].team1 = pointsPerMatch;
          if (newScores[`knockout-${index}`].team2 > pointsPerMatch)
            newScores[`knockout-${index}`].team2 = pointsPerMatch;
        }
        console.log("Updated knockout scores:", newScores);
        return newScores;
      });
    } else {
      setEditingScores((prev) => {
        const newScores = { ...prev };
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
        console.log("Updated group scores:", newScores);
        return newScores;
      });
    }
  };

  const isScoreValid = (key: string) => {
    console.log("Checking score validity for:", key);
    const scores = key.startsWith("knockout-")
      ? editingKnockoutScores[key]
      : editingScores[key];
    if (!scores) {
      console.log("No scores found for key:", key);
      return false;
    }

    const team1Score = scores.team1;
    const team2Score = scores.team2;

    if (team1Score === undefined || team2Score === undefined) {
      console.log("Undefined scores for key:", key);
      return false;
    }

    let isValid = false;
    if (pointSystem === "pointsToPlay") {
      isValid = team1Score + team2Score === pointsPerMatch;
    } else if (pointSystem === "pointsToWin") {
      isValid = team1Score === pointsPerMatch || team2Score === pointsPerMatch;
    } else if (pointSystem === "TimePlay") {
      isValid = team1Score + team2Score > 0;
    }

    console.log("Score validity for key:", key, "is:", isValid);
    return isValid;
  };

  const areAllScoresValid = () => {
    if (localIsGroupStage) {
      const groupMatchesValid = localMatches.every((_, index) =>
        isScoreValid(index.toString())
      );
      console.log("All group scores valid:", groupMatchesValid);
      return groupMatchesValid;
    } else {
      const knockoutMatchesValid = localKnockoutMatches
        ? localKnockoutMatches.every((_, index) =>
            isScoreValid(`knockout-${index}`)
          )
        : true;
      console.log("All knockout scores valid:", knockoutMatchesValid);
      return knockoutMatchesValid;
    }
  };

  // Calculate if the final match is ready
  const isFinalMatch =
    localKnockoutMatches &&
    localKnockoutMatches.some(
      (match) =>
        match.knockoutRound === "final" &&
        match.team1[0].trim().toLowerCase() !== "tbd" &&
        match.team2[0].trim().toLowerCase() !== "tbd"
    );

  const handleNextRound = () => {
    if (!areAllScoresValid()) {
      alert("Please ensure all match scores are valid before proceeding.");
      return;
    }

    if (tournamentCompleted) {
      alert("Tournament has already been completed.");
      return;
    }

    if (format === "groups") {
      if (localIsGroupStage) {
        // Transition from group stage to knockout stage
        if (groupStandings && teamsAdvancing) {
          const knockoutMatchesGenerated = generateKnockoutMatches(
            groupStandings,
            teamsAdvancing
          );

          // Initialize editingKnockoutScores for the new knockout matches
          const initialEditingKnockoutScores: EditingScores = {};
          knockoutMatchesGenerated.forEach((_, index) => {
            initialEditingKnockoutScores[`knockout-${index}`] = {
              team1: 0,
              team2: 0,
            };
          });

          setLocalKnockoutMatches(knockoutMatchesGenerated);
          setLocalMatches([]); // Clear localMatches
          setLocalRound(1);
          setLocalIsGroupStage(false);
          setEditingKnockoutScores(initialEditingKnockoutScores); // Initialize knockout scores

          if (onStartKnockoutStage) {
            onStartKnockoutStage(knockoutMatchesGenerated);
          }
        }
      } else {
        // Handle knockout stage
        let updatedKnockoutMatches: KnockoutMatch[] = [];
        if (localKnockoutMatches) {
          updatedKnockoutMatches = localKnockoutMatches.map((match, index) => ({
            ...match,
            team1Score:
              editingKnockoutScores[`knockout-${index}`]?.team1 ??
              match.team1Score,
            team2Score:
              editingKnockoutScores[`knockout-${index}`]?.team2 ??
              match.team2Score,
            isScoreSubmitted: true,
          }));
          console.log("Updated Knockout Matches:", updatedKnockoutMatches);
        }

        // Check if any final match is ready
        const finalMatch = updatedKnockoutMatches.find(
          (match) =>
            match.knockoutRound === "final" &&
            match.team1[0].trim().toLowerCase() !== "tbd" &&
            match.team2[0].trim().toLowerCase() !== "tbd" &&
            match.isScoreSubmitted
        );

        if (finalMatch && !tournamentCompleted) {
          let winner: string | undefined;
          if (finalMatch.team1Score > finalMatch.team2Score) {
            winner = finalMatch.team1[0];
          } else if (finalMatch.team2Score > finalMatch.team1Score) {
            winner = finalMatch.team2[0];
          } else {
            winner = "It's a Draw";
          }

          setTournamentCompleted(true);
          setLocalKnockoutMatches(updatedKnockoutMatches);
          alert(`Tournament completed! Winner: ${winner}`);
          return;
        }

        // Proceed to next knockout round
        const winners = getKnockoutWinners(updatedKnockoutMatches, "knockout");
        const currentRound = updatedKnockoutMatches[0]?.knockoutRound || "";
        let nextStageMatches: KnockoutMatch[] = [];

        if (currentRound === "quarter") {
          nextStageMatches = generateSemiFinals(winners);
        } else if (currentRound === "semi") {
          nextStageMatches = generateFinal(winners);
        }

        if (nextStageMatches.length > 0) {
          // Initialize editingKnockoutScores for the next stage matches
          const initialEditingKnockoutScores: EditingScores = {};
          nextStageMatches.forEach((_, index) => {
            initialEditingKnockoutScores[`knockout-${index}`] = {
              team1: 0,
              team2: 0,
            };
          });

          setLocalKnockoutMatches(nextStageMatches);
          setCurrentKnockoutRound(currentRound);
          onUpdateKnockoutMatches(nextStageMatches);
          setLocalRound((prev) => prev + 1);
          setEditingKnockoutScores(initialEditingKnockoutScores); // Initialize knockout scores
          onNextRound();
        } else {
          // If no next stage matches, the tournament is complete
          setTournamentCompleted(true);
          alert("Tournament completed!");
        }
      }
    } else {
      // Handle americano and mexicano formats
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

  const onTournamentEnd = () => {
    // Implement tournament end logic here
    console.log("Tournament has ended");
    // You might want to show a final standings component or a "Tournament Completed" message
  };

  const handleStartNewTournament = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  return (
    <div className="space-y-8 px-4 max-w-4xl mx-auto" key={localRound}>
      {tournamentCompleted ? (
        <TournamentResults
          groupStandings={localIsGroupStage ? groupStandings || {} : {}}
          knockoutMatches={
            localKnockoutMatches?.map((match) => ({
              ...match,
              team1Score:
                editingKnockoutScores[`knockout-${match.matchNumber - 1}`]
                  ?.team1 || 0,
              team2Score:
                editingKnockoutScores[`knockout-${match.matchNumber - 1}`]
                  ?.team2 || 0,
            })) || []
          }
          onStartNewTournament={handleStartNewTournament}
        />
      ) : (
        <>
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
                  {isLastRound ? "Final Round" : `Round ${localRound}`}
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
                Tip: Keep this window open and adjust your device&apos;s screen
                timeout settings to ensure sound playback.
              </span>
            )}
            <CardContent className="space-y-6 pt-6">
              {format === "groups" && localIsGroupStage && groupStandings && (
                <GroupStandings standings={groupStandings} />
              )}

              {format === "groups" && !localIsGroupStage && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-center text-gray-200 mb-4">
                    Knockout Stage
                  </h2>
                  <KnockoutBracket matches={localKnockoutMatches || []} />
                </div>
              )}

              {/* Render matches using your MatchCard component */}
              <MatchList
                matches={
                  localIsGroupStage ? localMatches : localKnockoutMatches || []
                }
                editingScores={
                  localIsGroupStage ? editingScores : editingKnockoutScores
                }
                handleScoreChange={handleScoreChange}
                pointsPerMatch={pointsPerMatch}
                pointSystem={pointSystem}
                courts={courts}
                format={format}
                mode={mode}
                isKnockout={!localIsGroupStage}
              />
            </CardContent>
          </Card>

          <div className="flex flex-col items-center gap-4">
            {mode === "individual" && !isLastRound ? (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Button
                  onClick={handleNextRound}
                  className="hover:scale-105 text-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-none shadow-lg transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 w-48 h-12"
                  disabled={!areAllScoresValid() || tournamentCompleted}
                >
                  Next Round <ChevronRight className="ml-1" />
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
                  Final Round
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleNextRound}
                className="hover:scale-105 text-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-none shadow-lg transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 w-48 h-12"
                disabled={!areAllScoresValid() || tournamentCompleted}
              >
                {isFinalMatch ? "End Tournament" : "Next Round"}
                {!isFinalMatch && <ChevronRight className="ml-1" />}
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
              onClick={handlePauseClick}
              variant={isPaused ? "default" : "outline"}
              className="hover:scale-105 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg shadow-lg flex items-center justify-center gap-2"
            >
              {isPaused ? t.resume : "End Tournament"}
            </Button>
          </div>

          <Scoreboard
            isOpen={isModalOpen}
            onClose={closeModal}
            scores={localScores}
            sortedPlayers={sortedPlayers}
            getRowColor={getRowColor}
            onUpdateScores={setLocalScores}
          />

          <DetailsModal
            isOpen={isDetailsOpen}
            onClose={() => setIsDetailsOpen(false)}
            scores={localScores}
            sortedPlayers={sortedPlayers}
            getRowColor={getRowColor}
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

export function getKnockoutWinners(matches: Match[], round: string): string[] {
  return matches.map((match) => {
    if (match.team1Score > match.team2Score) {
      return match.team1[0];
    } else if (match.team2Score > match.team1Score) {
      return match.team2[0];
    } else {
      // Implement a tie-breaker mechanism here if needed
      return match.team1[0]; // Or another logic to determine the winner
    }
  });
}

function generateSemiFinals(winners: string[]): KnockoutMatch[] {
  if (winners.length !== 4) {
    console.error("Semi-finals require exactly four winners.");
    return [];
  }
  return winners.reduce((acc, team, index, array) => {
    if (index % 2 === 0) {
      acc.push({
        team1: [team],
        team2: [array[index + 1]],
        round: 2,
        isKnockout: true,
        knockoutRound: "semi",
        matchNumber: acc.length + 1,
        team1Score: 0,
        team2Score: 0,
        isScoreSubmitted: false,
      });
    }
    return acc;
  }, [] as KnockoutMatch[]);
}

function generateFinal(winners: string[]): KnockoutMatch[] {
  if (winners.length !== 2) {
    console.error("Final round requires exactly two winners.");
    return [];
  }

  return [
    {
      team1: [winners[0]],
      team2: [winners[1]],
      round: 3,
      isKnockout: true,
      knockoutRound: "final",
      matchNumber: 1,
      team1Score: 0,
      team2Score: 0,
      isScoreSubmitted: false,
    },
  ];
}
