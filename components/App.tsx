"use client";

import { useEffect, useState, useCallback } from "react";
import { SubmitHandler } from "react-hook-form";
import TournamentNameForm, {
  TournamentNameFormData,
} from "./TournamentNameForm";
import NumOfPlayersForm from "./NumOfPlayersForm";
import PlayerNamesForm from "./PlayerNamesForm";
import Matches from "./Matches";
import { Button } from "./ui/button";
import PlayerScores from "./PlayerScores";
import { Court, PlayerScore } from "../lib/types";
import RestoreDialog from "./RestoreDialog";

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

interface EditingScores {
  [key: number]: {
    team1: number;
    team2: number;
  };
}

interface PlayerHistory {
  [key: string]: {
    partneredWith: { [key: string]: number };
    playedAgainst: { [key: string]: number };
    gamesPlayed: number;
    lastSatOutRound: number;
  };
}

const BackButton = ({
  onClick,
  visible,
}: {
  onClick: () => void;
  visible?: boolean;
}) => (
  <Button
    onClick={onClick}
    variant="ghost"
    className={`absolute top-4 left-4 flex items-center gap-2 text-white hover:text-gray-900 transition-colors ${
      !visible ? "hidden" : ""
    }`}
  >
    <span className="text-lg">←</span>
    <span className="font-medium">Back</span>
  </Button>
);

