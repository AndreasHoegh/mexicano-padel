import { useState, useEffect } from "react";
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

interface Court {
  id: number;
  name: string;
}

interface MatchesProps {
  matches: Match[];
  scores: { [key: string]: number };
  onUpdateMatches: (updatedMatches: Match[]) => void;
  onUpdateScores: (updatedScores: { [key: string]: number }) => void;
  round: number;
  onNextRound: () => void;
  pointsPerMatch: number;
  isLastRound: boolean;
  courts: Court[];
}

export default function Matches({
  matches,
  scores,
  onUpdateMatches,
  onUpdateScores,
  round,
  onNextRound,
  pointsPerMatch,
  isLastRound,
  courts,
}: MatchesProps) {
  const [editingScores, setEditingScores] = useState<EditingScores>({});
  const [openPopovers, setOpenPopovers] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    // Simply initialize editing scores whenever matches change
    const initialEditingScores: EditingScores = {};
    matches.forEach((match, index) => {
      initialEditingScores[index] = {
        team1: match.team1Score || 0,
        team2: match.team2Score || 0,
      };
    });
    setEditingScores(initialEditingScores);
  }, [matches]); // Only depend on matches

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      setShowButtons(
        scrollPosition > 100 ||
          scrollPosition + windowHeight >= documentHeight - 100
      );
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScoreChange = (
    index: number,
    team: "team1" | "team2",
    value: number
  ) => {
    setEditingScores((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        [team]: value,
        [team === "team1" ? "team2" : "team1"]: pointsPerMatch - value,
      },
    }));
  };

  const isScoreValid = (index: number) => {
    const team1Score = editingScores[index]?.team1;
    const team2Score = editingScores[index]?.team2;

    return (
      team1Score !== undefined &&
      team2Score !== undefined &&
      team1Score + team2Score === pointsPerMatch
    );
  };

  const handleNextRound = () => {
    // Validate all scores
    const allScoresValid = matches.every((_, index) => isScoreValid(index));

    if (!allScoresValid) {
      alert(
        "Please ensure all match scores are valid before proceeding to the next round."
      );
      return;
    }

    // Prepare updated matches and scores
    const updatedMatches = matches.map((match, index) => ({
      ...match,
      team1Score: editingScores[index].team1,
      team2Score: editingScores[index].team2,
      isScoreSubmitted: true,
    }));

    const newScores = { ...scores };
    updatedMatches.forEach((match, index) => {
      match.team1.forEach((player) => {
        newScores[player] =
          (newScores[player] || 0) + editingScores[index].team1;
      });
      match.team2.forEach((player) => {
        newScores[player] =
          (newScores[player] || 0) + editingScores[index].team2;
      });
    });

    // Update state sequentially
    onUpdateScores(newScores); // First, update the scores
    onUpdateMatches(updatedMatches); // Then, update the matches
    onNextRound(); // Finally, move to next round
  };

  const areAllScoresValid = () => {
    return matches.every((_, index) => isScoreValid(index));
  };

  return (
    <div className="space-y-8 mt-8 px-4 max-w-4xl mx-auto">
      <Card className="bg-gradient-to-r from-red-500 to-yellow-500">
        <CardHeader className="text-center">
          <CardTitle className="bg-transparent text-3xl rounded-lg font-extrabold text-gray-800 flex items-center justify-center gap-2">
            <Image src={padelIcon} alt="Padel Icon" width={32} height={32} />
            <span className="px-4 py-2">
              {isLastRound ? "Final Round" : `Round ${round}`}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {matches.map((match, index) => (
            <Card key={index} className="bg-slate-100">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="text-center font-semibold text-gray-600">
                    {courts[index % courts.length]?.name || "Court 1"}
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 w-full">
                    <div className="w-full sm:flex-1 text-center">
                      <h3 className="font-semibold text-lg text-red-700">
                        <div className="flex sm:flex-col items-center justify-center sm:items-end">
                          {match.team1[0]}
                          <span className="mx-2 sm:my-1 sm:mx-0">&</span>
                          {match.team1[1]}
                        </div>
                      </h3>
                    </div>
                    <div className="flex flex-row items-center gap-4">
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
                          >
                            {editingScores[index]?.team1 ?? 0}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-2">
                          <div className="grid grid-cols-4 gap-2">
                            {Array.from(
                              { length: pointsPerMatch + 1 },
                              (_, i) => (
                                <Button
                                  key={i}
                                  variant="outline"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    handleScoreChange(index, "team1", i);
                                    setOpenPopovers((prev) => ({
                                      ...prev,
                                      [index]: false,
                                    }));
                                  }}
                                >
                                  {i}
                                </Button>
                              )
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                      <span className="text-2xl font-bold text-blue-700">
                        <VSLogo />
                      </span>
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
                          >
                            {editingScores[index]?.team2 ?? 0}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-2">
                          <div className="grid grid-cols-4 gap-2">
                            {Array.from(
                              { length: pointsPerMatch + 1 },
                              (_, i) => (
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
                              )
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
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
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          onClick={handleNextRound}
          className="text-lg bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-500 w-full"
          disabled={!areAllScoresValid()}
        >
          Submit Scores & Next Round <ChevronRight className="ml-2" />
        </Button>
      </div>
    </div>
  );
}
