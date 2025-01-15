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
    team?: string;
    teamName?: string;
  };
}

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [numberOfPlayers, setNumberOfPlayers] = useState<number>(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [names, setNames] = useState<string[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [scores, setScores] = useState<{
    [key: string]: {
      points: number;
      wins: number;
      matchesPlayed: number;
    };
  }>({});
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [isTournamentNameSet, numberOfPlayers, arePlayerNamesSet]);

  const onNumberSubmit = ({
    mode,
    count,
  }: {
    mode: "individual" | "team";
    count: number;
  }) => {
    console.log("Number Submit with Count:", count);
    if (count >= 4) {
      setMode(mode);
      setNumberOfPlayers(count);
    } else {
      alert("Minimum 4 players required.");
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const generateMatches = useCallback(
    (players: string[], courtsToUse = courts) => {
      const allUnits = [...players];
      const unitsPerMatch = mode === "team" ? 2 : 4;

      // Sort by score for matchmaking
      const sortedUnits =
        round === 1
          ? shuffle(allUnits)
          : allUnits.sort((a, b) => scores[b].points - scores[a].points);

      // Calculate matches based on available players and courts
      const maxMatchesByPlayers = Math.floor(
        sortedUnits.length / unitsPerMatch
      );
      const numMatches = Math.min(maxMatchesByPlayers, courtsToUse.length);
      const numPlayersNeeded = numMatches * unitsPerMatch;
      const numSittingOut = sortedUnits.length - numPlayersNeeded;

      // Handle sitting out - Select players who have sat out the least
      let sittingOut: string[] = [];
      if (numSittingOut > 0) {
        // Sort players by number of times they've sat out
        const playersBySitouts = [...allUnits].sort(
          (a, b) => (sittingOutCounts[a] || 0) - (sittingOutCounts[b] || 0)
        );

        // Take the first N players who have sat out the least
        sittingOut = playersBySitouts.slice(0, numSittingOut);

        // Update sitting out counts
        const newSittingOutCounts = { ...sittingOutCounts };
        sittingOut.forEach((unit) => {
          newSittingOutCounts[unit] = (newSittingOutCounts[unit] || 0) + 1;
        });
        setSittingOutCounts(newSittingOutCounts);
      }

      setSittingOutPlayers(sittingOut);

      // Remove sitting out players from the sorted units
      const activeUnits = sortedUnits.filter(
        (unit) => !sittingOut.includes(unit)
      );

      // Create matches using the active (ranked) units
      const newMatches: Match[] = [];
      for (let i = 0; i < numMatches; i++) {
        const startIdx = i * unitsPerMatch;
        if (mode === "team") {
          newMatches.push({
            team1: [activeUnits[startIdx]],
            team2: [activeUnits[startIdx + 1]],
            team1Score: 0,
            team2Score: 0,
            isScoreSubmitted: false,
          });
        } else {
          newMatches.push({
            team1: [activeUnits[startIdx], activeUnits[startIdx + 2]],
            team2: [activeUnits[startIdx + 1], activeUnits[startIdx + 3]],
            team1Score: 0,
            team2Score: 0,
            isScoreSubmitted: false,
          });
        }
      }

      setMatches(newMatches);
    },
    [round, scores, mode, sittingOutCounts, courts]
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

  const updateScores = useCallback(
    (updatedScores: {
      [key: string]: {
        points: number;
        wins: number;
        matchesPlayed: number;
      };
    }) => {
      setScores(updatedScores);
    },
    []
  );

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
      setMatches([]); // Clear matches before incrementing round
      setRound((prevRound) => prevRound + 1);
    }
  }, [checkTournamentEnd]);

  const handleTournamentNameSubmit: SubmitHandler<TournamentNameFormData> = (
    data
  ) => {
    setTournamentName(data.tournamentName);
    setIsTournamentNameSet(true);
  };

  const isLastRound = useCallback(() => {
    return maxRounds !== null && round === maxRounds;
  }, [maxRounds, round]);

  return (
    <div className="max-w-md mx-auto px-4 py-8 sm:px-6 md:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
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
          }}
        />
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
                  onClick={() => window.location.reload()}
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
              />

              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
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
                  Stop Tournament
                </Button>
              </div>

              <Scoreboard
                isOpen={isModalOpen}
                onClose={closeModal}
                scores={scores}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
