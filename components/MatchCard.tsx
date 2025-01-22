import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import VSLogo from "./VSLogo";
import { memo } from "react";

type Match = {
  team1: string[];
  team2: string[];
  team1Score: number;
  team2Score: number;
  isScoreSubmitted: boolean;
  team1Name?: string;
  team2Name?: string;
};

type EditingScores = {
  [key: number]: {
    team1: number;
    team2: number;
  };
};

type MatchCardProps = {
  initialMinutes: number;
  match: Match;
  index: number;
  courtName: string;
  mode: "individual" | "team";
  editingScores: EditingScores;
  pointsPerMatch: number;
  pointSystem: "pointsToPlay" | "pointsToWin" | "TimePlay";
  openPopovers: { [key: string]: boolean };
  setOpenPopovers: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >;
  handleScoreChange: (
    index: number,
    team: "team1" | "team2",
    value: number
  ) => void;
};

function TeamDisplay({
  team,
  mode,
  isTeam1,
}: {
  team: string[];
  mode: "individual" | "team";
  isTeam1: boolean;
}) {
  return (
    <div className="w-full sm:flex-1 text-center">
      <h3
        className={`font-semibold text-lg ${
          isTeam1 ? "text-red-700" : "text-blue-900"
        }`}
      >
        {mode === "team" ? (
          team[0]
        ) : (
          <div
            className={`flex sm:flex-col items-center justify-center ${
              isTeam1 ? "sm:items-end" : "sm:items-start"
            }`}
          >
            <span className="truncate max-w-[120px]">{team[0]}</span>
            <span className="mx-2 sm:my-1 sm:mx-0">&</span>
            <span className="truncate max-w-[120px]">{team[1]}</span>
          </div>
        )}
      </h3>
    </div>
  );
}

function ScorePopover({
  index,
  team,
  score,
  isOpen,
  onOpenChange,
  pointsPerMatch,
  pointSystem,
  handleScoreChange,
  isTeam1,
}: {
  index: number;
  team: "team1" | "team2";
  score: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  pointsPerMatch: number;
  pointSystem: "pointsToPlay" | "pointsToWin" | "TimePlay";
  handleScoreChange: (
    index: number,
    team: "team1" | "team2",
    value: number
  ) => void;
  isTeam1: boolean;
}) {
  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="spinbutton"
          aria-valuenow={score}
          className={`w-12 sm:w-16 text-center text-lg sm:text-xl border ${
            isTeam1
              ? "!border-red-950 !bg-red-700"
              : "!border-blue-900 !bg-blue-800"
          } text-white`}
        >
          {score}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2">
        <div className="grid grid-cols-4 gap-2">
          {Array.from(
            { length: pointSystem === "TimePlay" ? 50 : pointsPerMatch + 1 },
            (_, i) => (
              <Button
                key={i}
                variant="outline"
                className="h-8 w-8"
                onClick={() => {
                  handleScoreChange(index, team, i);
                  onOpenChange(false);
                }}
              >
                {i}
              </Button>
            )
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

const MemoizedScorePopover = memo(ScorePopover);

function ScoreControls({
  index,
  editingScores,
  pointsPerMatch,
  pointSystem,
  openPopovers,
  setOpenPopovers,
  handleScoreChange,
}: {
  index: number;
  editingScores: EditingScores;
  pointsPerMatch: number;
  pointSystem: "pointsToPlay" | "pointsToWin" | "TimePlay";
  openPopovers: { [key: string]: boolean };
  setOpenPopovers: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >;
  handleScoreChange: (
    index: number,
    team: "team1" | "team2",
    value: number
  ) => void;
}) {
  return (
    <div className="flex flex-row items-center gap-4">
      {/* Team 1 Score */}
      <MemoizedScorePopover
        index={index}
        team="team1"
        score={editingScores[index]?.team1 ?? 0}
        isOpen={openPopovers[index]}
        onOpenChange={(open) =>
          setOpenPopovers((prev: { [key: string]: boolean }) => ({
            ...prev,
            [index]: open,
          }))
        }
        pointsPerMatch={pointsPerMatch}
        pointSystem={pointSystem}
        handleScoreChange={handleScoreChange}
        isTeam1={true}
      />

      <span className="text-2xl font-bold text-blue-700">
        <VSLogo />
      </span>

      {/* Team 2 Score */}
      <MemoizedScorePopover
        index={index}
        team="team2"
        score={editingScores[index]?.team2 ?? 0}
        isOpen={openPopovers[`${index}-team2`]}
        onOpenChange={(open) =>
          setOpenPopovers((prev: { [key: string]: boolean }) => ({
            ...prev,
            [`${index}-team2`]: open,
          }))
        }
        pointsPerMatch={pointsPerMatch}
        pointSystem={pointSystem}
        handleScoreChange={handleScoreChange}
        isTeam1={false}
      />
    </div>
  );
}

export function MatchCard({
  match,
  index,
  courtName,
  mode,
  editingScores,
  pointsPerMatch,
  pointSystem,
  openPopovers,
  setOpenPopovers,
  handleScoreChange,
}: MatchCardProps) {
  return (
    <Card className="bg-slate-100">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="text-center font-semibold text-gray-600">
            {courtName}
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 w-full">
            {/* Team 1 */}
            <TeamDisplay team={match.team1} mode={mode} isTeam1 />

            {/* Score Controls */}
            <ScoreControls
              index={index}
              editingScores={editingScores}
              pointsPerMatch={pointsPerMatch}
              pointSystem={pointSystem}
              openPopovers={openPopovers}
              setOpenPopovers={setOpenPopovers}
              handleScoreChange={handleScoreChange}
            />

            {/* Team 2 */}
            <TeamDisplay team={match.team2} mode={mode} isTeam1={false} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
