// padel-americano/services/tournamentService.ts
import type { Tournament } from "../lib/types";

// Fetch the list of tournaments for the current user
export async function getTournamentHistory(
  token: string
): Promise<Tournament[]> {
  const response = await fetch(
    "https://jwtauthdotnet920250211104511.azurewebsites.net/api/tournament/by-user",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error("Error fetching tournament history");
  }
  const data = await response.json();
  return data;
}

// Create a new tournament record (e.g., when a tournament completes)
export async function createTournament(
  token: string,

  tournamentName: string,

  scoresJson: string
): Promise<Tournament> {
  const response = await fetch(
    "https://jwtauthdotnet920250211104511.azurewebsites.net/api/tournament",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        TournamentName: tournamentName,
        ScoresJson: scoresJson,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Error creating tournament");
  }

  const data = await response.json();

  return data;
}
