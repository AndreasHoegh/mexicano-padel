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
  pointSystem: "pointsToPlay" | "pointsToWin" | "TimePlay";
  maxRounds: number;
  courts: Court[];
  mode: "individual" | "team";
  teamNames?: string[];
  format: "mexicano" | "americano" | "groups";
  teamsPerGroup?: number;
  teamsAdvancing?: number;
}

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
  round?: number;
  isKnockout?: boolean;
  knockoutRound?: string;
  matchNumber?: number;
  team1Name?: string;
  team2Name?: string;
  group?: number;
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

export type PointSystem = "pointsToPlay" | "pointsToWin" | "TimePlay";

export interface TournamentState {
  id: string;
  names: string[];
  matches: Match[];
  scores: Scores;
  round: number;
  tournamentName: string;
  sittingOutPlayers: string[];
  sittingOutCounts: { [key: string]: number };
  pointsPerMatch: number;
  isFinished: boolean;
  maxRounds: number | null;
  isPaused: boolean;
  pointSystem: "pointsToPlay" | "pointsToWin" | "TimePlay";
  courts: Court[];
  mode: "individual" | "team";
  numberOfPlayers: number;
  isTournamentNameSet: boolean;
  arePlayerNamesSet: boolean;
  tournamentHistory: Array<{
    matches: Match[];
    scores: Scores;
    round: number;
    sittingOutPlayers: string[];
  }>;
  partnerships: { [key: string]: { [key: string]: number } };
  editingScores: EditingScores;
}
