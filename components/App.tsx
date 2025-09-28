"use client";

import { useEffect, useState, useCallback } from "react";
import type { SubmitHandler } from "react-hook-form";
import TournamentNameForm, {
  type TournamentNameFormData,
} from "./tournamentSetup/TournamentNameForm";
import TournamentSettings from "./tournamentSetup/TournamentSettings";
import Matches from "./match/Matches";
import type {
  Court,
  Match,
  Scores,
  EditingScores,
  Tournament,
} from "../lib/types";
import RestoreDialog from "./RestoreDialog";
import BackButton from "./ui/backButton";
import { generateMatches } from "@/lib/generators/mexicanoGenerator";
import {
  generateAmericanoMatches,
  generateAmericanoMatchesTeamMode,
  updatePartnerships,
} from "@/lib/generators/americanoGenerator";
import Footer from "./Footer";
import TournamentPaused from "./match/TournamentPaused";
import { ShareButton } from "./ui/ShareButton";
import {
  generateTournamentId,
  saveTournamentState as saveState,
  loadTournamentState as loadState,
  getTournamentShareUrl,
} from "../lib/tournamentStorage";
import { saveScores, loadScores } from "../lib/tournamentStorage";
import { useAuth } from "@/lib/AuthContext";
import AuthForms from "./auth/AuthForms";
import {
  getTournamentHistory,
  createTournament,
} from "../services/tournamentService";
import { completeTournament } from "../services/handleTournamentComplete";
import TournamentResult from "./TournamentResult";
import NavBar from "./NavBar";

