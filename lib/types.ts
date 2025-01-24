export interface FormData {
  tournamentName: string;
  "Number of players": string;
  [key: string]: string;
}

export interface Court {
  id: number;
  name: string;
}

export interface KnockoutMatch {
  team1: string[];
  team2: string[];
  team1Score: number;
  team2Score: number;
  isScoreSubmitted: boolean;
  round: number;
  isKnockout: boolean;
  knockoutRound: string;
  matchNumber: number;
}

export interface TournamentSettings {
  finalRoundPattern: number[];
  playerNames: string[];
  points: number;
  pointSystem: "pointsToPlay" | "pointsToWin" | "TimePlay";
  maxRounds: number;
  courts: Court[];
  mode: "individual" | "team";
  teamNames?: string[];
  format: "mexicano" | "americano" | "groups";
  teamsPerGroup?: number;
  teamsAdvancing?: number;
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
  group?: number;
  round?: number;
  isKnockout?: boolean;
  knockoutRound?: string;
  matchNumber?: number;
}

export interface EditingScores {
  [key: string | number]: {
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

export interface GroupStanding {
  teamName: string;
  points: number;
  matchesPlayed: number;
  wins: number;
}

export type PointSystem = "pointsToPlay" | "pointsToWin" | "TimePlay";
