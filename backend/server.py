from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from typing import List, Optional

from exercises_data import EXERCISES, MUSCLE_GROUPS

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

app = FastAPI(title="Palestra IT API")
api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"message": "Palestra IT API", "exercises_count": len(EXERCISES)}


@api_router.get("/exercises")
async def list_exercises(
    q: Optional[str] = None,
    muscle: Optional[str] = None,
    equipment: Optional[str] = None,
):
    results = EXERCISES
    if muscle and muscle != "all":
        results = [e for e in results if e["muscle_group"] == muscle]
    if equipment:
        results = [e for e in results if e["equipment"].lower() == equipment.lower()]
    if q:
        ql = q.lower()
        results = [
            e
            for e in results
            if ql in e["name"].lower()
            or ql in e["muscle_group"].lower()
            or ql in e["equipment"].lower()
        ]
    # Light payload for list (omit instructions)
    return [
        {
            "id": e["id"],
            "name": e["name"],
            "category": e["category"],
            "muscle_group": e["muscle_group"],
            "equipment": e["equipment"],
            "level": e["level"],
            "image": e["images"][0] if e["images"] else None,
        }
        for e in results
    ]


@api_router.get("/exercises/groups")
async def list_groups():
    return MUSCLE_GROUPS


@api_router.get("/exercises/{exercise_id}")
async def get_exercise(exercise_id: str):
    for e in EXERCISES:
        if e["id"] == exercise_id:
            return e
    raise HTTPException(status_code=404, detail="Esercizio non trovato")


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)
