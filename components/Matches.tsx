import { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import VSLogo from "./VSLogo";
import padelIcon from "../app/assets/padelIcon.png";
import Image from "next/image";

interface Match {
  team1: string[];
  team2: string[];
  team1Score: number;
  team2Score: number;
  isScoreSubmitted: boolean;
}

interface EditingScores {
  [key: number]: {
    team1: number;
    team2: number;
  };
}

interface MatchesProps {
  matches: Match[];
  scores: { [key: string]: number };
  onUpdateMatches: (updatedMatches: Match[]) => void;
  onUpdateScores: (updatedScores: { [key: string]: number }) => void;
  round: number;
  onNextRound: () => void;
}

export default function Matches({
  matches,
  scores,
  onUpdateMatches,
  onUpdateScores,
  round,
  onNextRound,
}: MatchesProps) {
  const [isNextRoundDisabled, setIsNextRoundDisabled] = useState(
    matches.some((match) => !match.isScoreSubmitted)
  );
  const [editingScores, setEditingScores] = useState<EditingScores>({});

  useEffect(() => {
    setIsNextRoundDisabled(matches.some((match) => !match.isScoreSubmitted));

    // Initialize editingScores with current match scores
    const initialEditingScores: EditingScores = {};
    matches.forEach((match, index) => {
      initialEditingScores[index] = {
        team1: match.team1Score,
        team2: match.team2Score,
      };
    });
    setEditingScores(initialEditingScores);
  }, [matches]);

  const handleScoreChange = useCallback(
    (index: number, team: "team1" | "team2", value: number) => {
      setEditingScores((prev) => ({
        ...prev,
        [index]: {
          ...prev[index],
          [team]: value,
          [team === "team1" ? "team2" : "team1"]: 21 - value,
        },
      }));
    },
    []
  );

  const handleScoreSubmit = useCallback(
    (index: number) => {
      const updatedMatches = matches.map((match, i) => {
        if (i === index) {
          return {
            ...match,
            team1Score: editingScores[index].team1,
            team2Score: editingScores[index].team2,
            isScoreSubmitted: true,
          };
        }
        return match;
      });
      onUpdateMatches(updatedMatches);

      const newScores = { ...scores };
      updatedMatches[index].team1.forEach((player) => {
        newScores[player] =
          (newScores[player] || 0) + editingScores[index].team1;
      });
      updatedMatches[index].team2.forEach((player) => {
        newScores[player] =
          (newScores[player] || 0) + editingScores[index].team2;
      });

      onUpdateScores(newScores);
    },
    [matches, onUpdateMatches, onUpdateScores, scores, editingScores]
  );

  const isScoreValid = useCallback(
    (index: number) => {
      const team1Score = editingScores[index]?.team1;
      const team2Score = editingScores[index]?.team2;

      return (
        team1Score !== undefined &&
        team2Score !== undefined &&
        team1Score + team2Score === 21 &&
        team1Score > 0 &&
        team2Score > 0
      );
    },
    [editingScores]
  );

  return (
    <div className="mt-8">
      <h2 className="text-center text-2xl font-extrabold mb-8 text-blue-700">
        <span className=" bg-blue-100 px-4 py-2 rounded-lg shadow-md flex gap-2 justify-center">
          <Image src={padelIcon} alt="Padel Icon" width={32} height={32} />
          Round {round} Matches
        </span>
      </h2>

      {matches.map((match, index) => (
        <div
          key={index}
          className={`rounded-lg p-6 shadow-md ${
            match.isScoreSubmitted ? "bg-gray-100" : "bg-blue-50"
          } mb-6`}
        >
          <form
            className="flex flex-col items-center gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleScoreSubmit(index);
            }}
          >
            {/* Teams Section */}
            <div className="flex items-center gap-8 w-full">
              {/* Team 1 */}
              <div className="flex-1 text-right">
                <h3 className="font-semibold text-lg">
                  {match.team1.map((name, i) => (
                    <span key={i}>
                      {name}
                      {i < match.team1.length - 1 && (
                        <>
                          <br />&<br />
                        </>
                      )}
                    </span>
                  ))}
                </h3>
              </div>

              {/* VS Logo and Scores */}
              <div className="flex flex-col items-center">
                <VSLogo />
                <div className="mt-2 flex gap-4">
                  {/* Team 1 Score */}
                  {match.isScoreSubmitted ? (
                    <span className="w-16 text-center text-xl font-bold text-gray-500">
                      {match.team1Score}
                    </span>
                  ) : (
                    <input
                      className="w-16 text-center rounded-lg border border-gray-300 bg-white text-xl"
                      type="number"
                      placeholder="0"
                      value={editingScores[index]?.team1 ?? match.team1Score}
                      min="0"
                      max="21"
                      onFocus={(e) => e.target.select()}
                      onChange={(e) =>
                        handleScoreChange(
                          index,
                          "team1",
                          parseInt(e.target.value, 10) || 0
                        )
                      }
                      disabled={match.isScoreSubmitted}
                    />
                  )}

                  {/* Separator */}
                  <span className="text-lg">-</span>

                  {/* Team 2 Score */}
                  {match.isScoreSubmitted ? (
                    <span className="w-16 text-center text-xl font-bold text-gray-500">
                      {match.team2Score}
                    </span>
                  ) : (
                    <input
                      className="w-16 text-center rounded-lg border border-gray-300 bg-white text-xl"
                      type="number"
                      placeholder="0"
                      value={editingScores[index]?.team2 ?? match.team2Score}
                      min="0"
                      max="21"
                      onFocus={(e) => e.target.select()}
                      onChange={(e) =>
                        handleScoreChange(
                          index,
                          "team2",
                          parseInt(e.target.value, 10) || 0
                        )
                      }
                      disabled={match.isScoreSubmitted}
                    />
                  )}
                </div>
              </div>

              {/* Team 2 */}
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-lg">
                  {match.team2.map((name, i) => (
                    <span key={i}>
                      {name}
                      {i < match.team2.length - 1 && (
                        <>
                          <br />&<br />
                        </>
                      )}
                    </span>
                  ))}
                </h3>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4">
              {match.isScoreSubmitted ? (
                <Button
                  type="button"
                  className="bg-yellow-500 text-white"
                  onClick={(e) => {
                    e.preventDefault();
                    const updatedScores = { ...scores };
                    match.team1.forEach(
                      (player) => (updatedScores[player] -= match.team1Score)
                    );
                    match.team2.forEach(
                      (player) => (updatedScores[player] -= match.team2Score)
                    );
                    const updatedMatches = matches.map((m, i) =>
                      i === index
                        ? {
                            ...m,
                            team1Score: 0,
                            team2Score: 0,
                            isScoreSubmitted: false,
                          }
                        : m
                    );
                    onUpdateScores(updatedScores);
                    onUpdateMatches(updatedMatches);
                  }}
                >
                  Edit Score
                </Button>
              ) : (
                <Button
                  type="submit"
                  className={`${
                    isScoreValid(index)
                      ? "bg-green-500 text-white"
                      : "bg-gray-400 text-gray-600 cursor-not-allowed"
                  }`}
                  disabled={!isScoreValid(index)}
                >
                  Submit Score
                </Button>
              )}
            </div>
          </form>
        </div>
      ))}

      {/* Next Round Button */}
      <div className="flex justify-center w-full">
        <Button
          type="button"
          className={`mt-4 ${
            isNextRoundDisabled ? "bg-gray-500" : "bg-green-500"
          } text-white`}
          onClick={onNextRound}
          disabled={isNextRoundDisabled}
        >
          Next Round
        </Button>
      </div>
    </div>
  );
}
