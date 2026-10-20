import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.db import init_db

client = TestClient(app)

def setup_module():
    init_db()

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["version"] == "1.0.0"
    assert data["mcp_protocol_version"] == "2025-11-25"

def test_get_stats():
    response = client.get("/api/stats")
    assert response.status_code == 200
    data = response.json()
    assert "open_tasks" in data
    assert "notes_captured" in data
    assert "due_today" in data
    assert "total_tool_calls" in data
    assert data["open_tasks"] >= 8
    assert data["notes_captured"] >= 12
    assert data["total_tool_calls"] >= 24

def test_get_tasks():
    response = client.get("/api/tasks")
    assert response.status_code == 200
    tasks = response.json()
    assert len(tasks) > 0
    titles = [t["title"] for t in tasks]
    assert "Call the bank" in titles
    assert "Finish hackathon demo" in titles

def test_get_notes():
    response = client.get("/api/notes")
    assert response.status_code == 200
    notes = response.json()
    assert len(notes) >= 5
    titles = [n["title"] for n in notes]
    assert any("SQLite" in t for t in titles)

def test_simulator_add_task():
    response = client.post("/api/simulator/utterance", json={"utterance": "Add submit hackathon project tomorrow"})
    assert response.status_code == 200
    data = response.json()
    assert data["tool"] == "add_task"
    assert "Submit hackathon project" in data["speech"]
    assert data["latency_ms"] >= 0

def test_simulator_list_tasks():
    response = client.post("/api/simulator/utterance", json={"utterance": "What's on my list today?"})
    assert response.status_code == 200
    data = response.json()
    assert data["tool"] == "list_tasks"
    assert data["ok"] is True

def test_simulator_save_note():
    response = client.post("/api/simulator/utterance", json={"utterance": "Note: test note for automated test suite"})
    assert response.status_code == 200
    data = response.json()
    assert data["tool"] == "save_note"
    assert data["ok"] is True

def test_simulator_search_notes():
    response = client.post("/api/simulator/utterance", json={"utterance": "What did I note about SQLite?"})
    assert response.status_code == 200
    data = response.json()
    assert data["tool"] == "search_notes"
    assert data["ok"] is True
