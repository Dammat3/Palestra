"""Backend tests for Palestra IT exercises API."""
import os
import pytest
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL") or os.environ.get(
    "EXPO_BACKEND_URL"
)
if not BASE_URL:
    # Fallback to reading frontend .env
    env_path = "/app/frontend/.env"
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                if line.startswith("EXPO_PUBLIC_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip()
                    break
BASE_URL = BASE_URL.rstrip("/")


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Root ----------
class TestRoot:
    def test_root_returns_exercises_count_47(self, api):
        r = api.get(f"{BASE_URL}/api/")
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("message") == "Palestra IT API"
        assert data.get("exercises_count") == 47, f"Got {data.get('exercises_count')}"


# ---------- /exercises listing ----------
class TestExercisesList:
    def test_list_all_exercises(self, api):
        r = api.get(f"{BASE_URL}/api/exercises")
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 47, f"Expected 47, got {len(data)}"
        # Validate light payload shape
        sample = data[0]
        for key in ("id", "name", "category", "muscle_group", "equipment", "level", "image"):
            assert key in sample, f"Missing key {key} in {sample}"
        # instructions should NOT be in list payload
        assert "instructions" not in sample

    def test_filter_by_muscle_petto(self, api):
        r = api.get(f"{BASE_URL}/api/exercises", params={"muscle": "Petto"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, list)
        assert len(data) > 0, "No Petto exercises returned"
        for e in data:
            assert e["muscle_group"] == "Petto", f"Non-Petto in result: {e}"

    def test_search_query_panca(self, api):
        r = api.get(f"{BASE_URL}/api/exercises", params={"q": "panca"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, list)
        assert len(data) > 0, "No exercises matched 'panca'"
        for e in data:
            assert "panca" in e["name"].lower() or "panca" in e["muscle_group"].lower() or "panca" in e["equipment"].lower()

    def test_muscle_all_returns_all(self, api):
        r = api.get(f"{BASE_URL}/api/exercises", params={"muscle": "all"})
        assert r.status_code == 200
        assert len(r.json()) == 47


# ---------- /exercises/groups ----------
class TestGroups:
    def test_groups_returns_11(self, api):
        r = api.get(f"{BASE_URL}/api/exercises/groups")
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 11, f"Expected 11 groups, got {len(data)}"


# ---------- /exercises/{id} detail ----------
class TestExerciseDetail:
    def test_detail_panca_piana_bilanciere(self, api):
        r = api.get(f"{BASE_URL}/api/exercises/panca-piana-bilanciere")
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["id"] == "panca-piana-bilanciere"
        assert isinstance(data.get("instructions"), list) and len(data["instructions"]) > 0
        assert isinstance(data.get("images"), list) and len(data["images"]) > 0
        assert "tips" in data
        assert "secondary_muscles" in data and isinstance(data["secondary_muscles"], list)

    def test_detail_invalid_id_returns_404(self, api):
        r = api.get(f"{BASE_URL}/api/exercises/invalid-id-xyz")
        assert r.status_code == 404
        assert r.json().get("detail") == "Esercizio non trovato"


# ---------- CORS ----------
class TestCORS:
    def test_cors_header_present(self, api):
        r = api.get(f"{BASE_URL}/api/", headers={"Origin": "http://example.com"})
        assert r.status_code == 200
        # CORS allow-origin is `*`
        assert r.headers.get("access-control-allow-origin") in ("*", "http://example.com")