export default function App() {
  const { isAuthenticated, user, updateUser, logout } = useAuth();
  const [editingScores, setEditingScores] = useState<EditingScores>({});
  const updateEditingScores = (newScores: EditingScores) => {
    if (isReadOnly) return; // Prevent edits in read-only mode
    setEditingScores(newScores);
    updateUrlWithScores(newScores);

    // Broadcast score update to any view-only links
    if (tournamentId) {
      const scoreUpdateEvent = new CustomEvent("scoreUpdate", {
        detail: {
          tournamentId,
          scores: newScores,
        },
      });
      window.dispatchEvent(scoreUpdateEvent);
    }
  };
  const [tournamentId, setTournamentId] = useState<string>("");
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
  const [format, setFormat] = useState<"mexicano" | "americano">("mexicano");
  const [partnerships, setPartnerships] = useState<{
    [key: string]: { [key: string]: number };
  }>({});
  const [pointSystem, setPointSystem] = useState<
    "pointsToPlay" | "pointsToWin" | "TimePlay"
  >("pointsToPlay");

  const STORAGE_KEY = "tournament_state";

  const [matches, setMatches] = useState<Match[]>([]);
  const [scores, setScores] = useState<Scores>({});
  const [round, setRound] = useState<number>(1);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  const [isReadOnly, setIsReadOnly] = useState<boolean>(false);

  const updateMatches = (updatedMatches: Match[]) => {
    if (isReadOnly) return;
    setMatches(updatedMatches);
  };

  const updateScores = (updatedScores: Scores) => {
    if (isReadOnly) return;
    setScores(updatedScores);
  };

  const updateUrlWithScores = (newScores: EditingScores) => {
    if (tournamentId) {
      const newUrl = getTournamentShareUrl(tournamentId, newScores);
      window.history.replaceState(
        { tournamentId, scores: newScores },
        "",
        newUrl
      );
    }
  };

  useEffect(() => {
    // Check for tournament ID in URL
    const params = new URLSearchParams(window.location.search);
    const urlTournamentId = params.get("tournamentId");
    const urlScores = params.get("scores");
    const urlReadonly = params.get("readonly");
    const urlState = params.get("state");

    setIsReadOnly(urlReadonly === "1");

    if (urlTournamentId) {
      // Always set the tournament ID first
      setTournamentId(urlTournamentId);

      const savedState = loadState(urlTournamentId);
      if (savedState) {
        // Load all state from saved tournament
        setNames(savedState.names);
        setMatches(savedState.matches);
        setScores(savedState.scores);
        setRound(savedState.round);
        setTournamentName(savedState.tournamentName);
        setSittingOutPlayers(savedState.sittingOutPlayers);
        setSittingOutCounts(savedState.sittingOutCounts);
        setPointsPerMatch(savedState.pointsPerMatch);
        setPointSystem(savedState.pointSystem);
        setIsFinished(savedState.isFinished);
        setMaxRounds(savedState.maxRounds);
        setIsPaused(savedState.isPaused);
        setCourts(savedState.courts);
        setMode(savedState.mode);
        setNumberOfPlayers(savedState.numberOfPlayers);
        setIsTournamentNameSet(savedState.isTournamentNameSet);
        setArePlayerNamesSet(savedState.arePlayerNamesSet);
        setTournamentHistory(savedState.tournamentHistory || []);
        setPartnerships(savedState.partnerships || {});

        // Load editingScores from URL, localStorage, or saved state
        let loadedEditingScores;
        if (urlScores && !urlReadonly) {
          try {
            loadedEditingScores = JSON.parse(urlScores);
          } catch (error) {
            console.error("Error parsing URL scores:", error);
          }
        }
        if (!loadedEditingScores) {
          loadedEditingScores = loadScores(urlTournamentId);
        }
        if (!loadedEditingScores && savedState.editingScores) {
          loadedEditingScores = savedState.editingScores;
        }
        if (loadedEditingScores) {
          setEditingScores(loadedEditingScores);
        }
      }

      // If read-only and an embedded state exists, prefer it for display
      if (urlReadonly && urlState) {
        try {
          const decoded = JSON.parse(decodeURIComponent(urlState));
          setNames(decoded.names);
          setMatches(decoded.matches);
          setScores(decoded.scores);
          setRound(decoded.round);
          setTournamentName(decoded.tournamentName);
          setSittingOutPlayers(decoded.sittingOutPlayers);
          setSittingOutCounts(decoded.sittingOutCounts);
          setPointsPerMatch(decoded.pointsPerMatch);
          setPointSystem(decoded.pointSystem);
          setIsFinished(decoded.isFinished);
          setMaxRounds(decoded.maxRounds);
          setIsPaused(decoded.isPaused);
          setCourts(decoded.courts);
          setMode(decoded.mode);
          setNumberOfPlayers(decoded.numberOfPlayers);
          setIsTournamentNameSet(decoded.isTournamentNameSet);
          setArePlayerNamesSet(decoded.arePlayerNamesSet);
          setTournamentHistory(decoded.tournamentHistory || []);
          setPartnerships(decoded.partnerships || {});
          setEditingScores(decoded.editingScores || {});
        } catch (e) {
          console.warn("Failed to parse embedded state from URL", e);
        }
      }

      // Set up live score updates for all link types
      const checkForUpdates = () => {
        try {
          // Check for score updates
          const currentScores = loadScores(urlTournamentId);
          if (
            currentScores &&
            JSON.stringify(currentScores) !== JSON.stringify(editingScores)
          ) {
            setEditingScores(currentScores);
            // Also update URL for normal links
            if (!urlReadonly) {
              updateUrlWithScores(currentScores);
            }
          }

          // Check for tournament state updates
          const savedState = loadState(urlTournamentId);
          if (savedState) {
            // Update all tournament state variables if they've changed
            if (savedState.round !== round) setRound(savedState.round);
            if (JSON.stringify(savedState.matches) !== JSON.stringify(matches))
              setMatches(savedState.matches);
            if (JSON.stringify(savedState.scores) !== JSON.stringify(scores))
              setScores(savedState.scores);
            if (savedState.isFinished !== isFinished)
              setIsFinished(savedState.isFinished);
            if (savedState.isPaused !== isPaused)
              setIsPaused(savedState.isPaused);
            if (savedState.maxRounds !== maxRounds)
              setMaxRounds(savedState.maxRounds);
            if (
              JSON.stringify(savedState.sittingOutPlayers) !==
              JSON.stringify(sittingOutPlayers)
            )
              setSittingOutPlayers(savedState.sittingOutPlayers);
            if (
              JSON.stringify(savedState.sittingOutCounts) !==
              JSON.stringify(sittingOutCounts)
            )
              setSittingOutCounts(savedState.sittingOutCounts);
            if (
              JSON.stringify(savedState.tournamentHistory) !==
              JSON.stringify(tournamentHistory)
            )
              setTournamentHistory(savedState.tournamentHistory || []);
            if (
              JSON.stringify(savedState.partnerships) !==
              JSON.stringify(partnerships)
            )
              setPartnerships(savedState.partnerships || {});
          }
        } catch (error) {
          console.warn("Failed to check for updates:", error);
        }
      };

      // Check immediately
      checkForUpdates();

      // Set up interval to check for updates every 2 seconds
      const interval = setInterval(checkForUpdates, 2000);

      // Listen for custom score update events
      const handleScoreUpdate = (e: CustomEvent) => {
        if (e.detail.tournamentId === urlTournamentId) {
          setEditingScores(e.detail.scores);
          // Also update URL for normal links
          if (!urlReadonly) {
            updateUrlWithScores(e.detail.scores);
          }

          // Also check for other tournament state updates
          const savedState = loadState(urlTournamentId);
          if (savedState) {
            if (savedState.round !== round) setRound(savedState.round);
            if (JSON.stringify(savedState.matches) !== JSON.stringify(matches))
              setMatches(savedState.matches);
            if (JSON.stringify(savedState.scores) !== JSON.stringify(scores))
              setScores(savedState.scores);
            if (savedState.isFinished !== isFinished)
              setIsFinished(savedState.isFinished);
            if (savedState.isPaused !== isPaused)
              setIsPaused(savedState.isPaused);
            if (savedState.maxRounds !== maxRounds)
              setMaxRounds(savedState.maxRounds);
            if (
              JSON.stringify(savedState.sittingOutPlayers) !==
              JSON.stringify(sittingOutPlayers)
            )
              setSittingOutPlayers(savedState.sittingOutPlayers);
            if (
              JSON.stringify(savedState.sittingOutCounts) !==
              JSON.stringify(sittingOutCounts)
            )
              setSittingOutCounts(savedState.sittingOutCounts);
            if (
              JSON.stringify(savedState.tournamentHistory) !==
              JSON.stringify(tournamentHistory)
            )
              setTournamentHistory(savedState.tournamentHistory || []);
            if (
              JSON.stringify(savedState.partnerships) !==
              JSON.stringify(partnerships)
            )
              setPartnerships(savedState.partnerships || {});
          }
        }
      };

      // Listen for storage events (when localStorage changes in other tabs/windows)
      const handleStorageChange = (e: StorageEvent) => {
        // Listen for both score changes and tournament state changes
        if (e.key === `tournament_${urlTournamentId}_scores` && e.newValue) {
          try {
            const newScores = JSON.parse(e.newValue);
            setEditingScores(newScores);
            // Also update URL for normal links
            if (!urlReadonly) {
              updateUrlWithScores(newScores);
            }
          } catch (error) {
            console.warn("Failed to parse updated scores:", error);
          }
        }

        // Listen for tournament state changes
        if (e.key === `tournament_${urlTournamentId}` && e.newValue) {
          try {
            const newState = JSON.parse(e.newValue);
            // Update all tournament state variables
            if (newState.round !== round) setRound(newState.round);
            if (JSON.stringify(newState.matches) !== JSON.stringify(matches))
              setMatches(newState.matches);
            if (JSON.stringify(newState.scores) !== JSON.stringify(scores))
              setScores(newState.scores);
            if (newState.isFinished !== isFinished)
              setIsFinished(newState.isFinished);
            if (newState.isPaused !== isPaused) setIsPaused(newState.isPaused);
            if (newState.maxRounds !== maxRounds)
              setMaxRounds(newState.maxRounds);
            if (
              JSON.stringify(newState.sittingOutPlayers) !==
              JSON.stringify(sittingOutPlayers)
            )
              setSittingOutPlayers(newState.sittingOutPlayers);
            if (
              JSON.stringify(newState.sittingOutCounts) !==
              JSON.stringify(sittingOutCounts)
            )
              setSittingOutCounts(newState.sittingOutCounts);
            if (
              JSON.stringify(newState.tournamentHistory) !==
              JSON.stringify(tournamentHistory)
            )
              setTournamentHistory(newState.tournamentHistory || []);
            if (
              JSON.stringify(newState.partnerships) !==
              JSON.stringify(partnerships)
            )
              setPartnerships(newState.partnerships || {});
          } catch (error) {
            console.warn("Failed to parse updated tournament state:", error);
          }
        }
      };

      window.addEventListener(
        "scoreUpdate",
        handleScoreUpdate as EventListener
      );
      window.addEventListener("storage", handleStorageChange);

      return () => {
        clearInterval(interval);
        window.removeEventListener(
          "scoreUpdate",
          handleScoreUpdate as EventListener
        );
        window.removeEventListener("storage", handleStorageChange);
      };
    }
  }, []);

  const handleTournamentNameSubmit: SubmitHandler<TournamentNameFormData> = (
    data
  ) => {
    if (isReadOnly) return; // no-op in readonly
    resetTournament();
    setTournamentName(data.tournamentName);
    setIsTournamentNameSet(true);

    // Generate new tournament ID if one doesn't exist
    if (!tournamentId) {
      const newId = generateTournamentId();
      setTournamentId(newId);

      // Update URL with the new tournament ID
      const newUrl = getTournamentShareUrl(newId, editingScores);
      window.history.pushState({ tournamentId: newId }, "", newUrl);
    }
  };

  // Add event listener for browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const params = new URLSearchParams(window.location.search);
      const urlTournamentId = params.get("tournamentId");
      const urlReadonly = params.get("readonly");
      const urlState = params.get("state");

      // Update read-only state
      setIsReadOnly(urlReadonly === "1");

      if (urlTournamentId) {
        setTournamentId(urlTournamentId);

        // If it's a view-only link with embedded state, load from that
        if (urlReadonly && urlState) {
          try {
            const decoded = JSON.parse(decodeURIComponent(urlState));
            setNames(decoded.names);
            setMatches(decoded.matches);
            setScores(decoded.scores);
            setRound(decoded.round);
            setTournamentName(decoded.tournamentName);
            setSittingOutPlayers(decoded.sittingOutPlayers);
            setSittingOutCounts(decoded.sittingOutCounts);
            setPointsPerMatch(decoded.pointsPerMatch);
            setPointSystem(decoded.pointSystem);
            setIsFinished(decoded.isFinished);
            setMaxRounds(decoded.maxRounds);
            setIsPaused(decoded.isPaused);
            setCourts(decoded.courts);
            setMode(decoded.mode);
            setNumberOfPlayers(decoded.numberOfPlayers);
            setIsTournamentNameSet(decoded.isTournamentNameSet);
            setArePlayerNamesSet(decoded.arePlayerNamesSet);
            setTournamentHistory(decoded.tournamentHistory || []);
            setPartnerships(decoded.partnerships || {});
            setEditingScores(decoded.editingScores || {});
          } catch (e) {
            console.warn("Failed to parse embedded state from URL", e);
            // Fallback to localStorage if available
            const savedState = loadState(urlTournamentId);
            if (savedState) {
              // Load basic state from localStorage
              setNames(savedState.names);
              setMatches(savedState.matches);
              setScores(savedState.scores);
              setRound(savedState.round);
              setTournamentName(savedState.tournamentName);
              setSittingOutPlayers(savedState.sittingOutPlayers);
              setSittingOutCounts(savedState.sittingOutCounts);
              setPointsPerMatch(savedState.pointsPerMatch);
              setPointSystem(savedState.pointSystem);
              setIsFinished(savedState.isFinished);
              setMaxRounds(savedState.maxRounds);
              setIsPaused(savedState.isPaused);
              setCourts(savedState.courts);
              setMode(savedState.mode);
              setNumberOfPlayers(savedState.numberOfPlayers);
              setIsTournamentNameSet(savedState.isTournamentNameSet);
              setArePlayerNamesSet(savedState.arePlayerNamesSet);
              setTournamentHistory(savedState.tournamentHistory || []);
              setPartnerships(savedState.partnerships || {});
              setEditingScores(savedState.editingScores || {});
            }
          }
        } else {
          // Regular editable link - load from localStorage
          const savedState = loadState(urlTournamentId);
          if (savedState) {
            setNames(savedState.names);
            setMatches(savedState.matches);
            setScores(savedState.scores);
            setRound(savedState.round);
            setTournamentName(savedState.tournamentName);
            setSittingOutPlayers(savedState.sittingOutPlayers);
            setSittingOutCounts(savedState.sittingOutCounts);
            setPointsPerMatch(savedState.pointsPerMatch);
            setPointSystem(savedState.pointSystem);
            setIsFinished(savedState.isFinished);
            setMaxRounds(savedState.maxRounds);
            setIsPaused(savedState.isPaused);
            setCourts(savedState.courts);
            setMode(savedState.mode);
            setNumberOfPlayers(savedState.numberOfPlayers);
            setIsTournamentNameSet(savedState.isTournamentNameSet);
            setArePlayerNamesSet(savedState.arePlayerNamesSet);
            setTournamentHistory(savedState.tournamentHistory || []);
            setPartnerships(savedState.partnerships || {});
            setEditingScores(savedState.editingScores || {});
          }
        }
      } else {
        setTournamentId("");
        setIsTournamentNameSet(false);
        setArePlayerNamesSet(false);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (isTournamentNameSet && tournamentId && !isReadOnly) {
      saveTournamentState();
    }
  }, [tournamentId, isTournamentNameSet, isReadOnly]);

  const saveTournamentState = () => {
    const state = {
      id: tournamentId,
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
      pointSystem,
      courts,
      mode,
      numberOfPlayers,
      isTournamentNameSet,
      arePlayerNamesSet,
      tournamentHistory,
      partnerships,
      editingScores,
    };
    saveState(state);
    saveScores(tournamentId, editingScores);
    updateUrlWithScores(editingScores);
  };

  const loadTournamentState = () => {
    // Don't load from localStorage if we're in read-only mode
    if (isReadOnly) return false;

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
      setEditingScores(state.editingScores || {});
      return true;
    }
    return false;
  };

  useEffect(() => {
    // Only load from localStorage if not in read-only mode
    if (!isReadOnly) {
      loadTournamentState();
    }
  }, [isReadOnly]); // Changed dependency to isReadOnly

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [isTournamentNameSet, arePlayerNamesSet, isFinished]);

  useEffect(() => {
    // Don't show restore dialog in read-only mode
    if (!isReadOnly && localStorage.getItem(STORAGE_KEY)) {
      setShowRestoreDialog(true);
    }
  }, [isReadOnly]);

  const isLastRound = useCallback(() => {
    return maxRounds !== null && round === maxRounds;
  }, [maxRounds, round]);

  useEffect(() => {
    if (round > 1 && names.length > 0 && matches.length === 0) {
      let newMatches: Match[];

      if (format === "americano" && mode === "individual") {
        newMatches = generateAmericanoMatches(
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
      } else if (format === "americano" && mode === "team") {
        newMatches = generateAmericanoMatchesTeamMode(
          names,
          courts,
          partnerships,
          round,
          sittingOutCounts,
          setSittingOutCounts,
          setSittingOutPlayers,
          mode
        );
      } else {
        newMatches = generateMatches(
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
      }
      setMatches(newMatches);

      // Initialize editing scores for new round and update URL
      const newEditingScores: EditingScores = {};
      newMatches.forEach((match, index) => {
        newEditingScores[index] = { team1: 0, team2: 0 };
      });
      setEditingScores(newEditingScores);

      // Update URL with the new scores
      if (tournamentId) {
        updateUrlWithScores(newEditingScores);
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
    tournamentId,
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
    if (isReadOnly) return;
    setIsPaused(paused);
  };

  const nextRound = useCallback(() => {
    if (isReadOnly) return;
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

      // Initialize with default scores and update URL immediately
      const defaultScores = { 0: { team1: 0, team2: 0 } };
      updateEditingScores(defaultScores);
    }
  }, [
    checkTournamentEnd,
    matches,
    scores,
    round,
    sittingOutPlayers,
    updateEditingScores,
    isReadOnly,
  ]);

  const startFinalRound = useCallback(
    (editingScores: EditingScores) => {
      if (isReadOnly) return;
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
      updateEditingScores({ 0: { team1: 0, team2: 0 } });
    },
    [
      matches,
      round,
      updateMatches,
      scores,
      sittingOutPlayers,
      updateEditingScores,
      isReadOnly,
    ]
  );

  const resetTournament = () => {
    if (isReadOnly) return;
    setTournamentId("");
    setIsTournamentNameSet(false);
    setArePlayerNamesSet(false);
    setNumberOfPlayers(0);
    setNames([]);
    setMatches([]);
    setScores({});
    setRound(1);
    setTournamentName("");
    setSittingOutPlayers([]);
    setSittingOutCounts({});
    setPointsPerMatch(21);
    setIsFinished(false);
    setMaxRounds(null);
    setIsPaused(false);
    setCourts([]);
    setMode("individual");
    setTournamentHistory([]);
    setPartnerships({});
    setFormat("mexicano");
    setPointSystem("pointsToPlay");
    setEditingScores({});

    window.history.pushState({}, "", window.location.pathname);
  };

  const goBackToTournamentName = () => {
    resetTournament();
  };

  useEffect(() => {
    if (tournamentId && !isReadOnly) {
      saveTournamentState();
    }
  }, [editingScores, tournamentId, isReadOnly]);

  // Listen for score updates from other instances (for all link types)
  useEffect(() => {
    if (!tournamentId) return;

    const handleScoreUpdate = (e: CustomEvent) => {
      if (e.detail.tournamentId === tournamentId) {
        // Update editingScores and URL for all link types
        setEditingScores(e.detail.scores);
        updateUrlWithScores(e.detail.scores);
      }
    };

    window.addEventListener("scoreUpdate", handleScoreUpdate as EventListener);

    return () => {
      window.removeEventListener(
        "scoreUpdate",
        handleScoreUpdate as EventListener
      );
    };
  }, [tournamentId]);

  const fetchTournamentHistory = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const data = await getTournamentHistory(token);
      setTournaments(data);
    } catch (err) {
      console.error("Error fetching tournaments", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTournamentHistory();
    }
  }, [isAuthenticated]);

  const handleTournamentRecord = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      // Serialize your scores object (the final scores for the tournament)
      const scoresJson = JSON.stringify(scores);
      await createTournament(token, tournamentName, scoresJson);
      await fetchTournamentHistory();
    } catch (error) {
      console.error("Error saving tournament record:", error);
    }
  };

  const handleTournamentComplete = async () => {
    console.log(scores);
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const updatedUser = await completeTournament(token);
      updateUser(updatedUser);
      await handleTournamentRecord();
    } catch (error) {
      console.error("Error updating tournament count:", error);
    }
  };

  /*   if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <AuthForms />
      </div>
    );
  } */

  return (
    <>
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
          <div className="flex flex-col items-center gap-4 mb-8 mt-12">
            <h1 className="text-center text-2xl font-bold text-gray-500">
              {tournamentName}
            </h1>
            {tournamentId && matches.length > 0 && (
              <ShareButton
                tournamentId={tournamentId}
                scores={editingScores}
                round={round}
              />
            )}

            {isReadOnly && (
              <span className="text-xs text-gray-400">View-only mode</span>
            )}
          </div>
        )}

        {isTournamentNameSet && !arePlayerNamesSet && (
          <div className="space-y-8 px-4 max-w-3xl mx-auto w-full">
            <TournamentSettings
              onSubmit={(settings) => {
                const initialCourts =
                  settings.courts.length > 0
                    ? settings.courts
                    : [{ id: 1, name: "Court 1" }];

                const initialScores: Scores = {};
                if (settings.mode === "team") {
                  for (let i = 0; i < settings.playerNames.length; i += 2) {
                    const teamIndex = Math.floor(i / 2);
                    const teamName = `Team ${teamIndex + 1}`;

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
                setFormat(settings.format as "mexicano" | "americano");

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

                // Initialize editing scores and update URL
                const initialEditingScores: EditingScores = {};
                initialMatches.forEach((match, index) => {
                  initialEditingScores[index] = { team1: 0, team2: 0 };
                });
                setEditingScores(initialEditingScores);

                // Update URL with the initial scores if we have a tournament ID
                if (tournamentId) {
                  updateUrlWithScores(initialEditingScores);
                }
              }}
            />
          </div>
        )}

        {matches.length > 0 && (
          <div className="flex flex-col items-center relative space-y-4 mb-12">
            {isFinished || isPaused ? (
              <TournamentPaused
                isFinished={isFinished}
                scores={scores}
                setIsPaused={setIsPaused}
                setIsFinished={setIsFinished}
                onTournamentComplete={handleTournamentComplete}
              />
            ) : (
              <>
                {sittingOutPlayers.length > 0 && (
                  <div className="mb-4 p-4 bg-gray-300 rounded-lg text-center">
                    <h3 className="font-semibold">Sitting Out This Round:</h3>
                    <p>{sittingOutPlayers.join(", ")}</p>
                  </div>
                )}

                <Matches
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
                  editingScores={editingScores}
                  onUpdateEditingScores={updateEditingScores}
                  tournamentId={tournamentId}
                  onTournamentComplete={handleTournamentComplete}
                  readOnly={isReadOnly}
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
    </>
  );
}
