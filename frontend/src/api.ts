/**
 * API client for the exercises database (read-only).
 */
const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

export type ExerciseListItem = {
  id: string;
  name: string;
  category: string;
  muscle_group: string;
  equipment: string;
  level: string;
  image: string | null;
};

export type ExerciseDetail = ExerciseListItem & {
  secondary_muscles: string[];
  instructions: string[];
  tips: string;
  images: string[];
};

export type MuscleGroup = { id: string; name: string };

export async function fetchExercises(params?: {
  q?: string;
  muscle?: string;
}): Promise<ExerciseListItem[]> {
  const u = new URL(`${BASE}/api/exercises`);
  if (params?.q) u.searchParams.set("q", params.q);
  if (params?.muscle && params.muscle !== "all")
    u.searchParams.set("muscle", params.muscle);
  const res = await fetch(u.toString());
  if (!res.ok) throw new Error("Errore caricamento esercizi");
  return res.json();
}

export async function fetchGroups(): Promise<MuscleGroup[]> {
  const res = await fetch(`${BASE}/api/exercises/groups`);
  if (!res.ok) throw new Error("Errore caricamento gruppi");
  return res.json();
}

export async function fetchExerciseDetail(id: string): Promise<ExerciseDetail> {
  const res = await fetch(`${BASE}/api/exercises/${id}`);
  if (!res.ok) throw new Error("Esercizio non trovato");
  return res.json();
}
