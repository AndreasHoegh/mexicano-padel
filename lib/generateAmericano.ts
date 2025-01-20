import { Match, Scores, Court } from "../lib/types";
import { shuffle } from "./matchGenerator";

function findLeastPlayedWith(
  player: string,
  availablePlayers: string[],
  usedPartnerships: Set<string>,
  partnerships: { [key: string]: { [key: string]: number } }
): { partner: string; remaining: string[] } {
  console.log(`\nFinding partner for ${player}`);
  console.log("Available players:", availablePlayers);
  console.log("Used partnerships:", Array.from(usedPartnerships));

  const playedWith = availablePlayers
    .filter((p) => p !== player && !usedPartnerships.has(`${player}-${p}`))
    .map((p) => ({
      id: p,
      playedWith: partnerships[player]?.[p] || 0,
    }));

  console.log("\nPartnership history for each available player:");
  playedWith.forEach((p) => {
    console.log(`${p.id}: played with ${player} ${p.playedWith} times`);
  });

  // Sort by times played with
  playedWith.sort((a, b) => a.playedWith - b.playedWith);

  // Get all players who have played the minimum number of times with this player
  const minPlayedWith = playedWith[0]?.playedWith || 0;
  const candidates = playedWith.filter((p) => p.playedWith === minPlayedWith);

  console.log(
    `\nCandidates who played least with ${player} (${minPlayedWith} times):`,
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
): string {
  console.log(`\nFinding opponent for team: ${team.join(", ")}`);
  console.log("Available players:", availablePlayers);

  // Calculate total times played against for each available player
  const playedAgainst = availablePlayers.map((player) => {
    let totalPlayedAgainst = 0;
    for (const teamPlayer of team) {
      const timesPlayed =
        (partnerships[teamPlayer]?.[player] || 0) +
        (partnerships[player]?.[teamPlayer] || 0);
      console.log(
        `${player} has played against ${teamPlayer}: ${timesPlayed} times`
      );
      totalPlayedAgainst += timesPlayed;
    }
    return {
      id: player,
      playedAgainst: totalPlayedAgainst,
    };
  });

  console.log("\nTotal times played against the team:");
  playedAgainst.forEach((p) => {
    console.log(`${p.id}: played against team ${p.playedAgainst} times`);
  });

  // Sort by times played against
  playedAgainst.sort((a, b) => a.playedAgainst - b.playedAgainst);

  // Get all players who have played against the team the minimum number of times
  const minPlayedAgainst = playedAgainst[0]?.playedAgainst || 0;
  const candidates = playedAgainst.filter(
    (p) => p.playedAgainst === minPlayedAgainst
  );

  console.log(
    `\nCandidates who played least against team (${minPlayedAgainst} times):`,
    candidates.map((c) => c.id)
  );

  // Randomly select one from the candidates
  const selected = candidates[Math.floor(Math.random() * candidates.length)];
  console.log(`Selected opponent: ${selected?.id}`);
  return selected?.id;
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
  console.log("PLAYERS:", players);

  // Initialize partnerships if needed
  const newPartnerships = { ...partnerships };
  players.forEach((p1) => {
    if (!newPartnerships[p1]) {
      newPartnerships[p1] = {};
    }
    players.forEach((p2) => {
      if (p1 !== p2 && newPartnerships[p1][p2] === undefined) {
        newPartnerships[p1][p2] = 0;
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
        Object.values(newPartnerships[a]).reduce((sum, val) => sum + val, 0) -
        Object.values(newPartnerships[b]).reduce((sum, val) => sum + val, 0)
    );

  console.log("\nActive players for this round:", availablePlayers);

  const newMatches: Match[] = [];

  // Handle final round separately
  if (maxRounds !== null && round === maxRounds) {
    console.log("\n=== Final Round ===");
    availablePlayers = allUnits.sort(
      (a, b) => scores[b].points - scores[a].points
    );
    for (let i = 0; i < numMatches; i++) {
      const pattern = finalPairingPattern;
      const startIdx = i * 4;
      const players = availablePlayers.slice(startIdx, startIdx + 4);
      if (players.length === 4) {
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

      // Find partner for first player
      const { partner: player2, remaining: afterPlayer2 } = findLeastPlayedWith(
        player1,
        availablePlayers,
        usedPartnerships,
        newPartnerships
      );

      // Find first opponent
      const team1 = [player1, player2];
      const opponent1 = findOpponentForTeam(
        team1,
        afterPlayer2,
        newPartnerships
      );

      // Find partner for first opponent
      const remainingForOpponent = afterPlayer2.filter((p) => p !== opponent1);
      const { partner: opponent2 } = findLeastPlayedWith(
        opponent1,
        remainingForOpponent,
        usedPartnerships,
        newPartnerships
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

      // Update partnership counts
      newPartnerships[player1][player2] =
        (newPartnerships[player1][player2] || 0) + 1;
      newPartnerships[player2][player1] =
        (newPartnerships[player2][player1] || 0) + 1;
      newPartnerships[opponent1][opponent2] =
        (newPartnerships[opponent1][opponent2] || 0) + 1;
      newPartnerships[opponent2][opponent1] =
        (newPartnerships[opponent2][opponent1] || 0) + 1;

      availablePlayers = availablePlayers.filter(
        (p) => ![player1, player2, opponent1, opponent2].includes(p)
      );
    }
  }

  // Return both the matches and the updated partnerships
  return newMatches;
};

export const updatePartnerships = (
  currentPartnerships: { [key: string]: { [key: string]: number } },
  matches: Match[]
): { [key: string]: { [key: string]: number } } => {
  const updatedPartnerships = { ...currentPartnerships };

  matches.forEach((match) => {
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
  });

  return updatedPartnerships;
};
