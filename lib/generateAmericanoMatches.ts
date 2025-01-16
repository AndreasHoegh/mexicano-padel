interface Match {
  team1: string[];
  team2: string[];
  team1Score: number;
  team2Score: number;
  isScoreSubmitted: boolean;
}

interface AmericanoResult {
  matches: Match[];
  sittingOut: string[];
  playerHistory: PlayerHistory;
}

interface PlayerHistory {
  [key: string]: {
    partneredWith: { [key: string]: number };
    playedAgainst: { [key: string]: number };
    gamesPlayed: number;
    lastSatOutRound: number;
  };
}

export default function generateAmericanoMatches(
  players: string[],
  numCourts: number,
  round: number,
  playerHistory: PlayerHistory = {},
  sittingOutCounts: { [key: string]: number } = {}
): AmericanoResult {
  // Initialize player history if not exists
  if (Object.keys(playerHistory).length === 0) {
    players.forEach((p1) => {
      playerHistory[p1] = {
        partneredWith: {},
        playedAgainst: {},
        gamesPlayed: 0,
        lastSatOutRound: 0,
      };
      players.forEach((p2) => {
        if (p1 !== p2) {
          playerHistory[p1].partneredWith[p2] = 0;
        }
      });
    });
  }

  // Calculate max active players and required sitouts
  const maxActive = Math.min(players.length, numCourts * 4);
  const activeCount = Math.floor(maxActive / 4) * 4;
  const sitoutCount = players.length - activeCount;

  // Sort players by the last round they sat out and then by total sit-outs
  const sortedPlayers = [...players].sort((a, b) => {
    const lastSatOutDiff =
      playerHistory[a].lastSatOutRound - playerHistory[b].lastSatOutRound;
    if (lastSatOutDiff !== 0) return lastSatOutDiff;
    return (sittingOutCounts[a] || 0) - (sittingOutCounts[b] || 0);
  });

  // Select players to sit out
  const sittingOut = sortedPlayers.slice(0, sitoutCount);

  // Update sitting out counts and last sat out round
  sittingOut.forEach((player) => {
    sittingOutCounts[player] = (sittingOutCounts[player] || 0) + 1;
    playerHistory[player].lastSatOutRound = round;
  });

  // Select active players
  const activePlayers = sortedPlayers.filter(
    (player) => !sittingOut.includes(player)
  );

  // Generate pairings for active players
  const pairings = generatePairings(activePlayers, playerHistory);

  // Create matches from pairings
  const matches: Match[] = [];
  for (let i = 0; i < pairings.length; i += 2) {
    if (i + 1 < pairings.length && matches.length < numCourts) {
      const team1 = pairings[i];
      const team2 = pairings[i + 1];

      matches.push({
        team1,
        team2,
        team1Score: 0,
        team2Score: 0,
        isScoreSubmitted: false,
      });

      // Update player history
      [...team1, ...team2].forEach((player) => {
        playerHistory[player].gamesPlayed++;
        const partner = team1.includes(player)
          ? team1.find((p) => p !== player)!
          : team2.find((p) => p !== player)!;
        playerHistory[player].partneredWith[partner] =
          (playerHistory[player].partneredWith[partner] || 0) + 1;
      });
    }
  }

  return {
    matches,
    sittingOut,
    playerHistory,
  };
}

function generatePairings(
  players: string[],
  playerHistory: PlayerHistory
): string[][] {
  const pairings: string[][] = [];
  const availablePlayers = [...players];

  while (availablePlayers.length >= 2) {
    const player1 = availablePlayers.shift()!;
    let bestPartner = availablePlayers[0];
    let minPartnerships =
      playerHistory[player1].partneredWith[bestPartner] || 0;

    for (let i = 1; i < availablePlayers.length; i++) {
      const player2 = availablePlayers[i];
      const partnerships = playerHistory[player1].partneredWith[player2] || 0;
      if (partnerships < minPartnerships) {
        minPartnerships = partnerships;
        bestPartner = player2;
      }
    }

    availablePlayers.splice(availablePlayers.indexOf(bestPartner), 1);
    pairings.push([player1, bestPartner]);
  }

  return pairings;
}
