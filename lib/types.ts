export interface FormData {
  tournamentName: string;
  "Number of players": string;
  [key: string]: string;
}

export interface Court {
  id: number;
  name: string;
}

export interface TournamentSettings {
  playerNames: string[];
  pointsPerMatch: number;
  maxRounds: number | null;
  courts: Court[];
}
