# Palestra IT - PRD

## Overview
Simple, modern, minimal iPhone gym app in Italian. 100% free, no auth, fully local on device.

## Core features
- **Schede di Allenamento**: create/edit/delete workout routines locally. Each exercise has target sets, reps, weight, rest seconds. Reorder exercises.
- **Libreria Esercizi**: browse 47 curated Italian exercises with thumbnails and detailed views (instructions + images from free-exercise-db open-source repo).
- **Sessione Attiva**: track set-by-set during a workout; tap each set to mark done, log actual reps/weight; integrated rest-timer overlay (per-set rest + per-exercise rest) with haptics, +/-15s, skip.
- **Progressi**: weekly volume bar chart, key stats (total workouts, volume, sets, minutes), top exercises by volume (30d), estimated 1RM (Epley) ranking.
- **Storico**: list of completed sessions, expand to see per-exercise details, delete entries.

## Architecture
- **Frontend**: Expo Router (file-based routing) with 4 bottom tabs (Schede / Esercizi / Progressi / Storico). Stack routes for workout edit, active session, exercise detail, picker modal.
- **Backend**: FastAPI exposing read-only `/api/exercises*` endpoints over a static Italian database (`/app/backend/exercises_data.py`).
- **Storage**: AsyncStorage (workouts/history/prefs). No remote sync.

## Design
- Dark-first utility theme. Brand color: muted terracotta (#D9654B). Surface: near-black. Tab bar with active accent color.
- Touch targets ≥ 44pt, decimal-pad keyboards for numeric input, haptics on key actions.

## Out of scope (v1)
- Auth/sync, push notifications, video playback, social features, plate calculator.
