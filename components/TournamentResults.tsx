import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { GroupStanding, KnockoutMatch } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface TournamentResultsProps {
  groupStandings: { [key: number]: GroupStanding[] };
  knockoutMatches: KnockoutMatch[];
  onStartNewTournament: () => void;
}

export const TournamentResults: React.FC<TournamentResultsProps> = ({
  groupStandings,
  knockoutMatches,
  onStartNewTournament,
}) => {
  const getKnockoutStageMatches = (round: string) => {
    return knockoutMatches.filter((match) => match.knockoutRound === round);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Tournament Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">
                Group Stage Results
              </h3>
              {Object.entries(groupStandings).map(
                ([groupNumber, standings]) => (
                  <div key={groupNumber} className="mb-6">
                    <h4 className="text-lg font-medium mb-2">
                      Group {Number.parseInt(groupNumber) + 1}
                    </h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Position</TableHead>
                          <TableHead>Team</TableHead>
                          <TableHead>Played</TableHead>
                          <TableHead>Won</TableHead>
                          <TableHead>Lost</TableHead>
                          <TableHead>Points</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {standings.map((standing, index) => (
                          <TableRow key={standing.teamName}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{standing.teamName}</TableCell>
                            <TableCell>{standing.matchesPlayed}</TableCell>
                            <TableCell>{standing.wins}</TableCell>
                            <TableCell>
                              {standing.matchesPlayed - standing.wins}
                            </TableCell>
                            <TableCell>{standing.points}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">
                Knockout Stage Results
              </h3>
              {["quarter", "semi", "final"].map((round) => {
                const matches = getKnockoutStageMatches(round);
                if (matches.length === 0) return null;
                return (
                  <div key={round} className="mb-6">
                    {round === "final" && (
                      <h4 className="text-lg font-medium mb-2">
                        {round.charAt(0).toUpperCase() + round.slice(1)}
                      </h4>
                    )}
                    {round !== "final" && (
                      <h4 className="text-lg font-medium mb-2">
                        {round.charAt(0).toUpperCase() + round.slice(1)}finals
                      </h4>
                    )}
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Match</TableHead>
                          <TableHead>Team 1</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Team 2</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {matches.map((match) => (
                          <TableRow
                            key={`${match.knockoutRound}-${match.matchNumber}`}
                          >
                            <TableCell>{match.matchNumber}</TableCell>
                            <TableCell>{match.team1[0]}</TableCell>
                            <TableCell>{`${match.team1Score} - ${match.team2Score}`}</TableCell>
                            <TableCell>{match.team2[0]}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-center mt-8">
        <Button
          onClick={onStartNewTournament}
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          Start New Tournament
        </Button>
      </div>
    </div>
  );
};

export default TournamentResults;
