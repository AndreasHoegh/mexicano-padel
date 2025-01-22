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
  finalRoundPattern: number[];
  playerNames: string[];
  points: number;
  pointSystem: "pointsToPlay" | "pointsToWin";
  maxRounds: number | null;
  courts: Court[];
  mode: "individual" | "team";
  teamNames?: string[];
}

export interface PlayerScore {
  points: number;
  wins: number;
  matchesPlayed: number;
  pointsPerRound: (number | "sitout")[];
}
/* 
export interface Scores {
  [key: string]: PlayerScore;
} */

export interface Scores {
  [key: string]: {
    points: number;
    wins: number;
    matchesPlayed: number;
    pointsPerRound: (number | "sitout")[];
    team?: string;
    teamName?: string;
  };
}

export interface Match {
  team1: string[];
  team2: string[];
  team1Score: number;
  team2Score: number;
  isScoreSubmitted: boolean;
  team1Name?: string;
  team2Name?: string;
}

export interface EditingScores {
  [key: number]: {
    team1: number;
    team2: number;
  };
}

export interface PlayerHistory {
  [key: string]: {
    partneredWith: { [key: string]: number };
    playedAgainst: { [key: string]: number };
    gamesPlayed: number;
    lastSatOutRound: number;
  };
}
