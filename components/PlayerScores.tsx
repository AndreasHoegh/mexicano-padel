interface PlayerScoresProps {
  scores: { [key: string]: number };
}

export default function PlayerScores({ scores }: PlayerScoresProps) {
  const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  return (
    <div className="mt-8 mx-auto max-w-md bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-center text-2xl font-bold text-gray-800 mb-4">
        Player Scores
      </h2>
      <ul className="divide-y divide-gray-200">
        {sortedScores.map(([player, score], index) => (
          <li
            key={player}
            className="flex justify-between items-center py-3 px-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
          >
            <div className="flex items-center">
              <span
                className={`inline-flex items-center justify-center w-8 h-8 text-center text-white font-bold rounded-full mr-3 ${
                  index === 0
                    ? "bg-yellow-500"
                    : index === 1
                    ? "bg-gray-400"
                    : index === 2
                    ? "bg-orange-500"
                    : "bg-blue-500"
                }`}
              >
                {index + 1}
              </span>
              <span className="text-gray-700 font-medium">{player}</span>
            </div>
            <span className="text-gray-600 font-semibold">{score} pts</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
