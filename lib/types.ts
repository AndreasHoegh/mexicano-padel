export interface FormData {
  tournamentName: string;
  "Number of players": string;
  [key: string]: string;
}

export interface TournamentSettings {
  playerNames: string[];
  pointsPerMatch: number;
}
