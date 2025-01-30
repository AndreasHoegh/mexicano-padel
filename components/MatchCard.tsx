import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Match, EditingScores } from "@/lib/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { memo } from "react";

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
  isLeftSide, // new prop to indicate which side
}: {
  team: string[];
  mode: "individual" | "team";
  isLeftSide: boolean; // add to type definition
}) {
  return (
    <div className="h-full w-full flex items-center justify-center">
      {mode === "team" ? (
        // Team mode - single team name
        <div
          className={`relative bottom-[-40px] ${
            isLeftSide ? "left-[40px]" : "right-[40px]"
          }`}
        >
          <span className="truncate max-w-[120px] text-white text-md sm:text-lg font-semibold">
            {team[0]}
          </span>
        </div>
      ) : (
        // Individual mode - two player names stacked
        <div className="flex flex-col items-center justify-center space-y-4 h-full">
          <span
            className={`truncate max-w-[120px] text-white text-md sm:text-lg font-semibold ${
              isLeftSide
                ? "relative right-[-40px] top-[-20px]"
                : "relative left-[-40px] top-[-20px]"
            }`}
          >
            {team[0]}
          </span>
          <span
            className={`truncate max-w-[120px] text-white text-md sm:text-lg font-semibold ${
              isLeftSide
                ? "relative right-[-40px] bottom-[-20px]"
                : "relative left-[-40px] bottom-[-20px]"
            }`}
          >
            {team[1]}
          </span>
        </div>
      )}
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
          className="w-12 sm:w-16 text-center text-lg sm:text-xl border text-white bg-gray-800"
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

      {/*       <span className="text-2xl font-bold text-blue-700">
        <VSLogo />
      </span> */}

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
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-gray-200 shadow-lg">
      {/* Court Image */}
      <Image
        src="/padelCourt.png"
        alt="Padel Court"
        fill
        className="object-cover"
        priority
      />

      {/* Court Name */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full">
        <h2 className="text-white font-semibold text-xs sm:text-base">
          {courtName}
        </h2>
      </div>

      <div className="absolute inset-0 flex">
        {/* Left Team */}
        <div className="flex-1 flex items-center justify-center">
          <TeamDisplay team={match.team1} mode={mode} isLeftSide={true} />
        </div>

        {/* Center Score Controls */}
        <div className="flex items-center justify-center w-24">
          <ScoreControls
            index={index}
            editingScores={editingScores}
            pointsPerMatch={pointsPerMatch}
            pointSystem={pointSystem}
            openPopovers={openPopovers}
            setOpenPopovers={setOpenPopovers}
            handleScoreChange={handleScoreChange}
          />
        </div>

        {/* Right Team */}
        <div className="flex-1 flex items-center justify-center">
          <TeamDisplay team={match.team2} mode={mode} isLeftSide={false} />
        </div>
      </div>
    </div>
  );
}
