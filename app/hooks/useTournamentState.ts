// hooks/useTournamentState.ts
import { useEffect, useState, useCallback } from "react";
import { useTournament } from "./useTournament";
import {
  Match,
  Scores,
  Court,
  GroupStanding,
  PlayerScore,
  EditingScores,
} from "@/lib/types";
import { generateMatches } from "@/lib/mexicanoGenerator";
import {
  generateAmericanoMatches,
  generateAmericanoMatchesTeamMode,
  updatePartnerships,
} from "@/lib/americanoGenerator";
import { generateGroupMatches } from "@/lib/groupGenerator";
import { trackEvent } from "@/lib/analytics";

export const useTournamentState = () => {
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
  const [maxRounds, setMaxRounds] = useState<number>(10);
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
    "pointsToPlay" | "pointsToWin" | "TimePlay" | "Match"
  >("pointsToPlay");
  const [groupStandings, setGroupStandings] = useState<{
    [key: number]: GroupStanding[];
  }>({});
  const [teamsAdvancing, setTeamsAdvancing] = useState<number>(2);
  const STORAGE_KEY = "tournament_state";

  // Save and load tournament state
  const saveTournamentState = useCallback(() => {
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

  const loadTournamentState = useCallback(() => {
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
  }, []);

  const checkTournamentEnd = useCallback(() => {
    if (maxRounds === null) return false;
    const shouldEnd = round >= maxRounds;
    if (shouldEnd) {
      setIsFinished(true);
    }
    return shouldEnd;
  }, [round, maxRounds]);

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

  const handleTournamentNameSubmit = (data: { tournamentName: string }) => {
    setTournamentName(data.tournamentName);
    setIsTournamentNameSet(true);
  };

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

  const handlePlayerNamesSubmit = (settings: {
    playerNames: string[];
    courts: Court[];
    points: number;
    maxRounds: number;
    format: "mexicano" | "americano" | "groups";
    mode: "individual" | "team";
    teamsPerGroup?: number;
    pointSystem: "pointsToPlay" | "pointsToWin" | "TimePlay" | "Match";
    teamsAdvancing?: number;
    finalRoundPattern?: number[];
    teamNames?: string[];
  }) => {
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
    if (settings.format === "americano" && settings.mode === "individual") {
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
    } else if (settings.format === "americano" && settings.mode === "team") {
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
      const { groupMatches, knockoutMatches, groups } = generateGroupMatches(
        settings.playerNames,
        settings.teamsPerGroup || 4,
        settings.teamsAdvancing || 2
      );
      initialMatches = [...groupMatches];
      setKnockoutMatches(knockoutMatches);

      const initialStandings: { [key: number]: GroupStanding[] } = {};
      Object.entries(groups).forEach(([groupNum, teams]) => {
        initialStandings[Number.parseInt(groupNum)] = teams.map((team) => ({
          teamName: team,
          points: 0,
          matchesPlayed: 0,
          wins: 0,
        }));
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
    setFinalPairingPattern(settings.finalRoundPattern || [0, 1, 2, 3]);
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

  const handlePauseChange = (paused: boolean) => {
    trackEvent("tournament_paused", "game_progress", tournamentName);
    setIsPaused(paused);
  };

  return {
    // State
    numberOfPlayers,
    names,
    tournamentName,
    isTournamentNameSet,
    arePlayerNamesSet,
    sittingOutPlayers,
    sittingOutCounts,
    pointsPerMatch,
    isFinished,
    maxRounds,
    isPaused,
    courts,
    mode,
    showRestoreDialog,
    finalPairingPattern,
    tournamentHistory,
    sortedPlayers,
    format,
    partnerships,
    pointSystem,
    groupStandings,
    teamsAdvancing,
    matches,
    scores,
    round,
    isGroupStage,
    knockoutMatches,
    // Functions
    setNumberOfPlayers,
    setNames,
    setTournamentName,
    setIsTournamentNameSet,
    setArePlayerNamesSet,
    setSittingOutPlayers,
    setSittingOutCounts,
    setPointsPerMatch,
    setIsFinished,
    setMaxRounds,
    setIsPaused,
    setCourts,
    setMode,
    setShowRestoreDialog,
    setFinalPairingPattern,
    setTournamentHistory,
    setSortedPlayers,
    setFormat,
    setPartnerships,
    setPointSystem,
    setGroupStandings,
    setTeamsAdvancing,
    updateMatches,
    updateScores,
    startKnockoutStage,
    setMatches,
    setScores,
    setRound,
    setIsGroupStage,
    setKnockoutMatches,
    saveTournamentState,
    loadTournamentState,
    nextRound,
    checkTournamentEnd,
    handleTournamentNameSubmit,
    onNumberSubmit,
    handlePlayerNamesSubmit,
    startFinalRound,
    goBackToTournamentName,
    goBackToPlayerNames,
    handlePauseChange,
  };
};
