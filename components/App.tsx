"use client";

import { useEffect, useState, useCallback } from "react";
import { SubmitHandler } from "react-hook-form";
import TournamentNameForm, {
  TournamentNameFormData,
} from "./TournamentNameForm";
import NumOfPlayersForm from "./NumOfPlayersForm";
import PlayerNamesForm from "./PlayerNamesForm";
import Matches from "./Matches";
import Scoreboard from "./Scoreboard";
import { Trophy } from "lucide-react";
import { Button } from "./ui/button";
import PlayerScores from "./PlayerScores";
import { Court, PlayerScore } from "../lib/types";
import RestoreDialog from "./RestoreDialog";
import DetailsModal from "./DetailsModal";
import generateAmericanoMatches from "@/lib/generateAmericanoMatches";

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

interface PlayerPartnerships {
  [key: string]: {
    [key: string]: number; // Number of times played together
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
    className={`absolute top-4 left-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors ${
      !visible ? "hidden" : ""
    }`}
  >
    <span className="text-lg">←</span>
    <span className="font-medium">Back</span>
  </Button>
);

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [sortedPlayers, setSortedPlayers] = useState<[string, PlayerScore][]>(
    []
  );
  const [getRowColor, setGetRowColor] = useState<(index: number) => string>(
    () => () => ""
  );
  const [format, setFormat] = useState<"mexicano" | "americano">("mexicano");
  const [partnerships, setPartnerships] = useState<PlayerPartnerships>({});
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
  }, [isTournamentNameSet, numberOfPlayers, arePlayerNamesSet]);

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

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const isLastRound = useCallback(() => {
    return maxRounds !== null && round === maxRounds;
  }, [maxRounds, round]);

  const generateMatches = useCallback(
    (players: string[], courtsToUse = courts) => {
      if (format === "americano") {
        const result = generateAmericanoMatches(
          players,
          courtsToUse.length,
          round,
          playerHistory,
          sittingOutCounts
        );

        setPlayerHistory(result.playerHistory);
        setMatches(result.matches);
        setSittingOutPlayers(result.sittingOut);

        // Update sitout counts
        const newSittingOutCounts = { ...sittingOutCounts };
        result.sittingOut.forEach((player) => {
          newSittingOutCounts[player] = (newSittingOutCounts[player] || 0) + 1;
        });
        setSittingOutCounts(newSittingOutCounts);
      } else {
        // Other formats (non-Americano) remain unchanged
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
      }
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
    ]
  );

  // Add this function to get the pattern for each round
  const getMatchPattern = (roundIndex: number): number[] => {
    const patterns = [
      [0, 2, 1, 3], // Round 1: 1&3 vs 2&4
      [0, 3, 1, 2], // Round 2: 1&4 vs 2&3
      [0, 1, 2, 3], // Round 3: 1&2 vs 3&4
    ];
    return patterns[roundIndex % 3]; // Use modulo to loop through patterns
  };

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
      console.log("Generating matches for round:", round, "with names:", names);
      generateMatches(names, courts);
    }
  }, [round, names, generateMatches, courts, matches.length]); // Only add matches.length

  const checkTournamentEnd = useCallback(() => {
    if (maxRounds === null) return false; // Endless tournament
    const shouldEnd = round >= maxRounds;
    if (shouldEnd) {
      setIsFinished(true);
    }
    return shouldEnd;
  }, [round, maxRounds]);

  const nextRound = useCallback(() => {
    if (!checkTournamentEnd()) {
      // Save current state to history BEFORE clearing matches
      setTournamentHistory((prevHistory) => {
        const newState = {
          matches: matches.map((match) => ({ ...match })),
          scores: JSON.parse(JSON.stringify(scores)),
          round,
          sittingOutPlayers: [...sittingOutPlayers],
        };
        return [...prevHistory, newState];
      });

      // Then clear matches and increment round
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

  useEffect(() => {
    setGetRowColor(() => (index: number) => {
      if (index === 0) return "bg-yellow-100";
      if (index === 1) return "bg-gray-100";
      if (index === 2) return "bg-orange-100";
      return index % 2 === 0 ? "bg-white" : "bg-gray-50";
    });
  }, [sortedPlayers]);

  // Helper function to generate all possible combinations
  function getAllCombinations<T>(arr: T[], n: number): T[][] {
    const array = Array.from(arr);
    if (n === 1) return array.map((item) => [item]);

    const combinations: T[][] = [];

    for (let i = 0; i < array.length - n + 1; i++) {
      const current = array[i];
      const subCombinations = getAllCombinations(array.slice(i + 1), n - 1);

      for (const subComb of subCombinations) {
        combinations.push([current, ...subComb]);
      }
    }

    return combinations;
  }

  // Add this function near your other utility functions
  function shuffleCombinations<T>(combinations: T[][]): T[][] {
    const shuffled = [...combinations];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

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
        <h1 className="text-center text-2xl font-bold mb-6">
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
            numberOfPlayers={numberOfPlayers}
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
              generateMatches(settings.playerNames, initialCourts);
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
              <h2 className="text-2xl font-bold text-green-600">
                {isFinished ? (
                  <>
                    Tournament Complete!
                    <p className="text-lg mt-2 text-gray-600">
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
              />

              <div className="mt-8 flex flex-col justify-center gap-3">
                <button
                  onClick={openModal}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg shadow-lg flex items-center justify-center gap-2"
                >
                  <Trophy className="h-5 w-5" />
                  <span>View Standings</span>
                </button>

                <Button
                  onClick={() => setIsPaused(true)}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 flex items-center justify-center gap-2"
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
