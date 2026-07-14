/**
 * Personal record (PR) detection, shared between the live workout screen
 * (instant notification when a set beats a previous best) and the
 * post-workout summary screen (recap of all PRs hit in the session).
 *
 * For weighted exercises: "best" = estimated 1RM via Epley (weight * (1 + reps/30))
 * For bodyweight exercises: "best" = max reps achieved in a single set
 */
import { HistoryEntry, SessionExerciseLog } from "./storage";

export function estimate1RM(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  return weight * (1 + reps / 30);
}

/**
 * Builds two baseline maps from history:
 * - `weighted`: exerciseId -> best estimated 1RM (for weighted exercises)
 * - `bodyweight`: exerciseId -> best reps in a single set (for bodyweight exercises)
 *
 * Which map an exercise falls into is determined at check time by whether
 * the set has weight > 0 or not.
 */
export type PRBaseline = {
  weighted: Record<string, number>;  // exerciseId -> best 1RM
  bodyweight: Record<string, number>; // exerciseId -> best reps
};

export function buildPRBaseline(history: HistoryEntry[]): PRBaseline {
  const weighted: Record<string, number> = {};
  const bodyweight: Record<string, number> = {};

  for (const h of history) {
    for (const ex of h.exercises) {
      for (const s of ex.sets) {
        if (!s.done || s.reps <= 0) continue;

        if (s.weight > 0) {
          // Weighted set: track 1RM
          const est = estimate1RM(s.weight, s.reps);
          if (!weighted[ex.exerciseId] || weighted[ex.exerciseId] < est) {
            weighted[ex.exerciseId] = est;
          }
        } else {
          // Bodyweight set: track max reps
          if (!bodyweight[ex.exerciseId] || bodyweight[ex.exerciseId] < s.reps) {
            bodyweight[ex.exerciseId] = s.reps;
          }
        }
      }
    }
  }

  return { weighted, bodyweight };
}

/**
 * Checks whether a completed set beats the stored baseline.
 * Returns the new best value if it's a PR, otherwise null.
 *
 * For weighted sets: returns new estimated 1RM.
 * For bodyweight sets: returns new max reps.
 *
 * Does NOT mutate the baseline — callers should update it after confirming a PR
 * so intra-session comparisons also work correctly.
 */
export function checkSetForPR(
  exerciseId: string,
  weight: number,
  reps: number,
  baseline: PRBaseline,
): { value: number; isBodyweight: boolean } | null {
  if (reps <= 0) return null;

  if (weight > 0) {
    // Weighted: compare 1RM
    const est = estimate1RM(weight, reps);
    const prev = baseline.weighted[exerciseId] || 0;
    if (est > prev) return { value: est, isBodyweight: false };
  } else {
    // Bodyweight: compare reps
    const prev = baseline.bodyweight[exerciseId] || 0;
    if (reps > prev) return { value: reps, isBodyweight: true };
  }

  return null;
}
