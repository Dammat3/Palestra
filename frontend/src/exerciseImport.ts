/**
 * Import esercizi dal database online free-exercise-db (GitHub),
 * con mappatura automatica nel formato usato dall'app (italiano).
 * Richiede connessione internet; usato solo nella schermata "Aggiungi Esercizio".
 */
import { CustomExercise } from "./storage";

const DB_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";
const IMAGE_BASE =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

type RemoteExercise = {
  id: string;
  name: string;
  category: string;
  level: string;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  images: string[];
};

export type RemoteSearchResult = {
  remoteId: string;
  name: string;
  muscleGroupGuess: string;
  equipmentGuess: string;
};

const MUSCLE_MAP: Record<string, string | null> = {
  chest: "Petto",
  lats: "Dorso",
  "middle back": "Dorso",
  "lower back": "Dorso",
  traps: "Dorso",
  quadriceps: "Gambe",
  hamstrings: "Gambe",
  adductors: "Gambe",
  abductors: "Gambe",
  glutes: "Glutei",
  shoulders: "Spalle",
  biceps: "Bicipiti",
  triceps: "Tricipiti",
  forearms: "Tricipiti",
  abdominals: "Addome",
  calves: "Polpacci",
  neck: null,
};

const LEVEL_MAP: Record<string, string> = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  expert: "Avanzato",
};

const EQUIPMENT_MAP: Record<string, string> = {
  "body only": "Corpo libero",
  dumbbell: "Manubri",
  barbell: "Bilanciere",
  kettlebells: "Kettlebell",
  machine: "Macchina",
  cable: "Cavi",
  bands: "Elastici",
  "medicine ball": "Palla medica",
  "exercise ball": "Fitball",
  "foam roll": "Foam roller",
  "e-z curl bar": "Bilanciere EZ",
  other: "Altro",
};

const CATEGORY_MAP: Record<string, string> = {
  strength: "Forza",
  plyometrics: "Pliometria",
  powerlifting: "Forza",
  "olympic weightlifting": "Forza",
  strongman: "Forza",
  cardio: "Cardio",
  stretching: "Mobilità",
};

let cache: RemoteExercise[] | null = null;

async function loadDatabase(): Promise<RemoteExercise[]> {
  if (cache) return cache;
  const res = await fetch(DB_URL);
  if (!res.ok) throw new Error("Impossibile contattare il database online");
  const data = (await res.json()) as RemoteExercise[];
  cache = data;
  return data;
}

function mapMuscle(primaryMuscles: string[]): string | null {
  for (const m of primaryMuscles) {
    const mapped = MUSCLE_MAP[m];
    if (mapped) return mapped;
  }
  return null;
}

/**
 * Cerca esercizi nel database online per nome.
 * Restituisce solo esercizi mappabili su un gruppo muscolare valido dell'app.
 */
export async function searchRemoteExercises(query: string): Promise<RemoteSearchResult[]> {
  const db = await loadDatabase();
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return db
    .filter((e) => e.name.toLowerCase().includes(q))
    .map((e) => {
      const muscleGroup = mapMuscle(e.primaryMuscles);
      if (!muscleGroup) return null;
      return {
        remoteId: e.id,
        name: e.name,
        muscleGroupGuess: muscleGroup,
        equipmentGuess: EQUIPMENT_MAP[e.equipment || "other"] || "Altro",
      };
    })
    .filter((x): x is RemoteSearchResult => x !== null)
    .slice(0, 30);
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Recupera il dettaglio di un esercizio remoto per id e lo traduce
 * nel formato CustomExercise dell'app, pronto per essere salvato.
 * NOTA: le istruzioni vengono mantenute in inglese (sono testo libero,
 * tradurle parola per parola via codice darebbe risultati di scarsa qualità);
 * l'utente può modificarle a mano dopo l'import se lo desidera.
 */
export async function importRemoteExercise(remoteId: string): Promise<CustomExercise> {
  const db = await loadDatabase();
  const e = db.find((x) => x.id === remoteId);
  if (!e) throw new Error("Esercizio non trovato nel database online");

  const muscleGroup = mapMuscle(e.primaryMuscles);
  if (!muscleGroup) {
    throw new Error("Questo esercizio non è mappabile su un gruppo muscolare supportato");
  }

  const secondaryMuscles = e.secondaryMuscles
    .map((m) => MUSCLE_MAP[m])
    .filter((m): m is string => !!m && m !== muscleGroup);

  return {
    id: `remote-${slugify(e.name)}`,
    name: e.name,
    category: CATEGORY_MAP[e.category] || "Forza",
    muscle_group: muscleGroup,
    secondary_muscles: [...new Set(secondaryMuscles)],
    equipment: EQUIPMENT_MAP[e.equipment || "other"] || "Altro",
    level: LEVEL_MAP[e.level] || "Intermedio",
    instructions: e.instructions,
    tips: "Esercizio importato dal database online. Puoi modificare istruzioni e consigli a tuo piacimento.",
    images: e.images.map((img) => IMAGE_BASE + img),
    source: "free-exercise-db",
    createdAt: new Date().toISOString(),
  };
}
