/**
 * Local-only data persistence layer for workouts, sessions, history.
 * All data is stored on the device via AsyncStorage.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const K = {
  workouts: "wt_workouts_v1",
  history: "wt_history_v1",
  prefs: "wt_prefs_v1",
  customExercises: "wt_custom_exercises_v1",
};

export type ExerciseEntry = {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  image?: string | null;
  images?: string[]; // animation frames
  targetSets: number;
  targetReps: number;
  targetWeight: number; // kg
  restSeconds: number;
  supersetGroup?: string | null;
};

export type Workout = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  exercises: ExerciseEntry[];
  exerciseRestSeconds: number; // rest between exercises
};

export type SetLog = {
  reps: number;
  weight: number;
  done: boolean;
};

export type SessionExerciseLog = {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  sets: SetLog[];
};

export type HistoryEntry = {
  id: string;
  workoutId: string;
  workoutName: string;
  startedAt: string;
  finishedAt: string;
  durationSec: number;
  totalVolume: number; // kg lifted
  totalSets: number;
  exercises: SessionExerciseLog[];
};

export type CustomExercise = {
  id: string;
  name: string;
  category: string;
  muscle_group: string;
  secondary_muscles: string[];
  equipment: string;
  level: string;
  instructions: string[];
  tips: string;
  images: string[];
  source: "free-exercise-db" | "manual";
  createdAt: string;
};

export type Prefs = {
  defaultRestSetSec: number;
  defaultRestExerciseSec: number;
  defaultSets: number;
  defaultReps: number;
};

const DEFAULT_PREFS: Prefs = {
  defaultRestSetSec: 90,
  defaultRestExerciseSec: 120,
  defaultSets: 4,
  defaultReps: 10,
};

async function readJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJSON<T>(key: string, val: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(val));
}

// ------- Workouts -------
export async function getWorkouts(): Promise<Workout[]> {
  return readJSON<Workout[]>(K.workouts, []);
}
export async function saveWorkout(w: Workout): Promise<void> {
  const list = await getWorkouts();
  const idx = list.findIndex((x) => x.id === w.id);
  if (idx >= 0) list[idx] = w;
  else list.unshift(w);
  await writeJSON(K.workouts, list);
}
export async function deleteWorkout(id: string): Promise<void> {
  const list = await getWorkouts();
  await writeJSON(
    K.workouts,
    list.filter((x) => x.id !== id),
  );
}
export async function getWorkout(id: string): Promise<Workout | null> {
  const list = await getWorkouts();
  return list.find((x) => x.id === id) || null;
}

// ------- History -------
export async function getHistory(): Promise<HistoryEntry[]> {
  const list = await readJSON<HistoryEntry[]>(K.history, []);
  return list.sort((a, b) => (a.finishedAt < b.finishedAt ? 1 : -1));
}
export async function saveHistory(h: HistoryEntry): Promise<void> {
  const list = await readJSON<HistoryEntry[]>(K.history, []);
  list.unshift(h);
  await writeJSON(K.history, list);
}
export async function deleteHistory(id: string): Promise<void> {
  const list = await getHistory();
  await writeJSON(
    K.history,
    list.filter((x) => x.id !== id),
  );
}

// ------- Prefs -------
export async function getPrefs(): Promise<Prefs> {
  return readJSON<Prefs>(K.prefs, DEFAULT_PREFS);
}
export async function savePrefs(p: Prefs): Promise<void> {
  await writeJSON(K.prefs, p);
}

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ------- Custom Exercises (user-added, merged with bundled database) -------
export async function getCustomExercises(): Promise<CustomExercise[]> {
  return readJSON<CustomExercise[]>(K.customExercises, []);
}
export async function saveCustomExercise(e: CustomExercise): Promise<void> {
  const list = await getCustomExercises();
  // Replace if an exercise with the same id already exists (e.g. re-import/edit)
  const filtered = list.filter((x) => x.id !== e.id);
  filtered.unshift(e);
  await writeJSON(K.customExercises, filtered);
}
export async function deleteCustomExercise(id: string): Promise<void> {
  const list = await getCustomExercises();
  await writeJSON(
    K.customExercises,
    list.filter((x) => x.id !== id),
  );
}
export async function isCustomExerciseIdTaken(id: string): Promise<boolean> {
  const list = await getCustomExercises();
  return list.some((x) => x.id === id);
}
