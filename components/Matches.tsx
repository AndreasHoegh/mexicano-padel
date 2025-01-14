import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import padelIcon from "../app/assets/padelIcon.png";
import VSLogo from "./VSLogo";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  const [openPopovers, setOpenPopovers] = useState<{ [key: number]: boolean }>(
    {}
  );
  return (
    <div className="space-y-8 mt-8 px-4 max-w-4xl mx-auto">
      <Card className="bg-transparent">
        <CardHeader className="text-center">
          <CardTitle className="bg-transparent text-3xl rounded-lg font-extrabold text-gray-800 flex items-center justify-center gap-2">
            <Image src={padelIcon} alt="Padel Icon" width={32} height={32} />
            <span className=" px-4 py-2  ">Round {round} Matches</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {matches.map((match, index) => (
            <Card
              key={index}
              className={match.isScoreSubmitted ? "bg-gray-50" : "bg-slate-100"}
            >
              <CardContent className="p-6">
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleScoreSubmit(index);
                  }}
                >
                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 w-full">
                    <div className="w-full sm:flex-1 text-center">
                      <h3 className="font-semibold text-lg  text-red-700">
                        <div className="flex sm:flex-col items-center justify-center sm:items-end">
                          {match.team1[0]}
                          <span className="mx-2 sm:my-1 sm:mx-0">&</span>
                          {match.team1[1]}
                        </div>
                      </h3>
                    </div>
                    <div className="flex flex-row items-center gap-4">
                      {match.isScoreSubmitted ? (
                        <span className="w-16 text-center text-xl font-bold text-gray-500">
                          {match.team1Score}
                        </span>
                      ) : (
                        // Replace the Input component with this:
                        // Replace the Popover component with this:
                        <Popover
                          open={openPopovers[index]}
                          onOpenChange={(open) => {
                            setOpenPopovers((prev) => ({
                              ...prev,
                              [index]: open,
                            }));
                          }}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-12 sm:w-16 text-center text-lg sm:text-xl border border-red-950 bg-red-700 text-white"
                              disabled={match.isScoreSubmitted}
                            >
                              {editingScores[index]?.team1 ?? match.team1Score}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-48 p-2">
                            <div className="grid grid-cols-4 gap-2">
                              {Array.from({ length: 22 }, (_, i) => (
                                <Button
                                  key={i}
                                  variant="outline"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    handleScoreChange(index, "team1", i);
                                    // Close this specific popover
                                    setOpenPopovers((prev) => ({
                                      ...prev,
                                      [index]: false,
                                    }));
                                  }}
                                >
                                  {i}
                                </Button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                      <span className="text-2xl font-bold text-blue-700">
                        <VSLogo />
                      </span>
                      {match.isScoreSubmitted ? (
                        <span className="w-16 text-center text-xl font-bold text-gray-500">
                          {match.team2Score}
                        </span>
                      ) : (
                        <Popover
                          open={openPopovers[`${index}-team2`]}
                          onOpenChange={(open) => {
                            setOpenPopovers((prev) => ({
                              ...prev,
                              [`${index}-team2`]: open,
                            }));
                          }}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-12 sm:w-16 text-center text-lg sm:text-xl border border-blue-900 bg-blue-800 text-white"
                              disabled={match.isScoreSubmitted}
                            >
                              {editingScores[index]?.team2 ?? match.team2Score}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-48 p-2">
                            <div className="grid grid-cols-4 gap-2">
                              {Array.from({ length: 22 }, (_, i) => (
                                <Button
                                  key={i}
                                  variant="outline"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    handleScoreChange(index, "team2", i);
                                    setOpenPopovers((prev) => ({
                                      ...prev,
                                      [`${index}-team2`]: false,
                                    }));
                                  }}
                                >
                                  {i}
                                </Button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                    <div className="w-full sm:flex-1 text-center">
                      <h3 className="font-semibold text-lg text-blue-900">
                        <div className="flex sm:flex-col items-center justify-center sm:items-start">
                          {match.team2[0]}
                          <span className="mx-2 sm:my-1 sm:mx-0">&</span>
                          {match.team2[1]}
                        </div>
                      </h3>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    {match.isScoreSubmitted ? (
                      <Button
                        type="button"
                        className=" text-white"
                        onClick={(e) => {
                          e.preventDefault();
                          const updatedScores = { ...scores };
                          match.team1.forEach(
                            (player) =>
                              (updatedScores[player] -= match.team1Score)
                          );
                          match.team2.forEach(
                            (player) =>
                              (updatedScores[player] -= match.team2Score)
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
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
      <div className="flex justify-center">
        <Button
          onClick={onNextRound}
          disabled={isNextRoundDisabled}
          className="text-lg bg-green-500 disabled:bg-slate-500"
        >
          Next Round <ChevronRight className="ml-2" />
        </Button>
      </div>
    </div>
  );
}
