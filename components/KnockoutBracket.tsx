import React from "react";
import type { KnockoutMatch } from "@/lib/types";

interface KnockoutBracketProps {
  matches: KnockoutMatch[];
}

const KnockoutBracket: React.FC<KnockoutBracketProps> = ({ matches }) => {
  const groupedMatches = matches.reduce((acc, match) => {
    acc[match.knockoutRound] = acc[match.knockoutRound] || [];
    acc[match.knockoutRound].push(match);
    return acc;
  }, {} as { [key: string]: KnockoutMatch[] });

  return (
    <div>
      {["quarter", "semi", "final"].map((round) =>
        groupedMatches[round] ? (
          <div key={round}>
            <h3>{round.charAt(0).toUpperCase() + round.slice(1)} Finals</h3>
            {groupedMatches[round].map((match, index) => (
              <div key={`${round}-${match.matchNumber}-${index}`}>
                <span>
                  {match.knockoutRound} - Match {match.matchNumber}:{" "}
                  {match.team1[0]} vs {match.team2[0]}
                </span>
              </div>
            ))}
          </div>
        ) : null
      )}
    </div>
  );
};

export default KnockoutBracket;
