"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "./ui/button";
import VSLogo from "./VSLogo";

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

  const handleScoreSubmit = (index: number, team1Score: string) => {
    if (matches[index].isScoreSubmitted) {
      alert("Score for this match has already been submitted.");
      return;
    }

    const updatedMatches = [...matches];
    const team1ScoreInt = parseInt(team1Score, 10) || 0;

    // Calculate the team2 score so that the total equals 21
    const team2ScoreInt = 21 - team1ScoreInt;

    updatedMatches[index].team1Score = team1ScoreInt;
    updatedMatches[index].team2Score = team2ScoreInt;
    updatedMatches[index].isScoreSubmitted = true;
    setMatches(updatedMatches);

    // Update player scores
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
            defaultValue="Mock Tournament" // Default værdi
            {...register("tournamentName", { required: true })}
            autoFocus
            onFocus={(e) => e.target.select()} // Marker hele teksten når feltet får fokus
          />

          <Button type="submit">Set Tournament Name</Button>
        </form>
      )}

      {isTournamentNameSet && (
        <h1 className="text-center text-2xl">{tournamentName}</h1>
      )}

      {/* Sektion for antal spillere */}
      {isTournamentNameSet && numberOfPlayers === 0 && (
        <div>
          <h2 className="flex justify-center mt-4 font-semibold">
            Number of players
          </h2>
          <form
            className="flex justify-center gap-2 mt-2"
            onSubmit={handleSubmit(onNumberSubmit)}
          >
            <input
              className="border-2 border-slate-500 p-1"
              type="number"
              placeholder="Number of players"
              defaultValue={8} // Default værdi
              {...register("Number of players", {
                required: true,
                min: 4,
                max: 999,
              })}
              autoFocus
              onFocus={(e) => e.target.select()} // Marker hele teksten når feltet får fokus
            />

            <Button type="submit">Confirm</Button>
          </form>
        </div>
      )}

      {/* Sektion for spillernavne */}
      {numberOfPlayers > 0 && isTournamentNameSet && !arePlayerNamesSet && (
        <div className="mt-8">
          {[...Array(numberOfPlayers)].map((_, index) => (
            <div key={index} className="flex justify-center gap-2 mb-4">
              <input
                className="border-2 border-slate-500 p-1"
                type="text"
                placeholder={`Player ${index + 1} Name`}
                defaultValue={`Player ${index + 1}`} // Default værdi
                {...register(`playerName${index}`, { required: true })}
                onFocus={(e) => e.target.select()} // Marker hele teksten når feltet får fokus
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
          <h2 className="text-center text-lg font-bold mb-20">
            Round {round} Matches:
          </h2>
          {matches.map((match, index) => (
            <div key={index} className="mb-12">
              <form
                className="grid grid-cols-[2fr_minmax(160px,_1fr)_2fr] items-center gap-4 mt-2"
                //onFocus={(e) => e.target.select()}
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement & {
                    team1Score: HTMLInputElement;
                    team2Score: HTMLInputElement;
                  };

                  const team1Score = form.team1Score.value;

                  handleScoreSubmit(index, team1Score);
                  form.reset();
                }}
              >
                {/* Team 1 + Score (First Column) */}
                <div>
                  <div className="flex justify-end">
                    <span className="font-semibold text-lg">
                      {match.team1.join(" & ")}
                    </span>
                  </div>
                </div>

                {/* VS Component (Second Column) */}
                <div className="relative flex justify-center items-center">
                  {/* Input Field positioned over VSLogo */}
                  <input
                    className={`absolute top-[-35px] left-[-1px] border-4 border-blue-500 text-xl font-mono p-2 w-14 text-center bg-transparent rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      match.isScoreSubmitted ? "bg-gray-300" : ""
                    }`}
                    type="number"
                    placeholder="Score"
                    name="team1Score"
                    value={match.team1Score || 0} // Use team1Score directly
                    disabled={match.isScoreSubmitted}
                    required={true}
                    min="0"
                    onChange={(e) => {
                      const updatedMatches = [...matches];
                      updatedMatches[index].team1Score =
                        parseInt(e.target.value, 10) || 0;
                      updatedMatches[index].team2Score =
                        21 - updatedMatches[index].team1Score;
                      setMatches(updatedMatches);
                    }}
                    onFocus={(e) => e.target.select()}
                  />

                  {/* VSLogo */}
                  <VSLogo />
                  <input
                    className={`absolute top-[-35px] right-[-1px] border-4 border-red-500 text-xl font-mono p-2 w-14 text-center bg-transparent rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      match.isScoreSubmitted ? "bg-gray-300" : ""
                    }`}
                    type="number"
                    placeholder="Score"
                    name="team2Score"
                    value={match.team2Score || 0} // Use team2Score directly
                    disabled={match.isScoreSubmitted}
                    required={true}
                    min="0"
                    onChange={(e) => {
                      const updatedMatches = [...matches];
                      updatedMatches[index].team2Score =
                        parseInt(e.target.value, 10) || 0;
                      updatedMatches[index].team1Score =
                        21 - updatedMatches[index].team2Score;
                      setMatches(updatedMatches);
                    }}
                    onFocus={(e) => e.target.select()}
                  />
                </div>

                {/* Team 2 + Score (Third Column) */}
                <div className="flex justify-start items-center">
                  <div>
                    <span className="font-semibold text-lg">
                      {match.team2.join(" & ")}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="col-span-3 flex justify-center mt-2">
                  {match.isScoreSubmitted ? (
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault(); // Prevent default form submission
                        // Reset scores and allow editing again
                        const updatedScores = { ...scores };
                        match.team1.forEach((player) => {
                          updatedScores[player] -= match.team1Score;
                        });
                        match.team2.forEach((player) => {
                          updatedScores[player] -= match.team2Score;
                        });

                        setScores(updatedScores);

                        const updatedMatches = [...matches];
                        updatedMatches[index].isScoreSubmitted = false;
                        updatedMatches[index].team1Score = 0;
                        updatedMatches[index].team2Score = 0;
                        setMatches(updatedMatches);
                      }}
                    >
                      Edit Score
                    </Button>
                  ) : (
                    <Button type="submit">Submit</Button>
                  )}
                </div>
              </form>
            </div>
          ))}

          <Button
            type="button"
            className={`mt-4 mx-auto block ${
              isNextRoundDisabled
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-green-500"
            }`}
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
