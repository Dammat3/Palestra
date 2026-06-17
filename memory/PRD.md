# Palestra IT - PRD

## Overview
Simple, modern, minimal iPhone gym app in Italian. 100% free, no auth, fully local on device.

## Phase 1 (MVP) features
- **Schede di Allenamento**: create/edit/delete workout routines with reorderable exercises (target sets, reps, weight, per-set rest, per-exercise rest).
- **Libreria Esercizi**: 102 curated Italian exercises with images from free-exercise-db open-source repo, search + muscle filter chips, exercise detail with instructions + tips.
- **Sessione Attiva**: set-by-set tracking, rest-timer overlay (haptic + countdown, +/-15s, skip).
- **Progressi**: weekly volume chart, stats cards, top exercises (30d), 1RM Epley estimate.
- **Storico**: list with per-session detail breakdown.

## Phase 2 additions
- **Database esteso**: 47 → 102 esercizi (Petto +8, Dorso +8, Gambe +9, Spalle +4, Bicipiti +5, Tricipiti +5, Addome +7, Polpacci +2, Funzionale/Cardio +5, Avambracci +1) with verified open-source image slugs.
- **Animazioni 2-frame**: `AnimatedExerciseImage` alternates between images[0] and images[1] every ~700ms — used in exercise detail hero, workout edit thumbnails, active workout exercise thumbnails. Library list stays on static thumbnail (perf).
- **Plate Calculator** (`/picker/calculator`): standard kg plates [25,20,15,10,5,2.5,1.25,0.5], 4 bar options (20/15/10/7kg), greedy breakdown per side, IPF-colored disc rendering and bar visualization.
- **Preset Schede** (`/picker/presets`): 3 built-in templates — Push/Pull/Legs (3 days), Full Body 3x (3 days), Upper/Lower (4 days). Import creates the workouts as editable copies.
- **Superset mode**: `supersetGroup` field on `ExerciseEntry`. Toggle in workout edit links current exercise to previous. Active session shows a SUPERSET badge and only triggers rest after the LAST exercise in the group completes its set (so the user alternates exercises in a round before resting).
- **CSV Export Storico**: button on history tab uses `expo-sharing` + `expo-file-system` to share a CSV with per-set rows (Data, Scheda, Esercizio, Set, Rip, Peso, Volume, Durata).

## Architecture
- Frontend: Expo Router file-based routing — 4 tabs + modal routes for picker/exercises, picker/presets, picker/calculator. Stack route for workout edit and active session and exercise detail.
- Backend: FastAPI, read-only `/api/exercises*` endpoints on a static Italian DB in `/app/backend/exercises_data.py`. Images proxied from yuhonas/free-exercise-db on GitHub.
- Storage: AsyncStorage for workouts, history, prefs. Settings keys defined in `/app/frontend/src/storage.ts`.

## Out of scope (still)
- iOS Widget / Live Activities (require native build + EAS; not testable in Expo Go).
- Authentication & cloud sync.
- Native push notifications.
- Animated true GIFs (using 2-frame loop instead — free-exercise-db only ships static jpgs).
