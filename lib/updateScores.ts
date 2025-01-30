import { Match, EditingScores, Scores } from "./types";

export const calculateUpdatedScores = (
  scores: Scores,
  matches: Match[],
  editingScores: EditingScores,
  sittingOutPlayers: string[],
  round: number
): Scores => {
  const newScores = { ...scores };

  sittingOutPlayers.forEach((player) => {
    newScores[player].pointsPerRound[round - 1] = "sitout";
  });

  matches.forEach((match, index) => {
    // Skip matches with "TBD"
    if (
      match.team1[0].trim().toLowerCase() === "tbd" ||
      match.team2[0].trim().toLowerCase() === "tbd"
    ) {
      console.warn(`Skipping match ${match.matchNumber} due to "TBD" team.`);
      return;
    }

    const team1 = match.team1[0];
    const team2 = match.team2[0];
    const score1 =
      editingScores[match.isKnockout ? `knockout-${index}` : index]?.team1 || 0;
    const score2 =
      editingScores[match.isKnockout ? `knockout-${index}` : index]?.team2 || 0;

    // Initialize scores if they don't exist
    if (!newScores[team1]) {
      newScores[team1] = {
        points: 0,
        wins: 0,
        matchesPlayed: 0,
        pointsPerRound: [],
      };
    }
    if (!newScores[team2]) {
      newScores[team2] = {
        points: 0,
        wins: 0,
        matchesPlayed: 0,
        pointsPerRound: [],
      };
    }

    // Update matches played
    newScores[team1].matchesPlayed += 1;
    newScores[team2].matchesPlayed += 1;

    // Update points and wins
    if (score1 > score2) {
      newScores[team1].wins += 1;
      newScores[team1].points += 3;
    } else if (score2 > score1) {
      newScores[team2].wins += 1;
      newScores[team2].points += 3;
    } else {
      // Handle draw if applicable
      newScores[team1].points += 1;
      newScores[team2].points += 1;
    }

    // Update points per round at specific index
    newScores[team1].pointsPerRound[round - 1] = score1;
    newScores[team2].pointsPerRound[round - 1] = score2;
  });

  return newScores;
};
