/**
 * Preset workouts (built-in templates).
 */
import { Workout, ExerciseEntry, uid } from "@/src/storage";

type PresetExercise = {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  image?: string;
  targetSets: number;
  targetReps: number;
  restSeconds: number;
};

export type Preset = {
  id: string;
  name: string;
  description: string;
  days: { name: string; exercises: PresetExercise[] }[];
};

const REST_COMPOUND = 120;
const REST_ISO = 75;

// IDs MUST match those in /app/backend/exercises_data.py
const E = (id: string, name: string, muscle: string, sets: number, reps: number, rest: number): PresetExercise => ({
  exerciseId: id,
  exerciseName: name,
  muscleGroup: muscle,
  targetSets: sets,
  targetReps: reps,
  restSeconds: rest,
});

export const PRESETS: Preset[] = [
  {
    id: "ppl",
    name: "Push / Pull / Legs",
    description: "Split classico 3 giorni: spinta, trazione, gambe. Ideale per intermedi.",
    days: [
      {
        name: "Push (Petto/Spalle/Tricipiti)",
        exercises: [
          E("panca-piana-bilanciere", "Panca Piana con Bilanciere", "Petto", 4, 8, REST_COMPOUND),
          E("panca-inclinata-manubri", "Panca Inclinata con Manubri", "Petto", 3, 10, REST_COMPOUND),
          E("shoulder-press-manubri", "Shoulder Press con Manubri", "Spalle", 3, 10, REST_COMPOUND),
          E("alzate-laterali", "Alzate Laterali", "Spalle", 4, 12, REST_ISO),
          E("pushdown-cavi", "Pushdown ai Cavi", "Tricipiti", 3, 12, REST_ISO),
          E("french-press", "French Press con Bilanciere EZ", "Tricipiti", 3, 10, REST_ISO),
        ],
      },
      {
        name: "Pull (Dorso/Bicipiti)",
        exercises: [
          E("trazioni-sbarra", "Trazioni alla Sbarra", "Dorso", 4, 8, REST_COMPOUND),
          E("rematore-bilanciere", "Rematore con Bilanciere", "Dorso", 4, 8, REST_COMPOUND),
          E("lat-machine", "Lat Machine Avanti", "Dorso", 3, 10, REST_ISO),
          E("face-pull", "Face Pull", "Dorso", 3, 15, REST_ISO),
          E("curl-bilanciere", "Curl con Bilanciere", "Bicipiti", 3, 10, REST_ISO),
          E("hammer-curl", "Hammer Curl", "Bicipiti", 3, 12, REST_ISO),
        ],
      },
      {
        name: "Legs (Gambe/Glutei)",
        exercises: [
          E("squat-bilanciere", "Squat con Bilanciere", "Gambe", 4, 8, REST_COMPOUND),
          E("stacco-rumeno", "Stacco Rumeno", "Gambe", 3, 10, REST_COMPOUND),
          E("pressa-gambe", "Pressa per Gambe", "Gambe", 3, 12, REST_COMPOUND),
          E("leg-curl", "Leg Curl Sdraiato", "Gambe", 3, 12, REST_ISO),
          E("leg-extension", "Leg Extension", "Gambe", 3, 12, REST_ISO),
          E("calf-in-piedi", "Calf in Piedi", "Polpacci", 4, 15, REST_ISO),
        ],
      },
    ],
  },
  {
    id: "full-body-3x",
    name: "Full Body 3x",
    description: "3 allenamenti settimanali full body. Ideale per principianti.",
    days: [
      {
        name: "Full Body A",
        exercises: [
          E("squat-bilanciere", "Squat con Bilanciere", "Gambe", 3, 8, REST_COMPOUND),
          E("panca-piana-bilanciere", "Panca Piana con Bilanciere", "Petto", 3, 8, REST_COMPOUND),
          E("rematore-bilanciere", "Rematore con Bilanciere", "Dorso", 3, 10, REST_COMPOUND),
          E("military-press", "Military Press in Piedi", "Spalle", 3, 8, REST_COMPOUND),
          E("plank", "Plank", "Addome", 3, 60, REST_ISO),
        ],
      },
      {
        name: "Full Body B",
        exercises: [
          E("stacco-da-terra", "Stacco da Terra", "Dorso", 3, 5, REST_COMPOUND),
          E("trazioni-sbarra", "Trazioni alla Sbarra", "Dorso", 3, 8, REST_COMPOUND),
          E("affondi-manubri", "Affondi con Manubri", "Gambe", 3, 10, REST_COMPOUND),
          E("dip-parallele", "Dip alle Parallele", "Petto", 3, 8, REST_COMPOUND),
          E("crunch", "Crunch a Terra", "Addome", 3, 15, REST_ISO),
        ],
      },
      {
        name: "Full Body C",
        exercises: [
          E("front-squat", "Front Squat", "Gambe", 3, 8, REST_COMPOUND),
          E("panca-inclinata-manubri", "Panca Inclinata con Manubri", "Petto", 3, 10, REST_COMPOUND),
          E("lat-machine", "Lat Machine Avanti", "Dorso", 3, 10, REST_ISO),
          E("shoulder-press-manubri", "Shoulder Press con Manubri", "Spalle", 3, 10, REST_COMPOUND),
          E("curl-bilanciere", "Curl con Bilanciere", "Bicipiti", 3, 10, REST_ISO),
          E("pushdown-cavi", "Pushdown ai Cavi", "Tricipiti", 3, 12, REST_ISO),
        ],
      },
    ],
  },
  {
    id: "upper-lower",
    name: "Upper / Lower",
    description: "Split 4 giorni: superiore + inferiore alternati.",
    days: [
      {
        name: "Upper A",
        exercises: [
          E("panca-piana-bilanciere", "Panca Piana con Bilanciere", "Petto", 4, 8, REST_COMPOUND),
          E("rematore-bilanciere", "Rematore con Bilanciere", "Dorso", 4, 8, REST_COMPOUND),
          E("shoulder-press-manubri", "Shoulder Press con Manubri", "Spalle", 3, 10, REST_COMPOUND),
          E("trazioni-sbarra", "Trazioni alla Sbarra", "Dorso", 3, 8, REST_COMPOUND),
          E("curl-bilanciere", "Curl con Bilanciere", "Bicipiti", 3, 10, REST_ISO),
          E("french-press", "French Press con Bilanciere EZ", "Tricipiti", 3, 10, REST_ISO),
        ],
      },
      {
        name: "Lower A",
        exercises: [
          E("squat-bilanciere", "Squat con Bilanciere", "Gambe", 4, 8, REST_COMPOUND),
          E("stacco-rumeno", "Stacco Rumeno", "Gambe", 3, 10, REST_COMPOUND),
          E("affondi-manubri", "Affondi con Manubri", "Gambe", 3, 10, REST_COMPOUND),
          E("leg-curl", "Leg Curl Sdraiato", "Gambe", 3, 12, REST_ISO),
          E("calf-in-piedi", "Calf in Piedi", "Polpacci", 4, 15, REST_ISO),
        ],
      },
      {
        name: "Upper B",
        exercises: [
          E("panca-inclinata-bilanciere", "Panca Inclinata con Bilanciere", "Petto", 4, 8, REST_COMPOUND),
          E("lat-machine", "Lat Machine Avanti", "Dorso", 4, 10, REST_ISO),
          E("alzate-laterali", "Alzate Laterali", "Spalle", 4, 12, REST_ISO),
          E("face-pull", "Face Pull", "Dorso", 3, 15, REST_ISO),
          E("hammer-curl", "Hammer Curl", "Bicipiti", 3, 12, REST_ISO),
          E("pushdown-cavi", "Pushdown ai Cavi", "Tricipiti", 3, 12, REST_ISO),
        ],
      },
      {
        name: "Lower B",
        exercises: [
          E("front-squat", "Front Squat", "Gambe", 4, 8, REST_COMPOUND),
          E("hip-thrust", "Hip Thrust", "Glutei", 3, 10, REST_COMPOUND),
          E("pressa-gambe", "Pressa per Gambe", "Gambe", 3, 12, REST_COMPOUND),
          E("leg-extension", "Leg Extension", "Gambe", 3, 12, REST_ISO),
          E("calf-seduto", "Calf Seduto", "Polpacci", 4, 15, REST_ISO),
        ],
      },
    ],
  },
];

export function presetToWorkouts(p: Preset): Workout[] {
  return p.days.map((d) => ({
    id: uid(),
    name: `${p.name} · ${d.name}`,
    createdAt: new Date().toISOString(),
    exerciseRestSeconds: REST_COMPOUND,
    exercises: d.exercises.map<ExerciseEntry>((e) => ({
      exerciseId: e.exerciseId,
      exerciseName: e.exerciseName,
      muscleGroup: e.muscleGroup,
      image: e.image || null,
      targetSets: e.targetSets,
      targetReps: e.targetReps,
      targetWeight: 0,
      restSeconds: e.restSeconds,
    })),
  }));
}
