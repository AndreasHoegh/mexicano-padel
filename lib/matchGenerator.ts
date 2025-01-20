import { Match, Scores, Court } from "../lib/types";

export const shuffle = (players: string[]): string[] => {
  const shuffledPlayers = [...players];
  for (let i = shuffledPlayers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledPlayers[i], shuffledPlayers[j]] = [
      shuffledPlayers[j],
      shuffledPlayers[i],
    ];
  }
  return shuffledPlayers;
};

const getMatchPattern = (roundIndex: number): number[] => {
  const patterns = [
    [0, 2, 1, 3],
    [0, 3, 1, 2],
    [0, 1, 2, 3],
  ];
  return patterns[roundIndex % 3];
};

export const generateMatches = (
  players: string[],
  courtsToUse: Court[],
  round: number,
  scores: Scores,
  mode: "individual" | "team",
  sittingOutCounts: { [key: string]: number },
  setSittingOutCounts: (counts: { [key: string]: number }) => void,
  setSittingOutPlayers: (players: string[]) => void,
  maxRounds: number | null,
  finalPairingPattern: number[]
): Match[] => {
  const allUnits = [...players];
  const unitsPerMatch = mode === "team" ? 2 : 4;

  const sortedUnits =
    round === 1
      ? shuffle(allUnits)
      : allUnits.sort((a, b) => scores[b].points - scores[a].points);

  const maxMatchesByPlayers = Math.floor(sortedUnits.length / unitsPerMatch);
  const numMatches = Math.min(maxMatchesByPlayers, courtsToUse.length);
  const numPlayersNeeded = numMatches * unitsPerMatch;
  const numSittingOut = sortedUnits.length - numPlayersNeeded;

  let sittingOut: string[] = [];
  if (numSittingOut > 0) {
    const playersBySitouts = [...allUnits].sort(
      (a, b) => (sittingOutCounts[a] || 0) - (sittingOutCounts[b] || 0)
    );

    sittingOut = playersBySitouts.slice(0, numSittingOut);

    const newSittingOutCounts = { ...sittingOutCounts };
    sittingOut.forEach((unit) => {
      newSittingOutCounts[unit] = (newSittingOutCounts[unit] || 0) + 1;
    });
    setSittingOutCounts(newSittingOutCounts);
  }

  setSittingOutPlayers(sittingOut);

  const activeUnits = sortedUnits.filter((unit) => !sittingOut.includes(unit));

  const newMatches: Match[] = [];
  for (let i = 0; i < numMatches; i++) {
    if (mode === "team") {
      newMatches.push({
        team1: [activeUnits[i * 2]],
        team2: [activeUnits[i * 2 + 1]],
        team1Score: 0,
        team2Score: 0,
        isScoreSubmitted: false,
      });
    } else {
      const pattern =
        maxRounds !== null && round === maxRounds
          ? finalPairingPattern
          : getMatchPattern((round - 1) % 3);
      const startIdx = i * 4;
      const players = activeUnits.slice(startIdx, startIdx + 4);

      newMatches.push({
        team1: [players[pattern[0]], players[pattern[1]]],
        team2: [players[pattern[2]], players[pattern[3]]],
        team1Score: 0,
        team2Score: 0,
        isScoreSubmitted: false,
      });
    }
  }
  return newMatches;
};

