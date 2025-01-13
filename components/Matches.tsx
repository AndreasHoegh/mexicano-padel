import { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import VSLogo from "./VSLogo";

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

  return (
    <div className="mt-8">
      <h2 className="text-center text-lg font-bold mb-20">
        Round {round} Matches:
      </h2>
      {matches.map((match, index) => (
        <div key={index} className="mb-12">
          <form
            className="grid grid-cols-[2fr_minmax(160px,_1fr)_2fr] items-center gap-4 mt-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleScoreSubmit(index);
            }}
          >
            <div className="flex justify-end">
              <span className="font-semibold text-lg">
                {match.team1.join(" & ")}
              </span>
            </div>

            <div className="relative flex justify-center items-center">
              <input
                className="text-white absolute top-[-35px] left-[-1px] border-2 h-14 border-gray-300 text-xl font-mono p-2 w-12 text-center bg-black rounded-lg shadow-md focus:outline-none focus:ring-2 hide-spinner"
                type="number"
                placeholder="Score"
                name="team1Score"
                value={editingScores[index]?.team1 ?? match.team1Score}
                disabled={match.isScoreSubmitted}
                required
                min="0"
                max="21"
                onChange={(e) =>
                  handleScoreChange(
                    index,
                    "team1",
                    parseInt(e.target.value, 10) || 0
                  )
                }
                onFocus={(e) => e.target.select()}
              />
              <VSLogo />
              <input
                className="text-white bg-black absolute top-[-35px] right-[-1px] border-2 h-14 border-gray-300 text-xl font-mono p-2 w-12 text-center rounded-lg shadow-md focus:outline-none focus:ring-2 hide-spinner"
                type="number"
                placeholder="Score"
                name="team2Score"
                value={editingScores[index]?.team2 ?? match.team2Score}
                disabled={match.isScoreSubmitted}
                required
                min="0"
                max="21"
                onChange={(e) =>
                  handleScoreChange(
                    index,
                    "team2",
                    parseInt(e.target.value, 10) || 0
                  )
                }
                onFocus={(e) => e.target.select()}
              />
            </div>

            <div className="flex justify-start items-center">
              <span className="font-semibold text-lg">
                {match.team2.join(" & ")}
              </span>
            </div>

            <div className="col-span-3 flex justify-center mt-2">
              {match.isScoreSubmitted ? (
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();

                    // Create updated scores by subtracting the submitted scores
                    const updatedScores = { ...scores };
                    match.team1.forEach((player) => {
                      updatedScores[player] -= match.team1Score;
                    });
                    match.team2.forEach((player) => {
                      updatedScores[player] -= match.team2Score;
                    });

                    // Create updated matches with score submission undone
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

                    // Call the update callbacks to update the state in App.tsx
                    onUpdateScores(updatedScores);
                    onUpdateMatches(updatedMatches);
                  }}
                >
                  Edit Score
                </Button>
              ) : (
                <Button type="submit">Submit Score</Button>
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
        onClick={onNextRound}
        disabled={isNextRoundDisabled}
      >
        Next Round
      </Button>
    </div>
  );
}
