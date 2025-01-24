interface GroupMatch {
  team1: string[];
  team2: string[];
  group: number;
  round: number;
  team1Score: number;
  team2Score: number;
  isScoreSubmitted: boolean;
}

interface KnockoutMatch {
  team1: string[];
  team2: string[];
  round: number;
  matchNumber: number;
  team1Score: number;
  team2Score: number;
  isScoreSubmitted: boolean;
  isKnockout: boolean;
  knockoutRound: string;
}

interface GroupStanding {
  teamName: string;
  points: number;
  matchesPlayed: number;
  wins: number;
}

export function generateGroupMatches(
  teams: string[],
  teamsPerGroup: number,
  teamsAdvancing: number
): {
  groupMatches: GroupMatch[];
  knockoutMatches: KnockoutMatch[];
  groups: { [key: number]: string[] };
} {
  const numberOfGroups = Math.ceil(teams.length / teamsPerGroup);
  const groups: { [key: number]: string[] } = {};

  for (let i = 0; i < teams.length; i++) {
    const groupNumber = Math.floor(i / teamsPerGroup) + 1;
    if (!groups[groupNumber]) {
      groups[groupNumber] = [];
    }
    groups[groupNumber].push(teams[i]);
  }

  const groupMatches: GroupMatch[] = [];
  const groupStandings: { [key: number]: GroupStanding[] } = {};

  // Initialize group standings without "TBD"
  for (let i = 1; i <= numberOfGroups; i++) {
    groupStandings[i] = groups[i].map((team) => ({
      teamName: team,
      points: 0,
      matchesPlayed: 0,
      wins: 0,
    }));
  }

  // Generate all possible group matches (round-robin)
  for (let group = 1; group <= numberOfGroups; group++) {
    const groupTeams = groups[group];
    for (let i = 0; i < groupTeams.length - 1; i++) {
      for (let j = i + 1; j < groupTeams.length; j++) {
        groupMatches.push({
          team1: [groupTeams[i]],
          team2: [groupTeams[j]], // Ensure no "TBD"
          group: group,
          round: i + 1,
          team1Score: 0,
          team2Score: 0,
          isScoreSubmitted: false,
        });
      }
    }
  }

  console.log("Generated Group Matches:", groupMatches);
  console.log("Initialized Group Standings:", groupStandings);

  const knockoutMatches: KnockoutMatch[] = []; // Initially empty

  return {
    groupMatches,
    knockoutMatches,
    groups,
  };
}

function generateRoundRobinMatches(
  teams: string[],
  groupNumber: number
): GroupMatch[] {
  const matches: GroupMatch[] = [];
  const rounds = teams.length - 1;

  for (let round = 0; round < rounds; round++) {
    for (let i = 0; i < teams.length / 2; i++) {
      const team1Index = i;
      const team2Index = teams.length - 1 - i;

      if (team1Index >= team2Index) continue;

      matches.push({
        team1: [teams[team1Index]],
        team2: [teams[team2Index]],
        group: groupNumber,
        round: round + 1,
        team1Score: 0,
        team2Score: 0,
        isScoreSubmitted: false,
      });
    }
    teams = [teams[0], ...teams.slice(2), teams[1]];
  }

  return matches;
}

function generateKnockoutStructure(
  numberOfGroups: number,
  teamsAdvancingPerGroup: number
): KnockoutMatch[] {
  const matches: KnockoutMatch[] = [];

  const totalTeamsAdvancing = numberOfGroups * teamsAdvancingPerGroup;

  // Remove initial knockout structure with "TBD"
  //   if (totalTeamsAdvancing >= 8) {
  //     for (let i = 0; i < 4; i++) {
  //       matches.push({
  //         team1: ["TBD"],
  //         team2: ["TBD"],
  //         round: 1,
  //         isKnockout: true,
  //         knockoutRound: "quarter",
  //         matchNumber: i + 1,
  //         team1Score: 0,
  //         team2Score: 0,
  //         isScoreSubmitted: false,
  //       });
  //     }
  //   }

  // Only generate final when winners are available
  // Remove any pre-generating knockout matches
  // Matches will be generated dynamically based on winners

  // Initially, no knockout matches are generated
  // They will be generated in Matches.tsx after group stage

  return matches;
}

