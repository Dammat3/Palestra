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
  weightLog: "wt_weight_log_v1",
  measurementsLog: "wt_measurements_log_v1",
  progressPhotos: "wt_progress_photos_v1",
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
  bodyweight?: boolean; // true = no weight field, PR tracked by reps only
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

export type WeightEntry = {
  id: string;
  date: string; // ISO date (YYYY-MM-DD), one entry per day
  weightKg: number;
};

export type MeasurementEntry = {
  id: string;
  date: string; // ISO date (YYYY-MM-DD), one entry per day
  bicipite?: number;
  avambraccio?: number;
  petto?: number;
  addome?: number;
  glutei?: number;
  coscia?: number;
  polpaccio?: number;
};

export type ProgressPhoto = {
  id: string;
  date: string; // ISO date (YYYY-MM-DD), multiple photos per day allowed
  uri: string; // local file path on device
  note?: string;
  createdAt: string; // full ISO timestamp, for ordering photos within the same day
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
export async function reorderWorkouts(fromIndex: number, toIndex: number): Promise<Workout[]> {
  const list = await getWorkouts();
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= list.length ||
    toIndex >= list.length ||
    fromIndex === toIndex
  ) {
    return list;
  }
  const [moved] = list.splice(fromIndex, 1);
  list.splice(toIndex, 0, moved);
  await writeJSON(K.workouts, list);
  return list;
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

// ------- Progress photos (multiple photos per day allowed) -------
export async function getProgressPhotos(): Promise<ProgressPhoto[]> {
  const list = await readJSON<ProgressPhoto[]>(K.progressPhotos, []);
  return list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
export async function saveProgressPhoto(photo: ProgressPhoto): Promise<void> {
  const list = await readJSON<ProgressPhoto[]>(K.progressPhotos, []);
  list.push(photo);
  await writeJSON(K.progressPhotos, list);
}
export async function deleteProgressPhoto(id: string): Promise<void> {
  const list = await readJSON<ProgressPhoto[]>(K.progressPhotos, []);
  const photo = list.find((x) => x.id === id);
  if (photo) {
    try {
      const FileSystem = await import("expo-file-system/legacy");
      const info = await FileSystem.getInfoAsync(photo.uri);
      if (info.exists) {
        await FileSystem.deleteAsync(photo.uri, { idempotent: true });
      }
    } catch {
      // If the physical file can't be deleted, still remove the entry
      // from the log so the gallery doesn't show a broken reference.
    }
  }
  await writeJSON(
    K.progressPhotos,
    list.filter((x) => x.id !== id),
  );
}

// ------- Weight log (body weight tracking, one entry per day) -------
export async function getWeightLog(): Promise<WeightEntry[]> {
  const list = await readJSON<WeightEntry[]>(K.weightLog, []);
  return list.sort((a, b) => a.date.localeCompare(b.date));
}
export async function saveWeightEntry(date: string, weightKg: number): Promise<void> {
  const list = await readJSON<WeightEntry[]>(K.weightLog, []);
  const existingIdx = list.findIndex((x) => x.date === date);
  if (existingIdx >= 0) {
    list[existingIdx] = { ...list[existingIdx], weightKg };
  } else {
    list.push({ id: uid(), date, weightKg });
  }
  await writeJSON(K.weightLog, list);
}
export async function deleteWeightEntry(id: string): Promise<void> {
  const list = await readJSON<WeightEntry[]>(K.weightLog, []);
  await writeJSON(
    K.weightLog,
    list.filter((x) => x.id !== id),
  );
}

// ------- Body measurements log (one entry per day, all fields optional) -------
export async function getMeasurementsLog(): Promise<MeasurementEntry[]> {
  const list = await readJSON<MeasurementEntry[]>(K.measurementsLog, []);
  return list.sort((a, b) => a.date.localeCompare(b.date));
}
export async function saveMeasurementEntry(
  date: string,
  values: Omit<MeasurementEntry, "id" | "date">,
): Promise<void> {
  const list = await readJSON<MeasurementEntry[]>(K.measurementsLog, []);
  const existingIdx = list.findIndex((x) => x.date === date);
  if (existingIdx >= 0) {
    // Merge: only overwrite fields that were actually provided (not undefined)
    const merged = { ...list[existingIdx] };
    for (const key of Object.keys(values) as (keyof typeof values)[]) {
      if (values[key] !== undefined) merged[key] = values[key];
    }
    list[existingIdx] = merged;
  } else {
    list.push({ id: uid(), date, ...values });
  }
  await writeJSON(K.measurementsLog, list);
}
export async function deleteMeasurementEntry(id: string): Promise<void> {
  const list = await readJSON<MeasurementEntry[]>(K.measurementsLog, []);
  await writeJSON(
    K.measurementsLog,
    list.filter((x) => x.id !== id),
  );
}

// ------- Backup / Restore (export & import full app data) -------
export type BackupPayload = {
  appName: "Palestra";
  backupVersion: 1;
  exportedAt: string;
  data: {
    workouts: Workout[];
    history: HistoryEntry[];
    prefs: Prefs | null;
    customExercises: CustomExercise[];
    weightLog?: WeightEntry[];
    measurementsLog?: MeasurementEntry[];
  };
};

export async function exportAllData(): Promise<BackupPayload> {
  const [workouts, history, prefs, customExercises, weightLog, measurementsLog] = await Promise.all([
    readJSON<Workout[]>(K.workouts, []),
    readJSON<HistoryEntry[]>(K.history, []),
    readJSON<Prefs | null>(K.prefs, null),
    readJSON<CustomExercise[]>(K.customExercises, []),
    readJSON<WeightEntry[]>(K.weightLog, []),
    readJSON<MeasurementEntry[]>(K.measurementsLog, []),
  ]);
  return {
    appName: "Palestra",
    backupVersion: 1,
    exportedAt: new Date().toISOString(),
    data: { workouts, history, prefs, customExercises, weightLog, measurementsLog },
  };
}

/**
 * Restores data from a backup. By default merges with existing data
 * (workouts/history/customExercises/weightLog/measurementsLog are deduplicated
 * by id, existing entries win on conflict); pass replace=true to wipe and
 * overwrite instead.
 */
export async function importAllData(
  backup: BackupPayload,
  options: { replace?: boolean } = {},
): Promise<{
  workouts: number;
  history: number;
  customExercises: number;
  weightLog: number;
  measurementsLog: number;
}> {
  if (backup?.appName !== "Palestra" || !backup?.data) {
    throw new Error("File di backup non valido.");
  }
  const { workouts, history, prefs, customExercises, weightLog, measurementsLog } = backup.data;

  if (options.replace) {
    await writeJSON(K.workouts, workouts || []);
    await writeJSON(K.history, history || []);
    await writeJSON(K.customExercises, customExercises || []);
    await writeJSON(K.weightLog, weightLog || []);
    await writeJSON(K.measurementsLog, measurementsLog || []);
    if (prefs) await writeJSON(K.prefs, prefs);
  } else {
    const existingWorkouts = await readJSON<Workout[]>(K.workouts, []);
    const existingHistory = await readJSON<HistoryEntry[]>(K.history, []);
    const existingCustom = await readJSON<CustomExercise[]>(K.customExercises, []);
    const existingWeight = await readJSON<WeightEntry[]>(K.weightLog, []);
    const existingMeasurements = await readJSON<MeasurementEntry[]>(K.measurementsLog, []);

    const mergedWorkouts = dedupeById(existingWorkouts, workouts || []);
    const mergedHistory = dedupeById(existingHistory, history || []);
    const mergedCustom = dedupeById(existingCustom, customExercises || []);
    const mergedWeight = dedupeById(existingWeight, weightLog || []);
    const mergedMeasurements = dedupeById(existingMeasurements, measurementsLog || []);

    await writeJSON(K.workouts, mergedWorkouts);
    await writeJSON(K.history, mergedHistory);
    await writeJSON(K.customExercises, mergedCustom);
    await writeJSON(K.weightLog, mergedWeight);
    await writeJSON(K.measurementsLog, mergedMeasurements);
  }

  return {
    workouts: (workouts || []).length,
    history: (history || []).length,
    customExercises: (customExercises || []).length,
    weightLog: (weightLog || []).length,
    measurementsLog: (measurementsLog || []).length,
  };
}

function dedupeById<T extends { id: string }>(existing: T[], incoming: T[]): T[] {
  const byId = new Map(existing.map((x) => [x.id, x]));
  for (const item of incoming) {
    if (!byId.has(item.id)) byId.set(item.id, item);
  }
  return Array.from(byId.values());
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
