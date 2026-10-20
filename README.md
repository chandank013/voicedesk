# VoiceDesk 🎙️⚡

> **Talk it. Track it. Get it done.**  
> An Alexa+ MCP server that turns spoken requests into structured tasks and notes, with a live dashboard that shows every tool call as it happens.

[![CI](https://github.com/voicedesk/voicedesk/actions/workflows/ci.yml/badge.svg)](https://github.com/voicedesk/voicedesk/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Spec](https://img.shields.io/badge/MCP%20Spec-2025--11--25-blue.svg)](https://modelcontextprotocol.io)
[![AWS Bedrock](https://img.shields.io/badge/AWS-Amazon%20Bedrock-orange.svg)](https://aws.amazon.com/bedrock/)

---

## 🌟 Overview

Small commitments (*"call the bank tomorrow"*, *"remember to test the Bedrock API"*) get lost because stopping to type breaks flow, and hands are often occupied. Voice assistants can set timers, but rarely maintain structured, searchable, reviewable tasks and notes.

**VoiceDesk** bridges this gap:
1. **Live Tool-Call Trace:** The dashboard displays every utterance, the chosen MCP tool, arguments, latency in milliseconds, and the exact response in real-time.
2. **Deterministic Natural Language:** Resolves dates like *"tomorrow"*, *"today 4pm"*, and *"next Friday"*, answering with natural spoken confirmations (*"Added: Call the bank, due Wednesday, Oct 21"*).
3. **Fuzzy Ambiguity Handling:** Matches tasks by title using fuzzy string matching. If multiple tasks match (*"Buy groceries"* vs *"Buy supplies"*), VoiceDesk asks a clarifying question rather than guessing.
4. **Amazon Bedrock Grounded Recall (AWS Builder):** Ask *"What did I note about SQLite?"* or *"What is our cloud budget plan?"* and Bedrock synthesizes an answer grounded strictly in your saved notes with cited source IDs.

---

## 🏛️ Architecture

```
   Alexa+ / MCP Client
          │
          ▼ (Streamable HTTP / JSON-RPC 2.0)
     POST /mcp
          │
  ┌───────▼──────────────────────────────────────────────┐
  │              FastAPI Unified Backend                 │
  │  ┌──────────────┐ ┌───────────────┐ ┌─────────────┐  │
  │  │  FastMCP 2.x │ │   REST API    │ │ SSE Stream  │  │
  │  │    Tools     │ │  /api/tasks   │ │ /api/events │  │
  │  │              │ │  /api/notes   │ │             │  │
  │  └──────┬───────┘ └───────┬───────┘ └──────▲──────┘  │
  │         │                 │                │         │
  │         └────────► Service Layer ──────────┘         │
  │                           │                          │
  └───────────────────────────┼──────────────────────────┘
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
        SQLite Database            Amazon Bedrock Runtime
           (WAL Mode)               Converse API (Claude / Nova)
```

---

## 🛠️ MCP Tools Implemented

VoiceDesk implements the official **Model Context Protocol (Spec 2025-11-25+)**:

| Tool | Parameters | Description |
|---|---|---|
| `add_task` | `title: str`, `due: Optional[str]` | Creates task with natural-language date parsing |
| `list_tasks` | `status: str = "open"`, `when: str = "all"` | Lists tasks filtered by time period (`today`, `week`, `all`) |
| `complete_task` | `query: str` | Marks task complete with fuzzy matching and disambiguation |
| `save_note` | `text: str`, `tags: Optional[list[str]]` | Stores note with auto-generated title and tags |
| `search_notes` | `query: str`, `limit: int = 3` | Searches saved notes with keyword relevance scoring |
| `recall` | `question: str` | Answers questions grounded in notes via Amazon Bedrock |

---

## 🚀 Quickstart

### Prerequisites
- Python 3.11+
- Node.js 20+

### Option 1: Run with Docker Compose
```bash
docker-compose up --build
```
Access the dashboard at `http://localhost:8000`.

### Option 2: Run Locally

#### 1. Backend Setup
```bash
# Clone the repository
git clone https://github.com/voicedesk/voicedesk.git
cd voicedesk

# Install backend dependencies
pip install -e ./backend[test]

# Run tests
pytest backend/tests/test_backend.py -v

# Start FastAPI server
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser. (The Vite dev server proxies `/api` and `/mcp` directly to `http://localhost:8000`).

---

## 🎨 Design Tokens

VoiceDesk uses a custom design system optimized for voice-first visibility:

- **Harbor** (`#E9EFF1`): Clean app canvas
- **Sheet** (`#FFFFFF` / `#0F172A`): Content cards and panels
- **Spruce** (`#10302F`): Primary text and titles
- **Tide** (`#2F6F73`): Interactive accents and task highlights
- **Signal** (`#F0A030`): Real-time live status and MCP activity flash
- **Lilac** (`#6B5A8E`): Notes and knowledge capture
- **Brick** (`#B23A2B`): Urgent priority and error alerts

**Typography:**
- *Interface & Display:* **Bricolage Grotesque**
- *Spoken Lines & Notes:* **Newsreader** (Serif)
- *Tools & JSON Payloads:* **JetBrains Mono**

---

## 🧪 Testing

Run the automated test suite:
```bash
pytest backend/tests/test_backend.py -v
```
All 8 automated tests verify:
- Health and protocol negotiation (`2025-11-25`)
- Statistics calculation (`open_tasks`, `notes_captured`, `due_today`, `total_tool_calls`)
- Real tool invocation via intent router (`add_task`, `list_tasks`, `save_note`, `search_notes`)
- Fuzzy task completion and state mutations

---

## 📄 Documentation

- [PRD, TRD & Design Plan](docs/PRD-TRD-Frontend.md)
- [Friction Log (5 entries with fixes)](docs/friction-log.md)
- [Product Feedback](docs/product-feedback.md)

---

## ⚖️ License

Distributed under the **MIT License**. See `LICENSE` for details.
