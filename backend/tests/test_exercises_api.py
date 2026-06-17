"""Backend tests for Palestra IT exercises API (Phase 2: 102 exercises)."""
import os
import random
import pytest
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL") or os.environ.get("EXPO_BACKEND_URL")
if not BASE_URL:
    env_path = "/app/frontend/.env"
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                if line.startswith("EXPO_PUBLIC_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip()
                    break
BASE_URL = (BASE_URL or "").rstrip("/")

EXPECTED_COUNT = 102


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Root ----------
class TestRoot:
    def test_root_returns_exercises_count_102(self, api):
        r = api.get(f"{BASE_URL}/api/")
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("message") == "Palestra IT API"
        assert data.get("exercises_count") == EXPECTED_COUNT, (
            f"Expected {EXPECTED_COUNT}, got {data.get('exercises_count')}"
        )


# ---------- /exercises listing ----------
class TestExercisesList:
    def test_list_all_exercises_count_and_shape(self, api):
        r = api.get(f"{BASE_URL}/api/exercises")
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == EXPECTED_COUNT, f"Expected {EXPECTED_COUNT}, got {len(data)}"
        sample = data[0]
        for key in ("id", "name", "category", "muscle_group", "equipment", "level", "image", "images"):
            assert key in sample, f"Missing key {key} in {sample}"
        assert "instructions" not in sample, "list payload should be light"

    def test_every_item_has_image_and_images_len_2(self, api):
        r = api.get(f"{BASE_URL}/api/exercises")
        assert r.status_code == 200
        data = r.json()
        bad = []
        for e in data:
            if not e.get("image"):
                bad.append((e["id"], "no image"))
                continue
            imgs = e.get("images")
            if not isinstance(imgs, list) or len(imgs) != 2:
                bad.append((e["id"], f"images len={len(imgs) if isinstance(imgs, list) else 'n/a'}"))
        assert not bad, f"Items with bad images: {bad[:10]}"

    def test_filter_by_muscle_petto(self, api):
        r = api.get(f"{BASE_URL}/api/exercises", params={"muscle": "Petto"})
        assert r.status_code == 200
        data = r.json()
        assert len(data) > 0
        for e in data:
            assert e["muscle_group"] == "Petto"

    def test_search_query_panca(self, api):
        r = api.get(f"{BASE_URL}/api/exercises", params={"q": "panca"})
        assert r.status_code == 200
        data = r.json()
        assert len(data) > 0
        for e in data:
            ql = "panca"
            assert ql in e["name"].lower() or ql in e["muscle_group"].lower() or ql in e["equipment"].lower()

    def test_muscle_all_returns_all(self, api):
        r = api.get(f"{BASE_URL}/api/exercises", params={"muscle": "all"})
        assert r.status_code == 200
        assert len(r.json()) == EXPECTED_COUNT


# ---------- Image URL HEAD checks ----------
class TestImageURLs:
    def test_sample_image_urls_return_200(self, api):
        r = api.get(f"{BASE_URL}/api/exercises")
        data = r.json()
        random.seed(42)
        sample = random.sample(data, min(10, len(data)))
        failures = []
        for ex in sample:
            for url in ex.get("images", [])[:2]:
                try:
                    h = requests.head(url, timeout=10, allow_redirects=True)
                    if h.status_code != 200:
                        # Some CDNs reject HEAD; try GET stream
                        g = requests.get(url, timeout=10, stream=True)
                        if g.status_code != 200:
                            failures.append((ex["id"], url, h.status_code, g.status_code))
                        g.close()
                except Exception as e:
                    failures.append((ex["id"], url, str(e), None))
        assert not failures, f"Broken image URLs: {failures}"


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
        assert isinstance(data.get("images"), list) and len(data["images"]) == 2
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
        assert r.headers.get("access-control-allow-origin") in ("*", "http://example.com")
