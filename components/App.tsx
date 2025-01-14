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

  const nextRound = useCallback(() => {
    setRound((prevRound) => prevRound + 1);
  }, []);

  const handleTournamentNameSubmit: SubmitHandler<TournamentNameFormData> = (
    data
  ) => {
    setTournamentName(data.tournamentName);
    setIsTournamentNameSet(true);
  };

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
          {sittingOutPlayers.length > 0 && (
            <div className="mb-4 p-4 bg-yellow-100 rounded-lg text-center">
              <h3 className="font-semibold text-yellow-800">
                Sitting Out This Round:
              </h3>
              <p className="text-yellow-700">{sittingOutPlayers.join(", ")}</p>
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
          />

          <div className="w-full flex justify-center px-4">
            <button
              onClick={openModal}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 w-full max-w-sm"
            >
              <Trophy className="h-5 w-5" />
              <span>View Standings</span>
            </button>
          </div>

          <Scoreboard
            isOpen={isModalOpen}
            onClose={closeModal}
            scores={scores}
          />
        </div>
      )}
    </div>
  );
}
