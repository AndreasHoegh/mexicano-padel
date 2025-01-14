"use client";

import { useEffect, useState, useCallback } from "react";
import { SubmitHandler } from "react-hook-form";
import TournamentNameForm, {
  TournamentNameFormData,
} from "./TournamentNameForm";
import NumOfPlayersForm, { NumOfPlayersFormData } from "./NumOfPlayersForm";
import PlayerNamesForm from "./PlayerNamesForm";
import Matches from "./Matches";
import { Button } from "./ui/button";
import Modal from "./Modal";
import { Trophy } from "lucide-react";

interface Match {
  team1: string[];
  team2: string[];
  team1Score: number;
  team2Score: number;
  isScoreSubmitted: boolean;
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

  useEffect(() => {
    console.log("Matches updated:", matches);
  }, [matches]);

  const onNumberSubmit: SubmitHandler<NumOfPlayersFormData> = (data) => {
    const players = data["Number of players"];
    if (players >= 4 && players % 4 === 0) {
      setNumberOfPlayers(players);
    } else {
      alert("Number of players must be a multiple of 4.");
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const generateMatches = useCallback(
    (players: string[]) => {
      const sortedPlayers =
        players.length > 0
          ? [...players].sort((a, b) => scores[b] - scores[a])
          : shuffle(players);

      const newMatches: Match[] = [];
      for (let i = 0; i < sortedPlayers.length; i += 4) {
        const team1 = [sortedPlayers[i], sortedPlayers[i + 2]];
        const team2 = [sortedPlayers[i + 1], sortedPlayers[i + 3]];
        newMatches.push({
          team1,
          team2,
          team1Score: 0,
          team2Score: 0,
          isScoreSubmitted: false,
        });
      }

      setMatches(newMatches);
    },
    [scores]
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

  const nextRound = useCallback(() => {
    const sortedPlayers = Object.keys(scores).sort(
      (a, b) => scores[b] - scores[a]
    );
    generateMatches(sortedPlayers);
    setRound((prevRound) => prevRound + 1);
  }, [scores, generateMatches]);

  const handleTournamentNameSubmit: SubmitHandler<TournamentNameFormData> = (
    data
  ) => {
    setTournamentName(data.tournamentName);
    setIsTournamentNameSet(true);
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
          onSubmit={(playerNames) => {
            setNames(playerNames);

            const initialScores: { [key: string]: number } = {};
            playerNames.forEach((name) => {
              initialScores[name] = 0;
            });
            setScores(initialScores);

            generateMatches(playerNames);
            setArePlayerNamesSet(true);
          }}
        />
      )}

      {matches.length > 0 && (
        <div className="flex flex-col items-center relative">
          <Matches
            matches={matches}
            scores={scores}
            round={round}
            onUpdateMatches={updateMatches}
            onUpdateScores={updateScores}
            onNextRound={nextRound}
          />
          <Button
            onClick={openModal}
            className="bg-yellow-600 text-white p-2 mt-4"
          >
            View Scoreboard <Trophy className="ml-4" />
          </Button>

          <Modal isOpen={isModalOpen} onClose={closeModal} scores={scores} />
        </div>
      )}
    </div>
  );
}
