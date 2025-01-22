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
import { Match, Scores, EditingScores } from "../lib/types";
import BackButton from "./ui/backButton";
import { generateMatches } from "../lib/mexicanoGenerator";
import {
  generateAmericanoMatches,
  generateAmericanoMatchesTeamMode,
  updatePartnerships,
} from "../lib/americanoGenerator";
import Footer from "./Footer";
import { trackEvent } from "@/lib/analytics";

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
  const [partnerships, setPartnerships] = useState<{
    [key: string]: { [key: string]: number };
  }>({});
  const [pointSystem, setPointSystem] = useState<
    "pointsToPlay" | "pointsToWin"
  >("pointsToPlay");
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
      partnerships,
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
      setPointSystem(state.pointSystem);
      setIsFinished(state.isFinished);
      setMaxRounds(state.maxRounds);
      setIsPaused(state.isPaused);
      setCourts(state.courts);
      setMode(state.mode);
      setNumberOfPlayers(state.numberOfPlayers);
      setIsTournamentNameSet(state.isTournamentNameSet);
      setArePlayerNamesSet(state.arePlayerNamesSet);
      setTournamentHistory(state.tournamentHistory || []);
      setPartnerships(state.partnerships || {});
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
    partnerships,
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

  const isLastRound = useCallback(() => {
    return maxRounds !== null && round === maxRounds;
  }, [maxRounds, round]);

  const updateMatches = useCallback((updatedMatches: Match[]) => {
    setMatches([...updatedMatches]);
  }, []);

  const updateScores = useCallback((updatedScores: Scores) => {
    setScores(updatedScores);
  }, []);

  useEffect(() => {
    if (round > 1 && names.length > 0 && matches.length === 0) {
      if (format === "americano" && mode === "individual") {
        const newMatches = generateAmericanoMatches(
          names,
          courts,
          partnerships,
          round,
          sittingOutCounts,
          setSittingOutCounts,
          setSittingOutPlayers,
          maxRounds,
          finalPairingPattern,
          scores
        );
        const updatedPartnerships = updatePartnerships(
          partnerships,
          newMatches
        );
        setPartnerships(updatedPartnerships);
        setMatches(newMatches);
      } else if (format === "americano" && mode === "team") {
        const newMatches = generateAmericanoMatchesTeamMode(
          names,
          courts,
          partnerships,
          round,
          sittingOutCounts,
          setSittingOutCounts,
          setSittingOutPlayers,
          mode
        );
        setMatches(newMatches);
      } else {
        const newMatches = generateMatches(
          names,
          courts,
          round,
          scores,
          mode,
          sittingOutCounts,
          setSittingOutCounts,
          setSittingOutPlayers,
          maxRounds,
          finalPairingPattern
        );
        setMatches(newMatches);
      }
    }
  }, [
    round,
    names,
    courts,
    matches.length,
    format,
    mode,
    partnerships,
    sittingOutCounts,
    maxRounds,
    finalPairingPattern,
    scores,
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
    trackEvent("tournament_paused", "game_progress", tournamentName);
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
      trackEvent("final_round_started", "game_progress", tournamentName);
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
    [matches, round, updateMatches, scores, sittingOutPlayers, tournamentName]
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
    <article>
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
        <h1 className="text-center text-2xl font-bold my-8 text-gray-500">
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
              setPointsPerMatch(settings.points);
              setMaxRounds(settings.maxRounds);
              setCourts(initialCourts);
              setMode(settings.mode);
              setScores(initialScores);
              setSittingOutCounts({});
              setPointSystem(settings.pointSystem);
              // Generate first round matches
              let initialMatches: Match[];
              if (format === "americano" && mode === "individual") {
                initialMatches = generateAmericanoMatches(
                  settings.playerNames,
                  initialCourts,
                  partnerships,
                  round,
                  sittingOutCounts,
                  setSittingOutCounts,
                  setSittingOutPlayers,
                  maxRounds,
                  finalPairingPattern,
                  scores
                );
                // Update partnerships after generating matches
                const updatedPartnerships = updatePartnerships(
                  partnerships,
                  initialMatches
                );
                setPartnerships(updatedPartnerships);
              } else if (format === "americano" && mode === "team") {
                initialMatches = generateAmericanoMatchesTeamMode(
                  settings.playerNames,
                  initialCourts,
                  partnerships,
                  round,
                  sittingOutCounts,
                  setSittingOutCounts,
                  setSittingOutPlayers,
                  mode
                );
              } else {
                initialMatches = generateMatches(
                  settings.playerNames,
                  initialCourts,
                  round,
                  scores,
                  mode,
                  sittingOutCounts,
                  setSittingOutCounts,
                  setSittingOutPlayers,
                  maxRounds,
                  finalPairingPattern
                );
              }
              setMatches(initialMatches);
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
        <div className="flex flex-col items-center relative space-y-4 mb-12">
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
              <div className="p-6 bg-gray-50 rounded-lg shadow-lg">
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
                  className="bg-yellow-600 hover:bg-yellow-700"
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
                <div className="mb-4 p-4 bg-gray-300 rounded-lg text-center">
                  <h3 className="font-semibold">Sitting Out This Round:</h3>
                  <p>{sittingOutPlayers.join(", ")}</p>
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
                pointSystem={pointSystem}
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
      <Footer />
    </article>
  );
}