export const generateAmericanoMatchesTeamMode = (
  players: string[],
  courtsToUse: Court[],
  partnerships: { [key: string]: { [key: string]: number } },
  round: number,
  sittingOutCounts: { [key: string]: number },
  setSittingOutCounts: (counts: { [key: string]: number }) => void,
  setSittingOutPlayers: (players: string[]) => void,
  mode: "individual" | "team"
): Match[] => {
  console.log("=== Starting Round", round, "===");
  console.log("Current Partnership State:", partnerships);

  const shuffleAmericano = <T>(array: T[]): T[] => {
    return array.sort(() => Math.random() - 0.5);
  };

  function findLeastPlayedWith(
    unit: string,
    availableUnits: string[],
    usedPartnerships: Set<string>
  ): { partner: string; remaining: string[] } {
    const playedWith = availableUnits
      .filter((u) => u !== unit && !usedPartnerships.has(`${unit}-${u}`))
      .map((u) => {
        const directPartnerships = partnerships[unit]?.[u] || 0;
        const totalPartnerships = Object.values(partnerships[u] || {}).reduce(
          (sum, count) => sum + count,
          0
        );

        return {
          id: u,
          directPartnerships,
          totalPartnerships,
        };
      });

    playedWith.sort((a, b) => {
      if (a.directPartnerships !== b.directPartnerships) {
        return a.directPartnerships - b.directPartnerships;
      }
      return a.totalPartnerships - b.totalPartnerships;
    });

    console.log(`Partner selection for ${unit}:`, {
      availableUnits,
      playedWith,
      selectedPartner: playedWith[0],
    });

    const partner = playedWith[0]?.id;
    if (!partner) {
      throw new Error(`No partner found for ${unit}`);
    }

    return {
      partner,
      remaining: availableUnits.filter((u) => u !== partner && u !== unit),
    };
  }

  // Initialize partnerships if needed
  if (!partnerships[players[0]]) {
    console.log("Initializing partnerships");
    players.forEach((u1) => {
      partnerships[u1] = {};
      players.forEach((u2) => {
        if (u1 !== u2) {
          partnerships[u1][u2] = 0;
        }
      });
    });
  }

  // Handle sitting out players and get active units
  const allUnits = [...players];
  const unitsPerMatch = mode === "team" ? 1 : 2;

  const maxActive = Math.min(
    allUnits.length,
    courtsToUse.length * unitsPerMatch * 2
  );
  const activeCount =
    Math.floor(maxActive / (unitsPerMatch * 2)) * (unitsPerMatch * 2);
  const numSittingOut = allUnits.length - activeCount;

  const unitsBySitouts = shuffleAmericano([...players]).sort(
    (a, b) => (sittingOutCounts[a] || 0) - (sittingOutCounts[b] || 0)
  );

  const sittingOut = unitsBySitouts.slice(0, numSittingOut);
  setSittingOutPlayers(sittingOut);

  // Update sitout counts
  const newSittingOutCounts = { ...sittingOutCounts };
  sittingOut.forEach((unit) => {
    newSittingOutCounts[unit] = (newSittingOutCounts[unit] || 0) + 1;
  });
  setSittingOutCounts(newSittingOutCounts);

  // Get active units
  let availableUnits = shuffleAmericano(
    unitsBySitouts.filter((u) => !sittingOut.includes(u))
  );

  const newMatches: Match[] = [];
  const usedPartnerships = new Set<string>();

  while (availableUnits.length >= 2 && newMatches.length < courtsToUse.length) {
    console.log(`\n=== Creating Match ${newMatches.length + 1} ===`);
    console.log("Available units:", availableUnits);

    const unit1 = availableUnits[0];
    console.log("Selected first unit:", unit1);

    // Find partner for unit1
    const { partner: unit2, remaining: afterUnit2 } = findLeastPlayedWith(
      unit1,
      availableUnits,
      usedPartnerships
    );

    console.log(`Selected partner for ${unit1}: ${unit2}`);

    // Create match between unit1 and unit2
    console.log("Final match pairing:", {
      team1: [unit1],
      team2: [unit2],
      partnerships: {
        team1: partnerships[unit1]?.[unit2] || 0,
        team2: partnerships[unit2]?.[unit1] || 0,
      },
    });

    // Track partnerships after units are selected
    usedPartnerships.add(`${unit1}-${unit2}`);
    usedPartnerships.add(`${unit2}-${unit1}`);

    // Create match
    newMatches.push({
      team1: [unit1],
      team2: [unit2],
      team1Score: 0,
      team2Score: 0,
      isScoreSubmitted: false,
    });

    // Update partnerships
    partnerships[unit1][unit2] = (partnerships[unit1][unit2] || 0) + 1;
    partnerships[unit2][unit1] = (partnerships[unit2][unit1] || 0) + 1;

    // Remove used units from available pool
    availableUnits = afterUnit2;
    console.log("Updated partnerships for this match:", {
      [`${unit1}-${unit2}`]: partnerships[unit1][unit2],
      [`${unit2}-${unit1}`]: partnerships[unit2][unit1],
    });
  }

  return newMatches;
};

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
  console.log("ALL UNITS:", allUnits);
  console.log("=== Starting Round", round, "===");
  console.log("Current Partnership State:", partnerships);
  console.log("PLAYERS:", players);

  const maxMatchesByPlayers = Math.floor(players.length / 4);
  const numMatches = Math.min(maxMatchesByPlayers, courtsToUse.length);

  const shuffledPlayers = shuffle(players);

  function findLeastPlayedWith(
    player: string,
    availablePlayers: string[],
    usedPartnerships: Set<string>
  ): { partner: string; remaining: string[] } {
    const playedWith = availablePlayers
      .filter((p) => p !== player && !usedPartnerships.has(`${player}-${p}`))
      .map((p) => {
        const totalPartnerships = Object.values(partnerships[p] || {}).reduce(
          (sum, count) => sum + count,
          0
        );

        const score = (partnerships[player]?.[p] || 0) * 10 + totalPartnerships;

        return {
          id: p,
          directPartnerships: partnerships[player]?.[p] || 0,
          totalPartnerships,
          score,
        };
      });

    playedWith.sort((a, b) => {
      if (a.directPartnerships !== b.directPartnerships) {
        return a.directPartnerships - b.directPartnerships;
      }
      return a.totalPartnerships - b.totalPartnerships;
    });

    console.log(`Selecting partner for ${player}:`);
    console.log("Available players:", availablePlayers);
    console.log("Candidate partners with scores:", playedWith);
    console.log("Selected partner:", playedWith[0]);

    const partner = playedWith[0]?.id;
    if (!partner) {
      throw new Error(`No partner found for ${player}`);
    }

    return {
      partner,
      remaining: availablePlayers.filter((p) => p !== partner && p !== player),
    };
  }

  // Initialize partnerships if needed
  if (!partnerships[shuffledPlayers[0]]) {
    console.log("Initializing partnerships");
    shuffledPlayers.forEach((p1) => {
      partnerships[p1] = {};
      shuffledPlayers.forEach((p2) => {
        if (p1 !== p2) {
          partnerships[p1][p2] = 0;
        }
      });
    });
  }

  // Handle sitting out players and get active players
  const maxActive = Math.min(shuffledPlayers.length, courtsToUse.length * 4);
  const activeCount = Math.floor(maxActive / 4) * 4;
  const numSittingOut = shuffledPlayers.length - activeCount;

  const playersBySitouts = [...shuffledPlayers].sort(
    (a, b) => (sittingOutCounts[a] || 0) - (sittingOutCounts[b] || 0)
  );

  const sittingOut = playersBySitouts.slice(0, numSittingOut);
  setSittingOutPlayers(sittingOut);

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

  const newMatches: Match[] = [];

  // Handle final round separately
  if (maxRounds !== null && round === maxRounds) {
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
      console.log(
        "Available players at start of this match:",
        availablePlayers
      );

      const player1 = availablePlayers[0];
      console.log("Selected first player:", player1);

      const { partner: player2, remaining: afterPlayer2 } = findLeastPlayedWith(
        player1,
        availablePlayers,
        usedPartnerships
      );
      console.log(`Partner selected for ${player1}: ${player2}`);

      const potentialOpponents = afterPlayer2;

      const opponentPairs = [];
      for (let i = 0; i < potentialOpponents.length; i++) {
        for (let j = i + 1; j < potentialOpponents.length; j++) {
          const player3 = potentialOpponents[i];
          const player4 = potentialOpponents[j];

          const teamScore =
            (partnerships[player3]?.[player4] || 0) +
            (partnerships[player4]?.[player3] || 0);

          opponentPairs.push({
            players: [player3, player4],
            score: teamScore,
          });
        }
      }

      opponentPairs.sort((a, b) => a.score - b.score);

      const selectedOpponents = opponentPairs[0].players;
      const [player3, player4] = selectedOpponents;
      console.log(`Opponent pair selected: ${player3}, ${player4}`);

      console.log("Final match pairing:", {
        team1: [player1, player2],
        team2: [player3, player4],
      });

      usedPartnerships.add(`${player1}-${player2}`);
      usedPartnerships.add(`${player2}-${player1}`);
      usedPartnerships.add(`${player3}-${player4}`);
      usedPartnerships.add(`${player4}-${player3}`);

      newMatches.push({
        team1: [player1, player2],
        team2: [player3, player4],
        team1Score: 0,
        team2Score: 0,
        isScoreSubmitted: false,
      });

      partnerships[player1][player2] =
        (partnerships[player1][player2] || 0) + 1;
      partnerships[player2][player1] =
        (partnerships[player2][player1] || 0) + 1;
      partnerships[player3][player4] =
        (partnerships[player3][player4] || 0) + 1;
      partnerships[player4][player3] =
        (partnerships[player4][player3] || 0) + 1;

      availablePlayers = availablePlayers.filter(
        (p) => ![player1, player2, player3, player4].includes(p)
      );
    }
  }
  return newMatches;
};
