/**
 * Local exercise database - no backend required.
 * Database is bundled with the app for 100% offline operation,
 * merged at read-time with any custom exercises the user has imported/added.
 */
import data from "./exercises.json";
import { CustomExercise, getCustomExercises } from "./storage";

export type ExerciseListItem = {
  id: string;
  name: string;
  category: string;
  muscle_group: string;
  equipment: string;
  level: string;
  image: string | null;
  images?: string[];
  isCustom?: boolean;
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

const BUNDLED: RawExercise[] = (data as { exercises: RawExercise[] }).exercises;
const GROUPS: MuscleGroup[] = (data as { groups: MuscleGroup[] }).groups;

function toListItem(e: RawExercise, isCustom = false): ExerciseListItem {
  return {
    id: e.id,
    name: e.name,
    category: e.category,
    muscle_group: e.muscle_group,
    equipment: e.equipment,
    level: e.level,
    image: e.images[0] || null,
    images: e.images,
    isCustom,
  };
}

async function getAllExercises(): Promise<{ list: RawExercise[]; customIds: Set<string> }> {
  const custom: CustomExercise[] = await getCustomExercises();
  const customIds = new Set(custom.map((c) => c.id));
  // Custom exercises take precedence in case of id collisions (e.g. a re-import/edit)
  const bundledFiltered = BUNDLED.filter((e) => !customIds.has(e.id));
  return { list: [...custom, ...bundledFiltered], customIds };
}

export async function fetchExercises(params?: {
  q?: string;
  muscle?: string;
}): Promise<ExerciseListItem[]> {
  const { list, customIds } = await getAllExercises();
  let results = list;
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
  return results.map((e) => toListItem(e, customIds.has(e.id)));
}

export async function fetchGroups(): Promise<MuscleGroup[]> {
  return GROUPS;
}

export async function fetchExerciseDetail(id: string): Promise<ExerciseDetail> {
  const { list, customIds } = await getAllExercises();
  const e = list.find((x) => x.id === id);
  if (!e) throw new Error("Esercizio non trovato");
  return {
    ...toListItem(e, customIds.has(e.id)),
    secondary_muscles: e.secondary_muscles,
    instructions: e.instructions,
    tips: e.tips,
    images: e.images,
  };
}
