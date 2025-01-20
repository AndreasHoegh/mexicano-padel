import { Match, Scores, Court } from "../lib/types";

function findLeastPlayedWith(
  player: string,
  availablePlayers: string[],
  usedPartnerships: Set<string>,
  partnerships: { [key: string]: { [key: string]: number } },
  remainingPlayers: string[] = []
): { partner: string; remaining: string[] } {
  console.log(`\nFinding partner for ${player}`);
  console.log("Available players:", availablePlayers);
  console.log("Used partnerships:", Array.from(usedPartnerships));
  console.log("Current partnerships for", player, ":", partnerships[player]);

  // Calculate a score for each potential partner
  const partnerScores = availablePlayers
    .filter((p) => p !== player && !usedPartnerships.has(`${player}-${p}`))
    .map((p) => {
      // Base score is the number of times they've played together
      let score = partnerships[player]?.[p] || 0;

      // If this is for the first player of a match and we have remaining players
      // Look ahead to see if choosing this partner would force any bad partnerships
      if (remainingPlayers.length > 0) {
        const otherPlayers = remainingPlayers.filter(
          (rp) => rp !== player && rp !== p
        );

        // Calculate the average partnership count between remaining players
        let forcedPartnershipsScore = 0;
        if (otherPlayers.length >= 2) {
          for (let i = 0; i < otherPlayers.length - 1; i++) {
            for (let j = i + 1; j < otherPlayers.length; j++) {
              const timesPlayed =
                (partnerships[otherPlayers[i]]?.[otherPlayers[j]] || 0) +
                (partnerships[otherPlayers[j]]?.[otherPlayers[i]] || 0);
              forcedPartnershipsScore += timesPlayed;
            }
          }
          // Add this to the score to penalize choices that would force frequent partnerships
          score += forcedPartnershipsScore / 2;
        }
      }

      return {
        id: p,
        score,
      };
    });

  console.log("\nScores for each potential partner:");
  partnerScores.forEach((p) => {
    console.log(`${p.id}: score ${p.score}`);
  });

  // Sort by score (lower is better)
  partnerScores.sort((a, b) => a.score - b.score);

  // Get all players who have the minimum score
  const minScore = partnerScores[0]?.score || 0;
  const candidates = partnerScores.filter((p) => p.score === minScore);

  console.log(
    `\nCandidates with best score (${minScore}):`,
    candidates.map((c) => c.id)
  );

  // Randomly select one from the candidates
  const selectedPartner =
    candidates[Math.floor(Math.random() * candidates.length)];
  const partner = selectedPartner?.id;

  if (!partner) {
    throw new Error(`No partner found for ${player}`);
  }

  console.log(`Selected partner for ${player}: ${partner}`);

  return {
    partner,
    remaining: availablePlayers.filter((p) => p !== partner && p !== player),
  };
}

function findOpponentForTeam(
  team: string[],
  availablePlayers: string[],
  partnerships: { [key: string]: { [key: string]: number } }
): { opponent: string; remaining: string[] } {
  console.log(`\nFinding opponent for team: ${team.join(", ")}`);
  console.log("Available players:", availablePlayers);

  // Calculate scores for each potential opponent
  const opponentScores = availablePlayers.map((player) => {
    // Base score is total times played against the team
    let score = 0;
    for (const teamPlayer of team) {
      const timesPlayed =
        (partnerships[teamPlayer]?.[player] || 0) +
        (partnerships[player]?.[teamPlayer] || 0);
      score += timesPlayed;
    }

    // Look ahead: Add score based on partnership history with remaining players
    const remainingPlayers = availablePlayers.filter((p) => p !== player);
    if (remainingPlayers.length > 0) {
      let partnershipScore = 0;
      remainingPlayers.forEach((partner) => {
        partnershipScore +=
          (partnerships[player]?.[partner] || 0) +
          (partnerships[partner]?.[player] || 0);
      });
      score += partnershipScore / remainingPlayers.length;
    }

    return {
      id: player,
      score,
    };
  });

  console.log("\nScores for each potential opponent:");
  opponentScores.forEach((p) => {
    console.log(`${p.id}: score ${p.score}`);
  });

  // Sort by score (lower is better)
  opponentScores.sort((a, b) => a.score - b.score);

  // Get all players with minimum score
  const minScore = opponentScores[0]?.score || 0;
  const candidates = opponentScores.filter((p) => p.score === minScore);

  console.log(
    `\nCandidates who played least against team (${minScore}):`,
    candidates.map((c) => c.id)
  );

  // Randomly select one from the candidates
  const selected = candidates[Math.floor(Math.random() * candidates.length)];

  return {
    opponent: selected.id,
    remaining: availablePlayers.filter((p) => p !== selected.id),
  };
}

