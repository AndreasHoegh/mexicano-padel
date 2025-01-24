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
  isKnockout?: boolean;
  knockoutRound?: string;
  matchNumber?: number;
  group?: number;
  round?: number;
};

type EditingScores = {
  [key: string | number]: {
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
    value: number,
    isKnockout?: boolean
  ) => void;
  isKnockout?: boolean;
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
  isKnockout,
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
    value: number,
    isKnockout?: boolean
  ) => void;
  isTeam1: boolean;
  isKnockout?: boolean;
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
                  handleScoreChange(index, team, i, isKnockout);
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
  isKnockout,
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
    value: number,
    isKnockout?: boolean
  ) => void;
  isKnockout?: boolean;
}) {
  return (
    <div className="flex flex-row items-center gap-4">
      {/* Team 1 Score */}
      <MemoizedScorePopover
        index={index}
        team="team1"
        score={
          isKnockout
            ? editingScores[`knockout-${index}`]?.team1 ?? 0
            : editingScores[index]?.team1 ?? 0
        }
        isOpen={openPopovers[isKnockout ? `knockout-${index}` : index]}
        onOpenChange={(open) =>
          setOpenPopovers((prev: { [key: string]: boolean }) => ({
            ...prev,
            [isKnockout ? `knockout-${index}` : index]: open,
          }))
        }
        pointsPerMatch={pointsPerMatch}
        pointSystem={pointSystem}
        handleScoreChange={handleScoreChange}
        isTeam1={true}
        isKnockout={isKnockout}
      />

      <span className="text-2xl font-bold text-blue-700">
        <VSLogo />
      </span>

      {/* Team 2 Score */}
      <MemoizedScorePopover
        index={index}
        team="team2"
        score={
          isKnockout
            ? editingScores[`knockout-${index}`]?.team2 ?? 1
            : editingScores[index]?.team2 ?? 1
        }
        isOpen={
          openPopovers[
            isKnockout ? `knockout-${index}-team2` : `${index}-team2`
          ]
        }
        onOpenChange={(open) =>
          setOpenPopovers((prev: { [key: string]: boolean }) => ({
            ...prev,
            [isKnockout ? `knockout-${index}-team2` : `${index}-team2`]: open,
          }))
        }
        pointsPerMatch={pointsPerMatch}
        pointSystem={pointSystem}
        handleScoreChange={handleScoreChange}
        isTeam1={false}
        isKnockout={isKnockout}
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
  isKnockout,
}: MatchCardProps) {
  const isKnockoutCheck = "isKnockout" in match && match.isKnockout;

  return (
    <Card className="bg-slate-100">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="text-center font-semibold text-gray-600">
            {isKnockoutCheck
              ? `${match.knockoutRound} - Match ${match.matchNumber}`
              : courtName}
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
              isKnockout={isKnockoutCheck}
            />

            {/* Team 2 */}
            <TeamDisplay team={match.team2} mode={mode} isTeam1={false} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
