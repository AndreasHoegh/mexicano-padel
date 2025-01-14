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
  mode: "individual" | "team";
  teamNames?: string[];
}

export interface PlayerScore {
  points: number;
  wins: number;
  team?: string;
  teamName?: string;
}

export interface Scores {
  [key: string]: PlayerScore;
}
