import { Trophy, Medal, Award } from "lucide-react";

interface PlayerScoresProps {
  scores: { [key: string]: number };
}

const PlayerScores: React.FC<PlayerScoresProps> = ({ scores }) => {
  const sortedPlayers = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([name, score], index) => ({ name, score, rank: index + 1 }));

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-700" />;
      default:
        return <span className="w-6 text-center font-mono">{rank}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {sortedPlayers.map(({ name, score, rank }) => (
        <div
          key={name}
          className="flex items-center gap-4 p-3 bg-gradient-to-r from-white to-gray-50 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-center w-8">
            {getRankIcon(rank)}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">{name}</h3>
          </div>
          <div className="text-lg font-bold text-yellow-600">{score} pts</div>
        </div>
      ))}
    </div>
  );
};

export default PlayerScores;
