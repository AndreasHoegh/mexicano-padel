import type { TournamentState } from "./types";
import type { EditingScores } from "./types";

export function generateTournamentId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function saveTournamentState(state: TournamentState) {
  if (!state.id) return null;

  const stateWithId = { ...state };
  localStorage.setItem(`tournament_${state.id}`, JSON.stringify(stateWithId));
  return state.id;
}

export function loadTournamentState(id: string): TournamentState | null {
  if (!id) return null;

  const savedState = localStorage.getItem(`tournament_${id}`);
  return savedState ? JSON.parse(savedState) : null;
}

export function getTournamentShareUrl(
  id: string,
  scores: EditingScores
): string {
  if (!id) return window.location.href;

  const url = new URL(window.location.href);
  url.searchParams.set("tournamentId", id);
  url.searchParams.set("scores", JSON.stringify(scores));
  return url.toString();
}

export function saveScores(id: string, scores: EditingScores) {
  localStorage.setItem(`tournament_${id}_scores`, JSON.stringify(scores));
}

export function loadScores(id: string): EditingScores | null {
  const savedScores = localStorage.getItem(`tournament_${id}_scores`);
  return savedScores ? JSON.parse(savedScores) : null;
}
