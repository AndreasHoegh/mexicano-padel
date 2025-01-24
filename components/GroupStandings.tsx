import { GroupStanding } from "@/lib/types";

interface GroupStandingsProps {
  standings: { [key: number]: GroupStanding[] };
}

export function GroupStandings({ standings }: GroupStandingsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {Object.entries(standings).map(([groupNum, groupStandings]) => (
        <div
          key={groupNum}
          className="bg-white/10 backdrop-blur-sm rounded-lg shadow-md p-4"
        >
          <h3 className="text-lg font-semibold mb-2 text-gray-200">
            Group {Number(groupNum) + 1}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 text-gray-300">Team</th>
                  <th className="text-center py-2 text-gray-300">P</th>
                  <th className="text-center py-2 text-gray-300">W</th>
                  <th className="text-center py-2 text-gray-300">Pts</th>
                </tr>
              </thead>
              <tbody>
                {groupStandings
                  .sort((a, b) => b.points - a.points || b.wins - a.wins)
                  .map((standing) => (
                    <tr
                      key={standing.teamName}
                      className="border-b border-gray-700/50"
                    >
                      <td className="py-2 text-gray-200">
                        {standing.teamName}
                      </td>
                      <td className="text-center py-2 text-gray-300">
                        {standing.matchesPlayed}
                      </td>
                      <td className="text-center py-2 text-gray-300">
                        {standing.wins}
                      </td>
                      <td className="text-center py-2 text-gray-300">
                        {standing.points}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