export const generateAmericanoMatches = (
  players: string[],
  courtsToUse: Court[],
  partnerships: { [key: string]: { [key: string]: number } },
  round: number,
  sittingOutCounts: { [key: string]: number },
  setSittingOutCounts: (counts: { [key: string]: number }) => void,
  setSittingOutPlayers: (players: string[]) => void,
  maxRounds: number | null,
  finalPairingPattern: number[],
  scores: Scores
): Match[] => {
  const allUnits = [...players];
  console.log("\n=== Starting Round", round, "===");
  console.log(
    "Current Partnership State:",
    JSON.stringify(partnerships, null, 2)
  );
  console.log("Players:", players);

  // Initialize partnerships if needed
  players.forEach((p1) => {
    if (!partnerships[p1]) {
      partnerships[p1] = {};
    }
    players.forEach((p2) => {
      if (p1 !== p2 && partnerships[p1][p2] === undefined) {
        partnerships[p1][p2] = 0;
      }
    });
  });

  const maxMatchesByPlayers = Math.floor(players.length / 4);
  const numMatches = Math.min(maxMatchesByPlayers, courtsToUse.length);

  // Handle sitting out players and get active players
  const maxActive = Math.min(players.length, courtsToUse.length * 4);
  const activeCount = Math.floor(maxActive / 4) * 4;
  const numSittingOut = players.length - activeCount;

  const playersBySitouts = [...players].sort(
    (a, b) => (sittingOutCounts[a] || 0) - (sittingOutCounts[b] || 0)
  );

  const sittingOut = playersBySitouts.slice(0, numSittingOut);
  setSittingOutPlayers(sittingOut);

  if (sittingOut.length > 0) {
    console.log("\nPlayers sitting out:", sittingOut);
  }

  // Update sitout counts
  const newSittingOutCounts = { ...sittingOutCounts };
  sittingOut.forEach((player) => {
    newSittingOutCounts[player] = (newSittingOutCounts[player] || 0) + 1;
  });
  setSittingOutCounts(newSittingOutCounts);

  // Get active players
  let availablePlayers = playersBySitouts
    .filter((p) => !sittingOut.includes(p))
    .sort(
      (a, b) =>
        Object.values(partnerships[a]).reduce((sum, val) => sum + val, 0) -
        Object.values(partnerships[b]).reduce((sum, val) => sum + val, 0)
    );

  console.log("\nActive players for this round:", availablePlayers);

  const newMatches: Match[] = [];

  // Handle final round separately
  if (maxRounds !== null && round === maxRounds) {
    console.log("\n=== Final Round ===");
    availablePlayers = allUnits.sort(
      (a, b) => scores[b].points - scores[a].points
    );
    console.log("Players sorted by score:", availablePlayers);
    for (let i = 0; i < numMatches; i++) {
      const pattern = finalPairingPattern;
      const startIdx = i * 4;
      const players = availablePlayers.slice(startIdx, startIdx + 4);
      if (players.length === 4) {
        console.log(`\nCreating final round match ${i + 1}:`, {
          team1: [players[pattern[0]], players[pattern[1]]],
          team2: [players[pattern[2]], players[pattern[3]]],
        });
        newMatches.push({
          team1: [players[pattern[0]], players[pattern[1]]],
          team2: [players[pattern[2]], players[pattern[3]]],
          team1Score: 0,
          team2Score: 0,
          isScoreSubmitted: false,
        });
      }
    }
  } else {
    const usedPartnerships = new Set<string>();

    while (
      availablePlayers.length >= 4 &&
      newMatches.length < courtsToUse.length
    ) {
      console.log(`\n=== Creating Match ${newMatches.length + 1} ===`);
      console.log("Available players:", availablePlayers);

      // Randomly select first player
      const randomIndex = Math.floor(Math.random() * availablePlayers.length);
      const player1 = availablePlayers[randomIndex];
      console.log("\nRandomly selected first player:", player1);

      // Find partner for first player, passing all remaining players for look-ahead
      const { partner: player2, remaining: afterPlayer2 } = findLeastPlayedWith(
        player1,
        availablePlayers,
        usedPartnerships,
        partnerships,
        availablePlayers.filter((p) => p !== player1)
      );

      // Find first opponent
      const team1 = [player1, player2];
      const { opponent: opponent1, remaining: afterOpponent1 } =
        findOpponentForTeam(team1, afterPlayer2, partnerships);

      // Find partner for first opponent
      const { partner: opponent2 } = findLeastPlayedWith(
        opponent1,
        afterOpponent1,
        usedPartnerships,
        partnerships
      );

      console.log("\nFinal match pairing:", {
        team1: [player1, player2],
        team2: [opponent1, opponent2],
      });

      usedPartnerships.add(`${player1}-${player2}`);
      usedPartnerships.add(`${player2}-${player1}`);
      usedPartnerships.add(`${opponent1}-${opponent2}`);
      usedPartnerships.add(`${opponent2}-${opponent1}`);

      newMatches.push({
        team1: [player1, player2],
        team2: [opponent1, opponent2],
        team1Score: 0,
        team2Score: 0,
        isScoreSubmitted: false,
      });

      availablePlayers = availablePlayers.filter(
        (p) => ![player1, player2, opponent1, opponent2].includes(p)
      );
    }
  }

  return newMatches;
};

