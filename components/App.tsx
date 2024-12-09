"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "./ui/button";

// Define the types for the form data
interface FormData {
  tournamentName: string;
  "Number of players": string;
  [key: string]: string; // Handle dynamic player names
}

interface Match {
  team1: string[];
  team2: string[];
  team1Score: number;
  team2Score: number;
  isScoreSubmitted: boolean;
}

export default function App() {
  const [numberOfPlayers, setNumberOfPlayers] = useState<number>(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [names, setNames] = useState<string[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [scores, setScores] = useState<{ [key: string]: number }>({});
  const [round, setRound] = useState<number>(1);
  const [tournamentName, setTournamentName] = useState<string>("");
  const [isTournamentNameSet, setIsTournamentNameSet] =
    useState<boolean>(false);
  const [arePlayerNamesSet, setArePlayerNamesSet] = useState<boolean>(false); // Flag for player names

  const { register, handleSubmit, getValues } = useForm<FormData>();

  useEffect(() => {
    // Check if there is saved tournament data in localStorage when the component mounts
    const savedTournament = localStorage.getItem("tournamentData");
    if (savedTournament) {
      const parsedTournament = JSON.parse(savedTournament);
      setTournamentName(parsedTournament.tournamentName);
      setNumberOfPlayers(parsedTournament.numberOfPlayers);
      setNames(parsedTournament.names);
      setMatches(parsedTournament.matches);
      setScores(parsedTournament.scores);
      setRound(parsedTournament.round);
    }
  }, []);

  const onNumberSubmit: SubmitHandler<FormData> = (data) => {
    const players = parseInt(data["Number of players"], 10);
    if (!isNaN(players) && players >= 4 && players % 4 === 0) {
      setNumberOfPlayers(players);
    } else {
      alert("Number of players must be a multiple of 4.");
    }
  };

  const onNameSubmit = () => {
    const values = getValues();
    const playerNames = Object.keys(values)
      .filter((key) => key.startsWith("playerName"))
      .map((key) => values[key]);

    setNames(playerNames);

    // Initialize scores
    const initialScores: { [key: string]: number } = {};
    playerNames.forEach((name) => {
      initialScores[name] = 0;
    });
    setScores(initialScores);

    generateMatches(playerNames);
    setArePlayerNamesSet(true); // Mark player names as set
  };

  const generateMatches = (players: string[]) => {
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

  const handleScoreSubmit = (
    index: number,
    team1Score: string,
    team2Score: string
  ) => {
    if (matches[index].isScoreSubmitted) {
      alert("Score for this match has already been submitted.");
      return;
    }
    const updatedMatches = [...matches];
    updatedMatches[index].team1Score = parseInt(team1Score, 10) || 0;
    updatedMatches[index].team2Score = parseInt(team2Score, 10) || 0;
    updatedMatches[index].isScoreSubmitted = true;
    setMatches(updatedMatches);

    const updatedScores = { ...scores };
    updatedMatches[index].team1.forEach((player) => {
      updatedScores[player] += updatedMatches[index].team1Score;
    });
    updatedMatches[index].team2.forEach((player) => {
      updatedScores[player] += updatedMatches[index].team2Score;
    });
    setScores(updatedScores);
  };

  const nextRound = () => {
    const sortedPlayers = Object.keys(scores).sort(
      (a, b) => scores[b] - scores[a]
    );
    generateMatches(sortedPlayers);
    setRound(round + 1);
  };

  const isNextRoundDisabled = matches.some((match) => !match.isScoreSubmitted);

  const handleTournamentNameSubmit: SubmitHandler<FormData> = (data) => {
    setTournamentName(data.tournamentName);
    setIsTournamentNameSet(true);
  };

  return (
    <div className="m-4">
      {/* Sektion for turneringsnavn */}
      {!isTournamentNameSet && (
        <form
          className="flex flex-col sm:flex-row mx-8 justify-center gap-2 mt-8"
          onSubmit={handleSubmit(handleTournamentNameSubmit)}
        >
          <input
            className="border-2 border-slate-500 p-1"
            type="text"
            placeholder="Enter Tournament Name"
            {...register("tournamentName", { required: true })}
          />
          <Button type="submit">Set Tournament Name</Button>
        </form>
      )}

      {isTournamentNameSet && (
        <h1 className="text-center text-2xl">{tournamentName}</h1>
      )}

      {/* Sektion for antal spillere */}
      {isTournamentNameSet && numberOfPlayers === 0 && (
        <form
          className="flex justify-center gap-2 mt-8"
          onSubmit={handleSubmit(onNumberSubmit)}
        >
          <input
            className="border-2 border-slate-500 p-1"
            type="number"
            placeholder="Number of players"
            {...register("Number of players", {
              required: true,
              min: 4,
              max: 999, // Rettet fra maxLength til max
            })}
          />
          <Button type="submit">Confirm</Button>
        </form>
      )}

      {/* Sektion for spillernavne */}
      {numberOfPlayers > 0 && isTournamentNameSet && !arePlayerNamesSet && (
        <div className="mt-8">
          {[...Array(numberOfPlayers)].map((_, index) => (
            <div key={index} className="flex justify-center gap-2 mb-4">
              <input
                className="border-2 border-slate-500 p-1"
                type="text"
                placeholder={`Player ${index + 1} Name`} // Rettet interpoleringen
                {...register(`playerName${index}`, { required: true })} // Rettet til template literal
              />
            </div>
          ))}
          <Button className="mx-auto block" onClick={onNameSubmit}>
            Generate Matches
          </Button>
        </div>
      )}

      {matches.length > 0 && (
        <div className="mt-8">
          <h2 className="text-center text-lg font-bold">
            Round {round} Matches:
          </h2>
          {matches.map((match, index) => (
            <div key={index} className="mb-4">
              <p className="text-center my-4">
                <span className="border-b-4 border-red-600 font-semibold">
                  {match.team1.join(" & ")}
                </span>
                <p className="">VS</p>
                <span className="border-b-4 border-red-600 font-semibold">
                  {match.team2.join(" & ")}
                </span>{" "}
              </p>
              <form
                className="flex gap-4 justify-center mt-2"
                onSubmit={(e) => {
                  e.preventDefault();

                  // Cast e.target to the correct type
                  const form = e.target as HTMLFormElement & {
                    team1Score: HTMLInputElement;
                    team2Score: HTMLInputElement;
                  };

                  const team1Score = form.team1Score.value;
                  const team2Score = form.team2Score.value;

                  handleScoreSubmit(index, team1Score, team2Score);
                  form.reset();
                }}
              >
                <input
                  className="border-2 border-slate-500 p-1 sm:w-64 w-42 text-xs sm:text-sm"
                  type="number"
                  placeholder={
                    match.isScoreSubmitted
                      ? `${match.team1Score}` // Rettet til template literal
                      : `Score for ${match.team1.join(" & ")}`
                  }
                  name="team1Score"
                  disabled={match.isScoreSubmitted}
                />
                <input
                  className="border-2 border-slate-500 p-1 sm:w-64 w-42 text-xs sm:text-sm"
                  type="number"
                  placeholder={
                    match.isScoreSubmitted
                      ? `${match.team2Score}` // Rettet til template literal
                      : `Score for ${match.team2.join(" & ")}`
                  }
                  name="team2Score"
                  disabled={match.isScoreSubmitted}
                />
                {!match.isScoreSubmitted && (
                  <Button type="submit">Submit</Button>
                )}
              </form>
            </div>
          ))}
          <Button
            type="button"
            className="mt-4 mx-auto block"
            onClick={nextRound}
            disabled={isNextRoundDisabled}
          >
            Next Round
          </Button>
        </div>
      )}
      {Object.keys(scores).length > 0 && (
        <div className="mt-8 text-center">
          <h2 className="text-center text-lg font-bold">Player Scores:</h2>
          <ul className="list-disc list-inside mt-4">
            {Object.entries(scores)
              .sort((a, b) => b[1] - a[1])
              .map(([player, score]) => (
                <p key={player}>
                  {player}: {score} points
                </p>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
