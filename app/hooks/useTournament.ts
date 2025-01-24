// hooks/useTournament.ts
import { KnockoutMatch, Match } from "@/lib/types";
import { Scores } from "@/lib/types";
import { useState } from "react";

export const useTournament = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [scores, setScores] = useState<Scores>({});
  const [round, setRound] = useState<number>(1);
  const [isGroupStage, setIsGroupStage] = useState(true);
  const [knockoutMatches, setKnockoutMatches] = useState<KnockoutMatch[]>([]);

  const updateMatches = (updatedMatches: Match[]) => {
    setMatches(updatedMatches);
  };

  const updateScores = (updatedScores: Scores) => {
    setScores(updatedScores);
  };

  const startKnockoutStage = (updatedKnockoutMatches: KnockoutMatch[]) => {
    setKnockoutMatches(updatedKnockoutMatches);
    setIsGroupStage(false);
    setMatches(updatedKnockoutMatches.filter((match) => match.round === 1));
    setRound(1);
  };

  return {
    matches,
    scores,
    round,
    isGroupStage,
    knockoutMatches,
    updateMatches,
    updateScores,
    startKnockoutStage,
    setMatches,
    setScores,
    setRound,
    setIsGroupStage,
    setKnockoutMatches,
  };
};
