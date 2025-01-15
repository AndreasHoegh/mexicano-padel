"use client";

import React, { useState, useCallback, useEffect } from "react";
import Matches from "./Matches";
import { Court } from "../lib/types";

interface Match {
  team1: string[];
  team2: string[];
  team1Score: number;
  team2Score: number;
  isScoreSubmitted: boolean;
  team1Name?: string;
  team2Name?: string;
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

interface TournamentManagerProps {
  initialPlayers: string[];
  initialCourts: Court[];
  pointsPerMatch: number;
  maxRounds: number | null;
  mode: "individual" | "team";
}

interface EditingScores {
  [key: number]: {
    team1: number;
    team2: number;
  };
}

export default function TournamentManager({
  initialPlayers,
  initialCourts,
  pointsPerMatch,
  maxRounds,
  mode,
}: TournamentManagerProps) {
  const [round, setRound] = useState(1);
  const [matchHistory, setMatchHistory] = useState<
    Array<{ matches: Match[]; scores: Scores }>
  >([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [scores, setScores] = useState<Scores>({});
  const [sittingOutPlayers, setSittingOutPlayers] = useState<string[]>([]);
  const [sittingOutCounts, setSittingOutCounts] = useState<{
    [key: string]: number;
  }>({});
  const [editingScores, setEditingScores] = useState<EditingScores>({});

  const generateMatchesForNextRound = useCallback(
    (currentScores: Scores): Match[] => {
      const allPlayers = Object.keys(currentScores);
      const sortedPlayers = allPlayers.sort(
        (a, b) => currentScores[b].points - currentScores[a].points
      );

      const unitsPerMatch = mode === "team" ? 2 : 4;
      const maxMatches = Math.floor(sortedPlayers.length / unitsPerMatch);
      const numMatches = Math.min(maxMatches, initialCourts.length);
      const numPlayersNeeded = numMatches * unitsPerMatch;

      // Determine sitting out players
      const numSittingOut = sortedPlayers.length - numPlayersNeeded;
      const newSittingOutPlayers = sortedPlayers.slice(-numSittingOut);
      setSittingOutPlayers(newSittingOutPlayers);

      // Update sitting out counts
      const newSittingOutCounts = { ...sittingOutCounts };
      newSittingOutPlayers.forEach((player) => {
        newSittingOutCounts[player] = (newSittingOutCounts[player] || 0) + 1;
      });
      setSittingOutCounts(newSittingOutCounts);

      // Generate matches
      const activePlayers = sortedPlayers.slice(0, numPlayersNeeded);
      const newMatches: Match[] = [];

      for (let i = 0; i < numMatches; i++) {
        if (mode === "team") {
          newMatches.push({
            team1: [activePlayers[i * 2]],
            team2: [activePlayers[i * 2 + 1]],
            team1Score: 0,
            team2Score: 0,
            isScoreSubmitted: false,
          });
        } else {
          const startIdx = i * 4;
          const players = activePlayers.slice(startIdx, startIdx + 4);
          newMatches.push({
            team1: [players[0], players[1]],
            team2: [players[2], players[3]],
            team1Score: 0,
            team2Score: 0,
            isScoreSubmitted: false,
          });
        }
      }

      return newMatches;
    },
    [mode, initialCourts.length, sittingOutCounts]
  );

  const handleNextRound = (updatedMatches: Match[], updatedScores: Scores) => {
    setMatchHistory([
      ...matchHistory,
      { matches: updatedMatches, scores: updatedScores },
    ]);
    setRound(round + 1);
    const newMatches = generateMatchesForNextRound(updatedScores);
    setMatches(newMatches);
    setScores(updatedScores);
  };

  const handlePreviousRound = () => {
    if (round > 1) {
      const previousRoundData = matchHistory[matchHistory.length - 1];
      setMatchHistory(matchHistory.slice(0, -1));
      setRound(round - 1);
      setMatches(previousRoundData.matches);
      setScores(previousRoundData.scores);
    }
  };

  const isLastRound = useCallback(() => {
    return maxRounds !== null && round === maxRounds;
  }, [maxRounds, round]);

  useEffect(() => {
    // Initialize the first round
    if (round === 1 && matches.length === 0) {
      const initialScores: Scores = {};
      initialPlayers.forEach((player) => {
        initialScores[player] = {
          points: 0,
          wins: 0,
          matchesPlayed: 0,
          pointsPerRound: [],
        };
      });
      setScores(initialScores);
      const initialMatches = generateMatchesForNextRound(initialScores);
      setMatches(initialMatches);
    }
  }, [round, matches.length, initialPlayers, generateMatchesForNextRound]);

  return (
    <Matches
      matches={matches}
      scores={scores}
      onUpdateMatches={setMatches}
      onUpdateScores={setScores}
      round={round}
      onNextRound={() => handleNextRound(matches, scores)}
      onPreviousRound={handlePreviousRound}
      pointsPerMatch={pointsPerMatch}
      isLastRound={isLastRound()}
      courts={initialCourts}
      mode={mode}
      sittingOutPlayers={sittingOutPlayers}
      onStartFinalRound={() => {
        /* Implement if needed */
      }}
      canGoBack={round > 1}
      editingScores={editingScores}
      setEditingScores={setEditingScores}
    />
  );
}
