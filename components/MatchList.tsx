// components/MatchList.tsx
import { EditingScores, Match, KnockoutMatch } from "@/lib/types";
import { Court } from "@/lib/types";
import { MatchCard } from "./MatchCard";
import { useState } from "react";

interface MatchListProps {
  matches: Match[] | KnockoutMatch[];
  editingScores: EditingScores;
  handleScoreChange: (
    index: number,
    team: "team1" | "team2",
    value: number,
    isKnockout?: boolean
  ) => void;
  pointsPerMatch: number;
  pointSystem: "pointsToPlay" | "pointsToWin" | "TimePlay";
  courts: Court[];
  format?: "mexicano" | "americano" | "groups";
  mode: "individual" | "team";
  isKnockout?: boolean;
}

export const MatchList = ({
  matches,
  editingScores,
  handleScoreChange,
  pointsPerMatch,
  pointSystem,
  courts,
  format,
  mode,
  isKnockout = false,
}: MatchListProps) => {
  const [openPopovers, setOpenPopovers] = useState<{
    [key: string | number]: boolean;
  }>({});

  return (
    <div className="grid grid-cols-1 gap-4">
      {matches.map((match, index) => (
        <MatchCard
          openPopovers={openPopovers}
          setOpenPopovers={setOpenPopovers}
          key={`${"knockoutRound" in match ? match.knockoutRound : "group"}-${
            match.matchNumber
          }-${index}`}
          initialMinutes={pointsPerMatch}
          match={match}
          index={index}
          courtName={
            format === "groups"
              ? "isKnockout" in match && match.isKnockout
                ? `${match.knockoutRound} - Match ${match.matchNumber}`
                : `Group ${
                    "group" in match && typeof match.group === "number"
                      ? match.group + 1
                      : 1
                  } - Round ${
                    "round" in match && typeof match.round === "number"
                      ? match.round
                      : 1
                  }`
              : courts[index % courts.length].name
          }
          mode={mode}
          editingScores={editingScores}
          pointsPerMatch={pointsPerMatch}
          pointSystem={pointSystem}
          handleScoreChange={(index, team, value) =>
            handleScoreChange(index, team, value, isKnockout)
          }
        />
      ))}
    </div>
  );
};
