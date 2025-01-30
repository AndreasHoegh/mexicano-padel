import { Scores } from "@/lib/types";
import { Button } from "./ui/button";
import PlayerScores from "./PlayerScores";

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

  return (
    <div className="text-center space-y-4">
      <h2 className="text-2xl font-bold text-white">
        {isFinished ? (
          <>
            Tournament Complete!
            <p className="text-lg mt-2 text-white">
              Congratulations to{" "}
              {
                Object.entries(scores).sort(
                  (a, b) => b[1].points - a[1].points
                )[0][0]
              }
              !
            </p>
          </>
        ) : (
          "Tournament Paused"
        )}
      </h2>
      <div className="p-6 bg-gray-50 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4">
          {isFinished ? "Final" : "Current"} Standings
        </h3>
        <PlayerScores scores={scores} />
      </div>
      {!isFinished && (
        <div className="space-x-3">
          <Button
            onClick={() => setIsPaused(false)}
            className="bg-green-500 hover:bg-green-600"
          >
            Resume Tournament
          </Button>
          <Button
            onClick={() => setIsFinished(true)}
            className="bg-red-500 hover:bg-red-600"
          >
            End Tournament
          </Button>
        </div>
      )}
      {isFinished && (
        <Button
          onClick={handleStartNewTournament}
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          Start New Tournament
        </Button>
      )}
    </div>
  );
}
