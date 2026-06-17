/**
 * Local exercise database - no backend required.
 * Database is bundled with the app for 100% offline operation.
 */
import data from "./exercises.json";

export type ExerciseListItem = {
  id: string;
  name: string;
  category: string;
  muscle_group: string;
  equipment: string;
  level: string;
  image: string | null;
  images?: string[];
};

export type ExerciseDetail = ExerciseListItem & {
  secondary_muscles: string[];
  instructions: string[];
  tips: string;
  images: string[];
};

export type MuscleGroup = { id: string; name: string };

type RawExercise = {
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
};

const ALL: RawExercise[] = (data as { exercises: RawExercise[] }).exercises;
const GROUPS: MuscleGroup[] = (data as { groups: MuscleGroup[] }).groups;

function toListItem(e: RawExercise): ExerciseListItem {
  return {
    id: e.id,
    name: e.name,
    category: e.category,
    muscle_group: e.muscle_group,
    equipment: e.equipment,
    level: e.level,
    image: e.images[0] || null,
    images: e.images,
  };
}

export async function fetchExercises(params?: {
  q?: string;
  muscle?: string;
}): Promise<ExerciseListItem[]> {
  let results = ALL;
  if (params?.muscle && params.muscle !== "all") {
    results = results.filter((e) => e.muscle_group === params.muscle);
  }
  if (params?.q) {
    const q = params.q.toLowerCase();
    results = results.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.muscle_group.toLowerCase().includes(q) ||
        e.equipment.toLowerCase().includes(q),
    );
  }
  return results.map(toListItem);
}

export async function fetchGroups(): Promise<MuscleGroup[]> {
  return GROUPS;
}

export async function fetchExerciseDetail(id: string): Promise<ExerciseDetail> {
  const e = ALL.find((x) => x.id === id);
  if (!e) throw new Error("Esercizio non trovato");
  return {
    ...toListItem(e),
    secondary_muscles: e.secondary_muscles,
    instructions: e.instructions,
    tips: e.tips,
    images: e.images,
  };
}