export const updatePartnerships = (
  currentPartnerships: { [key: string]: { [key: string]: number } },
  matches: Match[]
): { [key: string]: { [key: string]: number } } => {
  console.log("\n=== Updating Partnerships ===");
  console.log(
    "Current partnerships:",
    JSON.stringify(currentPartnerships, null, 2)
  );
  console.log("Matches to process:", matches);

  const updatedPartnerships = { ...currentPartnerships };

  matches.forEach((match, index) => {
    console.log(`\nProcessing match ${index + 1}:`);
    const [player1, player2] = match.team1;
    const [opponent1, opponent2] = match.team2;

    // Initialize if needed
    [player1, player2, opponent1, opponent2].forEach((p1) => {
      if (!updatedPartnerships[p1]) {
        updatedPartnerships[p1] = {};
      }
      [player1, player2, opponent1, opponent2].forEach((p2) => {
        if (p1 !== p2 && updatedPartnerships[p1][p2] === undefined) {
          updatedPartnerships[p1][p2] = 0;
        }
      });
    });

    // Update partnership counts
    updatedPartnerships[player1][player2] =
      (updatedPartnerships[player1][player2] || 0) + 1;
    updatedPartnerships[player2][player1] =
      (updatedPartnerships[player2][player1] || 0) + 1;
    updatedPartnerships[opponent1][opponent2] =
      (updatedPartnerships[opponent1][opponent2] || 0) + 1;
    updatedPartnerships[opponent2][opponent1] =
      (updatedPartnerships[opponent2][opponent1] || 0) + 1;

    console.log("Updated partnerships after match:", {
      [`${player1}-${player2}`]: updatedPartnerships[player1][player2],
      [`${opponent1}-${opponent2}`]: updatedPartnerships[opponent1][opponent2],
    });
  });

  console.log(
    "\nFinal partnership state:",
    JSON.stringify(updatedPartnerships, null, 2)
  );
  return updatedPartnerships;
};
