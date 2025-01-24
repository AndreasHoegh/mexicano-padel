"use client";

import { useEffect, useState, useCallback } from "react";
import type { SubmitHandler } from "react-hook-form";
import TournamentNameForm, {
  type TournamentNameFormData,
} from "./TournamentNameForm";
import NumOfPlayersForm from "./NumOfPlayersForm";
import PlayerNamesForm from "./PlayerNamesForm";
import Matches from "./Matches";
import { Button } from "./ui/button";
import PlayerScores from "./PlayerScores";
import {
  type Court,
  type PlayerScore,
  type Match,
  type GroupStanding,
  type Scores,
} from "../lib/types";
import RestoreDialog from "./RestoreDialog";
import type { EditingScores } from "../lib/types";
import BackButton from "./ui/backButton";
import { generateMatches } from "../lib/mexicanoGenerator";
import {
  generateAmericanoMatches,
  generateAmericanoMatchesTeamMode,
  updatePartnerships,
} from "../lib/americanoGenerator";
import Footer from "./Footer";
import { trackEvent } from "@/lib/analytics";
import { generateGroupMatches } from "../lib/groupGenerator";
import { useTournament } from "@/app/hooks/useTournament";

export default function App() {
  const [numberOfPlayers, setNumberOfPlayers] = useState<number>(0);
  const [names, setNames] = useState<string[]>([]);
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
  const [format, setFormat] = useState<"mexicano" | "americano" | "groups">(
    "mexicano"
  );
  const [partnerships, setPartnerships] = useState<{
    [key: string]: { [key: string]: number };
  }>({});
  const [pointSystem, setPointSystem] = useState<
    "pointsToPlay" | "pointsToWin" | "TimePlay"
  >("pointsToPlay");
  const [groupStandings, setGroupStandings] = useState<{
    [key: number]: GroupStanding[];
  }>({});
  const [teamsAdvancing, setTeamsAdvancing] = useState<number>(2);
  const STORAGE_KEY = "tournament_state";

  const {
    matches,
    scores,
    round,
    isGroupStage,
    knockoutMatches,
    updateMatches,
    updateScores,
    startKnockoutStage,
    setMatches,
    setScores,
    setRound,
    setIsGroupStage,
    setKnockoutMatches,
  } = useTournament();

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
      groupStandings,
      isGroupStage,
      knockoutMatches,
      teamsAdvancing,
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
      setGroupStandings(state.groupStandings || {});
      setIsGroupStage(state.isGroupStage);
      setKnockoutMatches(state.knockoutMatches || []);
      setTeamsAdvancing(state.teamsAdvancing || 2);
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
    groupStandings,
    isGroupStage,
    knockoutMatches,
    teamsAdvancing,
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
    format: "mexicano" | "americano" | "groups";
    count: number;
  }) => {
    if (count < 4) {
      return;
    }
    setMode(mode);
    setFormat(format);
    setNumberOfPlayers(count);
  };

  const isLastRound = useCallback(() => {
    return maxRounds !== null && round === maxRounds;
  }, [maxRounds, round]);

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
    if (maxRounds === null) return false;
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
      setRound((prevRound: number) => prevRound + 1);
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
      const newScores = { ...scores };

      sittingOutPlayers.forEach((player) => {
        newScores[player].pointsPerRound[round - 1] = "sitout";
      });

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

      const updatedMatches = matches.map((match, index) => ({
        ...match,
        team1Score: editingScores[index].team1,
        team2Score: editingScores[index].team2,
        isScoreSubmitted: true,
      }));

      updateMatches(updatedMatches);
      setScores(newScores);
      setMatches([]);
      setRound((prevRound: number) => prevRound + 1);
      setMaxRounds(round + 1);
    },
    [matches, round, updateMatches, scores, sittingOutPlayers, tournamentName]
  );

  const goBackToTournamentName = () => {
    setIsTournamentNameSet(false);
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
    <article className="flex flex-col min-h-screen">
      {(isTournamentNameSet || numberOfPlayers > 0) &&
        !arePlayerNamesSet &&
        matches.length === 0 && (
          <BackButton
            visible={matches.length === 0}
            onClick={goBackToTournamentName}
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

      {isTournamentNameSet && !arePlayerNamesSet && (
        <div className="space-y-8 px-4 max-w-3xl mx-auto w-full">
          <NumOfPlayersForm onSubmit={onNumberSubmit} />

          <PlayerNamesForm
            initialPlayerCount={numberOfPlayers}
            onPlayerCountChange={(newCount) => setNumberOfPlayers(newCount)}
            mode={mode}
            format={format}
            onSubmit={(settings) => {
              const initialCourts =
                settings.courts.length > 0
                  ? settings.courts
                  : [{ id: 1, name: "Court 1" }];

              const initialScores: Scores = {};
              if (settings.mode === "team") {
                for (let i = 0; i < settings.playerNames.length; i += 2) {
                  const teamIndex = Math.floor(i / 2);
                  const teamName =
                    settings.teamNames?.[teamIndex] || `Team ${teamIndex + 1}`;

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
                settings.playerNames.forEach((name) => {
                  initialScores[name] = {
                    points: 0,
                    wins: 0,
                    matchesPlayed: 0,
                    pointsPerRound: [],
                  };
                });
              }

              setNames(settings.playerNames);
              setPointsPerMatch(settings.points);
              setMaxRounds(settings.maxRounds);
              setCourts(initialCourts);
              setMode(settings.mode);
              setScores(initialScores);
              setSittingOutCounts({});
              setPointSystem(settings.pointSystem);
              setTeamsAdvancing(settings.teamsAdvancing || 2);

              let initialMatches: Match[];
              if (
                settings.format === "americano" &&
                settings.mode === "individual"
              ) {
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
                const updatedPartnerships = updatePartnerships(
                  partnerships,
                  initialMatches
                );
                setPartnerships(updatedPartnerships);
              } else if (
                settings.format === "americano" &&
                settings.mode === "team"
              ) {
                initialMatches = generateAmericanoMatchesTeamMode(
                  settings.playerNames,
                  initialCourts,
                  partnerships,
                  round,
                  sittingOutCounts,
                  setSittingOutCounts,
                  setSittingOutPlayers,
                  settings.mode
                );
              } else if (settings.format === "groups") {
                const { groupMatches, knockoutMatches, groups } =
                  generateGroupMatches(
                    settings.playerNames,
                    settings.teamsPerGroup || 4,
                    settings.teamsAdvancing || 2
                  );
                initialMatches = [...groupMatches];
                setKnockoutMatches(knockoutMatches);

                const initialStandings: { [key: number]: GroupStanding[] } = {};
                Object.entries(groups).forEach(([groupNum, teams]) => {
                  initialStandings[Number.parseInt(groupNum)] = teams.map(
                    (team) => ({
                      teamName: team,
                      points: 0,
                      matchesPlayed: 0,
                      wins: 0,
                    })
                  );
                });
                setGroupStandings(initialStandings);
              } else {
                initialMatches = generateMatches(
                  settings.playerNames,
                  initialCourts,
                  round,
                  scores,
                  settings.mode,
                  sittingOutCounts,
                  setSittingOutCounts,
                  setSittingOutPlayers,
                  maxRounds,
                  finalPairingPattern
                );
              }
              setMatches(initialMatches);
              setArePlayerNamesSet(true);

              setFinalPairingPattern(settings.finalRoundPattern);
            }}
          />
        </div>
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
                onUpdateKnockoutMatches={setKnockoutMatches}
                maxRounds={maxRounds}
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
                format={format}
                groupStandings={groupStandings}
                isGroupStage={isGroupStage}
                onUpdateGroupStandings={(newGroupStandings) =>
                  setGroupStandings(newGroupStandings)
                }
                onStartKnockoutStage={startKnockoutStage}
                knockoutMatches={knockoutMatches}
                teamsAdvancing={teamsAdvancing}
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