export default function App() {
  const [numberOfPlayers, setNumberOfPlayers] = useState<number>(0);

  const [names, setNames] = useState<string[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [scores, setScores] = useState<Scores>({});
  const [round, setRound] = useState<number>(1);
  const [tournamentName, setTournamentName] = useState<string>("");
  const [isTournamentNameSet, setIsTournamentNameSet] =
    useState<boolean>(false);
  const [arePlayerNamesSet, setArePlayerNamesSet] = useState<boolean>(false);
  const [sittingOutPlayers, setSittingOutPlayers] = useState<string[]>([]);
  const [sittingOutCounts, setSittingOutCounts] = useState<{
    [key: string]: number;
  }>({});
  const [pointsPerMatch, setPointsPerMatch] = useState<number>(21);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [maxRounds, setMaxRounds] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [courts, setCourts] = useState<Court[]>([]);
  const [mode, setMode] = useState<"individual" | "team">("individual");
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [finalPairingPattern, setFinalPairingPattern] = useState<number[]>([
    0, 1, 2, 3,
  ]);
  const [tournamentHistory, setTournamentHistory] = useState<
    Array<{
      matches: Match[];
      scores: Scores;
      round: number;
      sittingOutPlayers: string[];
    }>
  >([]);
  const [sortedPlayers, setSortedPlayers] = useState<[string, PlayerScore][]>(
    []
  );
  const [format, setFormat] = useState<"mexicano" | "americano">("mexicano");
  const partnerships: { [key: string]: { [key: string]: number } } = {};

  const [playerHistory, setPlayerHistory] = useState<PlayerHistory>({});

  const STORAGE_KEY = "tournament_state";

  const saveTournamentState = () => {
    const state = {
      names,
      matches,
      scores,
      round,
      tournamentName,
      sittingOutPlayers,
      sittingOutCounts,
      pointsPerMatch,
      isFinished,
      maxRounds,
      isPaused,
      courts,
      mode,
      numberOfPlayers,
      isTournamentNameSet,
      arePlayerNamesSet,
      tournamentHistory,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  };

  const loadTournamentState = () => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      const state = JSON.parse(savedState);
      setNames(state.names);
      setMatches(state.matches);
      setScores(state.scores);
      setRound(state.round);
      setTournamentName(state.tournamentName);
      setSittingOutPlayers(state.sittingOutPlayers);
      setSittingOutCounts(state.sittingOutCounts);
      setPointsPerMatch(state.pointsPerMatch);
      setIsFinished(state.isFinished);
      setMaxRounds(state.maxRounds);
      setIsPaused(state.isPaused);
      setCourts(state.courts);
      setMode(state.mode);
      setNumberOfPlayers(state.numberOfPlayers);
      setIsTournamentNameSet(state.isTournamentNameSet);
      setArePlayerNamesSet(state.arePlayerNamesSet);
      setTournamentHistory(state.tournamentHistory || []);
      return true;
    }
    return false;
  };

  useEffect(() => {
    loadTournamentState();
  }, []);

  useEffect(() => {
    if (isTournamentNameSet) {
      saveTournamentState();
    }
  }, [
    names,
    matches,
    scores,
    round,
    tournamentName,
    sittingOutPlayers,
    sittingOutCounts,
    pointsPerMatch,
    isFinished,
    maxRounds,
    isPaused,
    courts,
    mode,
    numberOfPlayers,
    isTournamentNameSet,
    arePlayerNamesSet,
    tournamentHistory,
  ]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [isTournamentNameSet, arePlayerNamesSet]);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) {
      setShowRestoreDialog(true);
    }
  }, []);

  const onNumberSubmit = ({
    mode,
    format,
    count,
  }: {
    mode: "individual" | "team";
    format: "mexicano" | "americano";
    count: number;
  }) => {
    if (count >= 4) {
      setMode(mode);
      setFormat(format);
      setNumberOfPlayers(count);
    } else {
      alert("Minimum 4 players required.");
    }
  };

  const isLastRound = useCallback(() => {
    return maxRounds !== null && round === maxRounds;
  }, [maxRounds, round]);

  const generateMatches = useCallback(
    (players: string[], courtsToUse = courts) => {
      const allUnits = [...players];
      const unitsPerMatch = mode === "team" ? 2 : 4;

      const sortedUnits =
        round === 1
          ? shuffle(allUnits)
          : allUnits.sort((a, b) => scores[b].points - scores[a].points);

      const maxMatchesByPlayers = Math.floor(
        sortedUnits.length / unitsPerMatch
      );
      const numMatches = Math.min(maxMatchesByPlayers, courtsToUse.length);
      const numPlayersNeeded = numMatches * unitsPerMatch;
      const numSittingOut = sortedUnits.length - numPlayersNeeded;

      let sittingOut: string[] = [];
      if (numSittingOut > 0) {
        const playersBySitouts = [...allUnits].sort(
          (a, b) => (sittingOutCounts[a] || 0) - (sittingOutCounts[b] || 0)
        );

        sittingOut = playersBySitouts.slice(0, numSittingOut);

        const newSittingOutCounts = { ...sittingOutCounts };
        sittingOut.forEach((unit) => {
          newSittingOutCounts[unit] = (newSittingOutCounts[unit] || 0) + 1;
        });
        setSittingOutCounts(newSittingOutCounts);
      }

      setSittingOutPlayers(sittingOut);

      const activeUnits = sortedUnits.filter(
        (unit) => !sittingOut.includes(unit)
      );

      const newMatches: Match[] = [];
      for (let i = 0; i < numMatches; i++) {
        if (mode === "team") {
          newMatches.push({
            team1: [activeUnits[i * 2]],
            team2: [activeUnits[i * 2 + 1]],
            team1Score: 0,
            team2Score: 0,
            isScoreSubmitted: false,
          });
        } else {
          const pattern =
            maxRounds !== null && round === maxRounds
              ? finalPairingPattern
              : getMatchPattern((round - 1) % 3);
          const startIdx = i * 4;
          const players = activeUnits.slice(startIdx, startIdx + 4);

          newMatches.push({
            team1: [players[pattern[0]], players[pattern[1]]],
            team2: [players[pattern[2]], players[pattern[3]]],
            team1Score: 0,
            team2Score: 0,
            isScoreSubmitted: false,
          });
        }
      }
      setMatches(newMatches);
      // }
    },
    [
      format,
      round,
      scores,
      mode,
      sittingOutCounts,
      courts,
      finalPairingPattern,
      maxRounds,
      partnerships,
      isLastRound,
      playerHistory,
    ]
  );

  const getMatchPattern = (roundIndex: number): number[] => {
    const patterns = [
      [0, 2, 1, 3],
      [0, 3, 1, 2],
      [0, 1, 2, 3],
    ];
    return patterns[roundIndex % 3];
  };

  const generateAmericanoMatchesTeamMode = useCallback(
    (players: string[], courtsToUse = courts) => {
      console.log("=== Starting Round", round, "===");
      console.log("Current Partnership State:", partnerships);

      const shuffleAmericano = <T,>(array: T[]): T[] => {
        return array.sort(() => Math.random() - 0.5);
      };

      function findLeastPlayedWith(
        unit: string,
        availableUnits: string[],
        usedPartnerships: Set<string>
      ): { partner: string; remaining: string[] } {
        const playedWith = availableUnits
          .filter((u) => u !== unit && !usedPartnerships.has(`${unit}-${u}`))
          .map((u) => {
            const directPartnerships = partnerships[unit]?.[u] || 0;
            const totalPartnerships = Object.values(
              partnerships[u] || {}
            ).reduce((sum, count) => sum + count, 0);

            return {
              id: u,
              directPartnerships,
              totalPartnerships,
            };
          });

        playedWith.sort((a, b) => {
          if (a.directPartnerships !== b.directPartnerships) {
            return a.directPartnerships - b.directPartnerships;
          }
          return a.totalPartnerships - b.totalPartnerships;
        });

        console.log(`Partner selection for ${unit}:`, {
          availableUnits,
          playedWith,
          selectedPartner: playedWith[0],
        });

        const partner = playedWith[0]?.id;
        if (!partner) {
          throw new Error(`No partner found for ${unit}`);
        }

        return {
          partner,
          remaining: availableUnits.filter((u) => u !== partner && u !== unit),
        };
      }

      // Initialize partnerships if needed
      if (!partnerships[players[0]]) {
        console.log("Initializing partnerships");
        players.forEach((u1) => {
          partnerships[u1] = {};
          players.forEach((u2) => {
            if (u1 !== u2) {
              partnerships[u1][u2] = 0;
            }
          });
        });
      }

      // Handle sitting out players and get active units
      const allUnits = [...players]; // Each team is a unit
      const unitsPerMatch = mode === "team" ? 1 : 2; // Each match requires 2 units (teams)

      const maxActive = Math.min(
        allUnits.length,
        courtsToUse.length * unitsPerMatch * 2 // Each match requires 2 units
      );
      const activeCount =
        Math.floor(maxActive / (unitsPerMatch * 2)) * (unitsPerMatch * 2);
      const numSittingOut = allUnits.length - activeCount;

      const unitsBySitouts = shuffleAmericano([...players]).sort(
        (a, b) => (sittingOutCounts[a] || 0) - (sittingOutCounts[b] || 0)
      );

      const sittingOut = unitsBySitouts.slice(0, numSittingOut);
      setSittingOutPlayers(sittingOut);

      // Update sitout counts
      const newSittingOutCounts = { ...sittingOutCounts };
      sittingOut.forEach((unit) => {
        newSittingOutCounts[unit] = (newSittingOutCounts[unit] || 0) + 1;
      });
      setSittingOutCounts(newSittingOutCounts);

      // Get active units
      let availableUnits = shuffleAmericano(
        unitsBySitouts.filter((u) => !sittingOut.includes(u))
      );

      const newMatches: Match[] = [];
      const usedPartnerships = new Set<string>();

      while (
        availableUnits.length >= 2 &&
        newMatches.length < courtsToUse.length
      ) {
        console.log(`\n=== Creating Match ${newMatches.length + 1} ===`);
        console.log("Available units:", availableUnits);

        const unit1 = availableUnits[0];
        console.log("Selected first unit:", unit1);

        // Find partner for unit1
        const { partner: unit2, remaining: afterUnit2 } = findLeastPlayedWith(
          unit1,
          availableUnits,
          usedPartnerships
        );

        console.log(`Selected partner for ${unit1}: ${unit2}`);

        // Create match between unit1 and unit2
        console.log("Final match pairing:", {
          team1: [unit1],
          team2: [unit2],
          partnerships: {
            team1: partnerships[unit1]?.[unit2] || 0,
            team2: partnerships[unit2]?.[unit1] || 0,
          },
        });

        // Track partnerships after units are selected
        usedPartnerships.add(`${unit1}-${unit2}`);
        usedPartnerships.add(`${unit2}-${unit1}`);

        // Create match
        newMatches.push({
          team1: [unit1],
          team2: [unit2],
          team1Score: 0,
          team2Score: 0,
          isScoreSubmitted: false,
        });

        // Update partnerships
        partnerships[unit1][unit2] = (partnerships[unit1][unit2] || 0) + 1;
        partnerships[unit2][unit1] = (partnerships[unit2][unit1] || 0) + 1;

        // Remove used units from available pool
        availableUnits = afterUnit2;
        console.log("Updated partnerships for this match:", {
          [`${unit1}-${unit2}`]: partnerships[unit1][unit2],
          [`${unit2}-${unit1}`]: partnerships[unit2][unit1],
        });
      }

      setMatches(newMatches);
      console.log("\n=== Round", round, "Complete ===");
      console.log("Final matches:", newMatches);
      console.log("Updated partnership state:", partnerships);
    },
    [courts, partnerships, sittingOutCounts, round, mode]
  );

  const generateAmericanoMatches = useCallback(
    (players: string[], courtsToUse = courts) => {
      const allUnits = [...players];
      console.log("ALL UNITS:", allUnits);
      console.log("=== Starting Round", round, "===");
      console.log("Current Partnership State:", partnerships);
      console.log("PLAYERS:", players);

      const maxMatchesByPlayers = Math.floor(players.length / 4);
      const numMatches = Math.min(maxMatchesByPlayers, courtsToUse.length);

      const shuffledPlayers = shuffle(players);

      function findLeastPlayedWith(
        player: string,
        availablePlayers: string[],
        usedPartnerships: Set<string>
      ): { partner: string; remaining: string[] } {
        // Calculate total partnerships for each available player
        const playedWith = availablePlayers
          .filter(
            (p) => p !== player && !usedPartnerships.has(`${player}-${p}`)
          )
          .map((p) => {
            // Count total partnerships for this player
            const totalPartnerships = Object.values(
              partnerships[p] || {}
            ).reduce((sum, count) => sum + count, 0);

            // Calculate a score that considers both direct partnerships and total partnerships
            const score =
              (partnerships[player]?.[p] || 0) * 10 + totalPartnerships;

            return {
              id: p,
              directPartnerships: partnerships[player]?.[p] || 0,
              totalPartnerships,
              score,
            };
          });

        // Sort by score (prioritizing least played together and least total partnerships)
        playedWith.sort((a, b) => {
          // First prioritize direct partnerships
          if (a.directPartnerships !== b.directPartnerships) {
            return a.directPartnerships - b.directPartnerships;
          }
          // Then consider total partnerships
          return a.totalPartnerships - b.totalPartnerships;
        });

        console.log(`Selecting partner for ${player}:`);
        console.log("Available players:", availablePlayers);
        console.log("Candidate partners with scores:", playedWith);
        console.log("Selected partner:", playedWith[0]);

        const partner = playedWith[0]?.id;
        if (!partner) {
          throw new Error(`No partner found for ${player}`);
        }

        return {
          partner,
          remaining: availablePlayers.filter(
            (p) => p !== partner && p !== player
          ),
        };
      }

      // Initialize partnerships if needed
      if (!partnerships[shuffledPlayers[0]]) {
        console.log("Initializing partnerships");
        shuffledPlayers.forEach((p1) => {
          partnerships[p1] = {};
          shuffledPlayers.forEach((p2) => {
            if (p1 !== p2) {
              partnerships[p1][p2] = 0;
            }
          });
        });
      }

      // Handle sitting out players and get active players
      const maxActive = Math.min(
        shuffledPlayers.length,
        courtsToUse.length * 4
      );
      const activeCount = Math.floor(maxActive / 4) * 4;
      const numSittingOut = shuffledPlayers.length - activeCount;

      const playersBySitouts = [...shuffledPlayers].sort(
        (a, b) => (sittingOutCounts[a] || 0) - (sittingOutCounts[b] || 0)
      );

      const sittingOut = playersBySitouts.slice(0, numSittingOut);
      setSittingOutPlayers(sittingOut);

      // Update sitout counts
      const newSittingOutCounts = { ...sittingOutCounts };
      sittingOut.forEach((player) => {
        newSittingOutCounts[player] = (newSittingOutCounts[player] || 0) + 1;
      });
      setSittingOutCounts(newSittingOutCounts);

      console.log("Available playerssssssss:", playersBySitouts);

      // Get active players
      let availablePlayers = playersBySitouts
        .filter((p) => !sittingOut.includes(p))
        .sort(
          (a, b) =>
            Object.values(partnerships[a]).reduce((sum, val) => sum + val, 0) -
            Object.values(partnerships[b]).reduce((sum, val) => sum + val, 0)
        );

      //const newMatches: Match[] = [];

      const newMatches: Match[] = [];

      // Handle final round separately
      if (maxRounds !== null && round === maxRounds) {
        availablePlayers = allUnits.sort(
          (a, b) => scores[b].points - scores[a].points
        );
        for (let i = 0; i < numMatches; i++) {
          const pattern = finalPairingPattern;
          const startIdx = i * 4;
          const players = availablePlayers.slice(startIdx, startIdx + 4);
          if (players.length === 4) {
            newMatches.push({
              team1: [players[pattern[0]], players[pattern[1]]],
              team2: [players[pattern[2]], players[pattern[3]]],
              team1Score: 0,
              team2Score: 0,
              isScoreSubmitted: false,
            });
          }
        }
      } else {
        // Regular round match generation

        const usedPartnerships = new Set<string>();

        while (
          availablePlayers.length >= 4 &&
          newMatches.length < courtsToUse.length
        ) {
          console.log(`\n=== Creating Match ${newMatches.length + 1} ===`);
          console.log(
            "Available players at start of this match:",
            availablePlayers
          );

          // Select first player
          const player1 = availablePlayers[0];
          console.log("Selected first player:", player1);

          // Select partner for player1
          const { partner: player2, remaining: afterPlayer2 } =
            findLeastPlayedWith(player1, availablePlayers, usedPartnerships);
          console.log(`Partner selected for ${player1}: ${player2}`);

          // Get all remaining players for opponents
          const potentialOpponents = afterPlayer2;

          // Evaluate all possible opponent pairs for minimal overlap
          const opponentPairs = [];
          for (let i = 0; i < potentialOpponents.length; i++) {
            for (let j = i + 1; j < potentialOpponents.length; j++) {
              const player3 = potentialOpponents[i];
              const player4 = potentialOpponents[j];

              // Calculate "score" for this pairing based on recent match history
              const teamScore =
                (partnerships[player3]?.[player4] || 0) +
                (partnerships[player4]?.[player3] || 0);

              opponentPairs.push({
                players: [player3, player4],
                score: teamScore,
              });
            }
          }

          // Sort pairs by score, prioritize least played pairings
          opponentPairs.sort((a, b) => a.score - b.score);

          const selectedOpponents = opponentPairs[0].players;
          const [player3, player4] = selectedOpponents;
          console.log(`Opponent pair selected: ${player3}, ${player4}`);

          console.log("Final match pairing:", {
            team1: [player1, player2],
            team2: [player3, player4],
          });

          // Track partnerships
          usedPartnerships.add(`${player1}-${player2}`);
          usedPartnerships.add(`${player2}-${player1}`);
          usedPartnerships.add(`${player3}-${player4}`);
          usedPartnerships.add(`${player4}-${player3}`);

          // Create match
          newMatches.push({
            team1: [player1, player2],
            team2: [player3, player4],
            team1Score: 0,
            team2Score: 0,
            isScoreSubmitted: false,
          });

          // Update partnerships
          partnerships[player1][player2] =
            (partnerships[player1][player2] || 0) + 1;
          partnerships[player2][player1] =
            (partnerships[player2][player1] || 0) + 1;
          partnerships[player3][player4] =
            (partnerships[player3][player4] || 0) + 1;
          partnerships[player4][player3] =
            (partnerships[player4][player3] || 0) + 1;

          // Remove used players from the pool
          availablePlayers = availablePlayers.filter(
            (p) => ![player1, player2, player3, player4].includes(p)
          );
        }
      }
      setMatches(newMatches);
    },
    [
      courts,
      partnerships,
      sittingOutCounts,
      round,
      maxRounds,
      finalPairingPattern,
      scores,
    ]
  );

  const shuffle = (players: string[]): string[] => {
    const shuffledPlayers = [...players];
    for (let i = shuffledPlayers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledPlayers[i], shuffledPlayers[j]] = [
        shuffledPlayers[j],
        shuffledPlayers[i],
      ];
    }
    return shuffledPlayers;
  };

  const updateMatches = useCallback((updatedMatches: Match[]) => {
    console.log("Updating matches:", updatedMatches);
    setMatches([...updatedMatches]);
  }, []);

  const updateScores = useCallback((updatedScores: Scores) => {
    setScores(updatedScores);
  }, []);

  useEffect(() => {
    if (round > 1 && names.length > 0 && matches.length === 0) {
      if (format === "americano" && mode === "individual") {
        generateAmericanoMatches(names, courts);
      } else if (format === "americano" && mode === "team") {
        generateAmericanoMatchesTeamMode(names, courts);
      } else {
        generateMatches(names, courts);
      }
    }
  }, [
    round,
    names,
    generateMatches,
    generateAmericanoMatches,
    generateAmericanoMatchesTeamMode,
    courts,
    matches.length,
  ]);

  const checkTournamentEnd = useCallback(() => {
    if (maxRounds === null) return false; // Endless tournament
    const shouldEnd = round >= maxRounds;
    if (shouldEnd) {
      setIsFinished(true);
    }
    return shouldEnd;
  }, [round, maxRounds]);

  const handlePauseChange = (paused: boolean) => {
    setIsPaused(paused);
  };

  const nextRound = useCallback(() => {
    if (!checkTournamentEnd()) {
      setTournamentHistory((prevHistory) => {
        const newState = {
          matches: matches.map((match) => ({ ...match })),
          scores: JSON.parse(JSON.stringify(scores)),
          round,
          sittingOutPlayers: [...sittingOutPlayers],
        };
        return [...prevHistory, newState];
      });
      setMatches([]);
      setRound((prevRound) => prevRound + 1);
    }
  }, [checkTournamentEnd, matches, scores, round, sittingOutPlayers]);

  const handleTournamentNameSubmit: SubmitHandler<TournamentNameFormData> = (
    data
  ) => {
    setTournamentName(data.tournamentName);
    setIsTournamentNameSet(true);
  };

  const startFinalRound = useCallback(
    (editingScores: EditingScores) => {
      console.log("Starting final round:", {
        round,
        maxRounds,
        isLastRound: isLastRound(),
      });
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

        // Update matches played
        [...match.team1, ...match.team2].forEach((player) => {
          newScores[player].matchesPlayed += 1;
        });

        // Update points and points per round
        match.team1.forEach((player) => {
          newScores[player].points += team1Score;
          newScores[player].pointsPerRound[round - 1] = team1Score;
        });
        match.team2.forEach((player) => {
          newScores[player].points += team2Score;
          newScores[player].pointsPerRound[round - 1] = team2Score;
        });

        // Update wins
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

      // Update state
      updateMatches(updatedMatches);
      setScores(newScores);
      setMatches([]);
      setRound((prevRound) => prevRound + 1);
      setMaxRounds(round + 1);
    },
    [matches, round, updateMatches, scores, sittingOutPlayers]
  );

  const goBackToTournamentName = () => {
    setIsTournamentNameSet(false);
    setNumberOfPlayers(0);
    setArePlayerNamesSet(false);
  };

  const goBackToPlayerCount = () => {
    setNumberOfPlayers(0);
    setArePlayerNamesSet(false);
  };

  const goBackToPlayerNames = () => {
    setArePlayerNamesSet(false);
    setMatches([]);
    setScores({});
    setRound(1);
    setSittingOutPlayers([]);
    setSittingOutCounts({});
  };

  useEffect(() => {
    const sorted = Object.entries(scores).sort(
      ([, a], [, b]) => b.points - a.points
    );
    setSortedPlayers(sorted);
  }, [scores]);

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {(isTournamentNameSet || numberOfPlayers > 0) &&
        !arePlayerNamesSet &&
        matches.length === 0 && (
          <BackButton
            visible={matches.length === 0}
            onClick={
              numberOfPlayers > 0 ? goBackToPlayerCount : goBackToTournamentName
            }
          />
        )}

      {!isTournamentNameSet && (
        <TournamentNameForm onSubmit={handleTournamentNameSubmit} />
      )}

      {isTournamentNameSet && (
        <h1 className="text-center text-2xl font-bold my-6 text-gray-500">
          {tournamentName}
        </h1>
      )}

      {isTournamentNameSet && numberOfPlayers === 0 && (
        <NumOfPlayersForm onSubmit={onNumberSubmit} />
      )}

      {numberOfPlayers > 0 && isTournamentNameSet && !arePlayerNamesSet && (
        <>
          <BackButton onClick={goBackToPlayerCount} />
          <PlayerNamesForm
            initialPlayerCount={numberOfPlayers}
            onPlayerCountChange={(newCount) => setNumberOfPlayers(newCount)}
            mode={mode}
            onSubmit={(settings) => {
              console.log("Player Names Submitted:", settings.playerNames);

              // Ensure we have at least one court if none were selected
              const initialCourts =
                settings.courts.length > 0
                  ? settings.courts
                  : [{ id: 1, name: "Court 1" }];

              // First create the initial scores with team names
              const initialScores: Scores = {};
              if (settings.mode === "team") {
                // Process in pairs for team mode
                for (let i = 0; i < settings.playerNames.length; i += 2) {
                  const teamIndex = Math.floor(i / 2);
                  const teamName =
                    settings.teamNames?.[teamIndex] || `Team ${teamIndex + 1}`;

                  // Assign same team name to both players
                  settings.playerNames.slice(i, i + 2).forEach((name) => {
                    initialScores[name] = {
                      points: 0,
                      wins: 0,
                      matchesPlayed: 0,
                      pointsPerRound: [],
                      team: `team${teamIndex + 1}`,
                      teamName: teamName,
                    };
                  });
                }
              } else {
                // Individual mode
                settings.playerNames.forEach((name) => {
                  initialScores[name] = {
                    points: 0,
                    wins: 0,
                    matchesPlayed: 0,
                    pointsPerRound: [],
                  };
                });
              }

              // Then set all the state
              setNames(settings.playerNames);
              setPointsPerMatch(settings.pointsPerMatch);
              setMaxRounds(settings.maxRounds);
              setCourts(initialCourts);
              setMode(settings.mode);
              setScores(initialScores);
              setSittingOutCounts({});

              // Just call generateMatches directly
              if (format === "americano" && mode === "individual") {
                generateAmericanoMatches(settings.playerNames, initialCourts);
              } else if (format === "americano" && mode === "team") {
                generateAmericanoMatchesTeamMode(
                  settings.playerNames,
                  initialCourts
                );
              } else {
                generateMatches(settings.playerNames, initialCourts);
              }
              setArePlayerNamesSet(true);

              // Update the final round pattern
              setFinalPairingPattern(settings.finalRoundPattern);
            }}
          />
        </>
      )}

      {matches.length > 0 && !isFinished && !isPaused && (
        <BackButton onClick={goBackToPlayerNames} />
      )}

      {matches.length > 0 && (
        <div className="flex flex-col items-center relative space-y-4">
          {isFinished || isPaused ? (
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-white">
                {isFinished ? (
                  <>
                    Tournament Complete!
                    <p className="text-lg mt-2 text-white">
                      Congratulations to{" "}
                      {
                        Object.entries(scores).sort(
                          (a, b) => b[1].points - a[1].points
                        )[0][0]
                      }
                      !
                    </p>
                  </>
                ) : (
                  "Tournament Paused"
                )}
              </h2>
              <div className="p-6 bg-yellow-50 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-4">
                  {isFinished ? "Final" : "Current"} Standings
                </h3>
                <PlayerScores scores={scores} />
              </div>
              {!isFinished && (
                <div className="space-x-3">
                  <Button
                    onClick={() => setIsPaused(false)}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    Resume Tournament
                  </Button>
                  <Button
                    onClick={() => setIsFinished(true)}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    End Tournament
                  </Button>
                </div>
              )}
              {isFinished && (
                <Button
                  onClick={() => {
                    localStorage.removeItem(STORAGE_KEY);
                    window.location.reload();
                  }}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Start New Tournament
                </Button>
              )}
            </div>
          ) : (
            <>
              {isLastRound() && (
                <div className="mb-4 p-4 bg-orange-100 rounded-lg text-center">
                  <h3 className="font-semibold text-orange-800">
                    Final Round!
                  </h3>
                </div>
              )}

              {sittingOutPlayers.length > 0 && (
                <div className="mb-4 p-4 bg-yellow-100 rounded-lg text-center">
                  <h3 className="font-semibold text-yellow-800">
                    Sitting Out This Round:
                  </h3>
                  <p className="text-yellow-700">
                    {sittingOutPlayers.join(", ")}
                  </p>
                </div>
              )}

              <Matches
                matches={matches}
                scores={scores}
                round={round}
                onUpdateMatches={updateMatches}
                onUpdateScores={updateScores}
                onNextRound={nextRound}
                pointsPerMatch={pointsPerMatch}
                isLastRound={isLastRound()}
                courts={courts}
                mode={mode}
                sittingOutPlayers={sittingOutPlayers}
                onStartFinalRound={startFinalRound}
                onPause={handlePauseChange}
              />
            </>
          )}
        </div>
      )}

      {showRestoreDialog && (
        <RestoreDialog
          onRestore={() => {
            loadTournamentState();
            setShowRestoreDialog(false);
          }}
          onNew={() => {
            localStorage.removeItem(STORAGE_KEY);
            setShowRestoreDialog(false);
          }}
        />
      )}
    </div>
  );
}
