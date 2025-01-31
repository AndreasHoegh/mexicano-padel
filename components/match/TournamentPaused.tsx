import { Scores } from "@/lib/types";
import { Button } from "../ui/button";
import PlayerScores from "./PlayerScores";
import { Trophy, Play, X } from "lucide-react";

export default function TournamentPaused({
  isFinished,
  scores,
  setIsPaused,
  setIsFinished,
}: {
  isFinished: boolean;
  scores: Scores;
  setIsPaused: (paused: boolean) => void;
  setIsFinished: (finished: boolean) => void;
}) {
  const handleStartNewTournament = () => {
    localStorage.removeItem("tournament_state");
    window.location.reload();
  };

  const winner = Object.entries(scores).sort(
    (a, b) => b[1].points - a[1].points
  )[0][0];

  return (
    <div className="w-auto max-w-2xl mx-auto text-center space-y-4 sm:space-y-6 px-2 sm:px-4">
      {isFinished ? (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 sm:p-6 rounded-lg shadow-lg">
            <Trophy className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-white mb-2 sm:mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Tournament Complete!
            </h2>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 mt-2 sm:mt-4">
              <p className="text-lg sm:text-xl text-white">
                Congratulations to{" "}
                <span className="font-bold text-yellow-200">{winner}</span>!
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-lg shadow-lg border border-gray-700">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Tournament Paused
          </h2>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="bg-gray-200 px-4 sm:px-6 py-3 sm:py-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800">
            {isFinished ? "Final" : "Current"} Standings
          </h3>
        </div>
        <div className="p-2 sm:p-4">
          <PlayerScores scores={scores} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-2 sm:pt-4">
        {!isFinished ? (
          <>
            <Button
              onClick={() => setIsPaused(false)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-105 text-sm sm:text-base w-full sm:w-auto"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5" />
              Resume Tournament
            </Button>
            <Button
              onClick={() => setIsFinished(true)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-105 text-sm sm:text-base w-full sm:w-auto"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
              End Tournament
            </Button>
          </>
        ) : (
          <Button
            onClick={handleStartNewTournament}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-105 text-sm sm:text-base w-full w-auto mx-4 sm:mx-0"
          >
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
            Start New Tournament
          </Button>
        )}
      </div>
    </div>
  );
}