export function generateKnockoutMatches(
  groupStandings: { [key: number]: GroupStanding[] },
  teamsAdvancing: number
): KnockoutMatch[] {
  console.log(
    "Group Standings Before Generating Knockout Matches:",
    groupStandings
  );

  const advancedTeams: string[] = [];
  Object.values(groupStandings).forEach((standings) => {
    const sortedStandings = standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.wins - a.wins;
    });
    advancedTeams.push(
      ...sortedStandings.slice(0, teamsAdvancing).map((team) => team.teamName)
    );
  });

  console.log("Advanced Teams:", advancedTeams);

  const shuffledTeams = advancedTeams.sort(() => Math.random() - 0.5);
  console.log("Shuffled Teams:", shuffledTeams);

  const knockoutMatches: KnockoutMatch[] = [];

  for (let i = 0; i < shuffledTeams.length; i += 2) {
    if (shuffledTeams[i + 1]) {
      // Ensure no "TBD"
      knockoutMatches.push({
        team1: [shuffledTeams[i]],
        team2: [shuffledTeams[i + 1]],
        round: 1,
        matchNumber: Math.floor(i / 2) + 1,
        team1Score: 0,
        team2Score: 0,
        isScoreSubmitted: false,
        isKnockout: true,
        knockoutRound: shuffledTeams.length > 4 ? "quarter" : "semi",
      });
    }
  }

  console.log("Generated Knockout Matches:", knockoutMatches);
  return knockoutMatches;
}

export function advanceToNextRound(
  currentKnockoutMatches: KnockoutMatch[],
  roundResults: { [matchNumber: number]: string }
): KnockoutMatch[] {
  console.log("AdvanceToNextRound called with:");
  console.log("Current Knockout Matches:", currentKnockoutMatches);
  console.log("Round Results:", roundResults);

  const nextRound = Math.max(...currentKnockoutMatches.map((m) => m.round)) + 1;
  const nextRoundMatches: KnockoutMatch[] = [];
  const winners: string[] = Object.values(roundResults);

  console.log("Winners advancing to next round:", winners);

  for (let i = 0; i < winners.length; i += 2) {
    const team1 = winners[i];
    const team2 = winners[i + 1];
    const knockoutRound = winners.length === 2 ? "final" : "semi";

    if (team1 && team2) {
      // Ensure both teams are present
      const match: KnockoutMatch = {
        team1: [team1],
        team2: [team2],
        round: nextRound,
        matchNumber: nextRoundMatches.length + 1,
        team1Score: 0,
        team2Score: 0,
        isScoreSubmitted: false,
        knockoutRound: knockoutRound,
        isKnockout: true,
      };
      console.log("Creating next round match:", match);
      nextRoundMatches.push(match);
    }
  }

  const updatedMatches = nextRoundMatches; // Replace instead of append

  console.log("Updated Knockout Matches:", updatedMatches);
  return updatedMatches;
}

function generateSemiFinals(winners: string[]): KnockoutMatch[] {
  if (winners.length !== 4) {
    console.error("Semi-finals require exactly four winners.");
    return [];
  }
  return winners.reduce((acc, team, index, array) => {
    if (index % 2 === 0) {
      acc.push({
        team1: [team],
        team2: [array[index + 1]],
        round: 2,
        isKnockout: true,
        knockoutRound: "semi",
        matchNumber: acc.length + 1,
        team1Score: 0,
        team2Score: 0,
        isScoreSubmitted: false,
      });
    }
    return acc;
  }, [] as KnockoutMatch[]);
}

function generateFinal(winners: string[]): KnockoutMatch[] {
  if (winners.length !== 2) {
    console.error("Final round requires exactly two winners.");
    return [];
  }

  return [
    {
      team1: [winners[0]],
      team2: [winners[1]],
      round: 3,
      isKnockout: true,
      knockoutRound: "final",
      matchNumber: 1,
      team1Score: 0,
      team2Score: 0,
      isScoreSubmitted: false,
    },
  ];
}
