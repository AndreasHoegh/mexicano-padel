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
