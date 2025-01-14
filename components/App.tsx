"use client";

import { useEffect, useState, useCallback } from "react";
import { SubmitHandler } from "react-hook-form";
import TournamentNameForm, {
  TournamentNameFormData,
} from "./TournamentNameForm";
import NumOfPlayersForm, { NumOfPlayersFormData } from "./NumOfPlayersForm";
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
}

interface RoundInfo {
  matches: Match[];
  sittingOut: string[];
}

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [numberOfPlayers, setNumberOfPlayers] = useState<number>(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [names, setNames] = useState<string[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [scores, setScores] = useState<{ [key: string]: number }>({});
  const [round, setRound] = useState<number>(1);
  const [tournamentName, setTournamentName] = useState<string>("");
  const [isTournamentNameSet, setIsTournamentNameSet] =
    useState<boolean>(false);
  const [arePlayerNamesSet, setArePlayerNamesSet] = useState<boolean>(false);
  const [sittingOutPlayers, setSittingOutPlayers] = useState<string[]>([]);
  const [sittingOutCounts, setSittingOutCounts] = useState<{
    [key: string]: number;
  }>({});
  const [showButtons, setShowButtons] = useState(false);
  const [pointsPerMatch, setPointsPerMatch] = useState<number>(21);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [maxRounds, setMaxRounds] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [courts, setCourts] = useState<Court[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [isTournamentNameSet, numberOfPlayers, arePlayerNamesSet]);

  // Add scroll listener
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Show buttons when scrolled down 100px or near bottom
      setShowButtons(
        scrollPosition > 100 ||
          scrollPosition + windowHeight >= documentHeight - 100
      );
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const onNumberSubmit: SubmitHandler<NumOfPlayersFormData> = (data) => {
    const players = data["Number of players"];
    if (players >= 4) {
      setNumberOfPlayers(players);
    } else {
      alert("Minimum 4 players required.");
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const generateMatches = useCallback(
    (players: string[]) => {
      const allPlayers = [...players];
      const numPlayersNeeded = Math.floor(allPlayers.length / 4) * 4;
      const numSittingOut = allPlayers.length - numPlayersNeeded;

      // Sort all players by score (or shuffle if first round)
      const sortedPlayers =
        round === 1
          ? shuffle(allPlayers)
          : allPlayers.sort((a, b) => scores[b] - scores[a]);

      // Determine who sits out (take from middle of rankings)
      let activePlayers = [...sortedPlayers];
      let sittingOut: string[] = [];

      if (numSittingOut > 0) {
        const startIdx = Math.floor((sortedPlayers.length - numSittingOut) / 2);
        sittingOut = sortedPlayers.slice(startIdx, startIdx + numSittingOut);
        activePlayers = sortedPlayers.filter(
          (player) => !sittingOut.includes(player)
        );

        // Move this outside of generateMatches
        const newSittingOutCounts = { ...sittingOutCounts };
        sittingOut.forEach((player) => {
          newSittingOutCounts[player] = (newSittingOutCounts[player] || 0) + 1;
        });
        setSittingOutCounts(newSittingOutCounts);
      }

      setSittingOutPlayers(sittingOut);

      // Create matches by pairing players based on their ranking
      const newMatches: Match[] = [];
      const numMatches = activePlayers.length / 4;

      for (let i = 0; i < numMatches; i++) {
        const startIdx = i * 4;
        newMatches.push({
          team1: [activePlayers[startIdx], activePlayers[startIdx + 2]],
          team2: [activePlayers[startIdx + 1], activePlayers[startIdx + 3]],
          team1Score: 0,
          team2Score: 0,
          isScoreSubmitted: false,
        });
      }

      setMatches(newMatches);
    },
    [round, scores] // Remove sittingOutCounts from dependencies
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
    (updatedScores: { [key: string]: number }) => {
      console.log("Updating scores:", updatedScores);
      setScores({ ...updatedScores });
    },
    []
  );

  useEffect(() => {
    if (round > 1 && names.length > 0) {
      generateMatches(names);
    }
  }, [round, names, generateMatches]);

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
      setRound((prevRound) => prevRound + 1);
    }
  }, [checkTournamentEnd]);

  const handleTournamentNameSubmit: SubmitHandler<TournamentNameFormData> = (
    data
  ) => {
    setTournamentName(data.tournamentName);
    setIsTournamentNameSet(true);
  };

  const handleTournamentPause = () => {
    if (window.confirm("Are you sure you want to end the tournament early?")) {
      setIsPaused(true);
    }
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
          onSubmit={(settings) => {
            setNames(settings.playerNames);
            setPointsPerMatch(settings.pointsPerMatch);
            setMaxRounds(settings.maxRounds);
            setCourts(settings.courts);

            const initialScores: { [key: string]: number } = {};
            settings.playerNames.forEach((name) => {
              initialScores[name] = 0;
            });
            setScores(initialScores);
            setSittingOutCounts({});

            generateMatches(settings.playerNames);
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
                      {Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]}
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
