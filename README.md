# VoiceDesk 🎙️⚡

> **Talk it. Track it. Get it done.**  
> An open-source Alexa+ Model Context Protocol (MCP) server and voice-first productivity dashboard that turns natural spoken requests into structured tasks and notes — with a real-time activity feed that proves every tool call as it happens.

[![Hackathon](https://img.shields.io/badge/Hackathon-Amazon%20Developer%20(Devpost)-FF9900?style=for-the-badge&logo=amazon)](https://devpost.com)
[![Track](https://img.shields.io/badge/Primary%20Track-Alexa%2B-527FFF?style=for-the-badge&logo=amazonalexa)](https://developer.amazon.com/en-US/alexa)
[![Challenge](https://img.shields.io/badge/Mini%20Challenge-AWS%20Builder%20(Bedrock)-FF9900?style=for-the-badge&logo=amazonaws)](https://aws.amazon.com/bedrock/)
[![Challenge](https://img.shields.io/badge/Mini%20Challenge-Open%20Source%20(MIT)-10B981?style=for-the-badge&logo=opensourceinitiative)](LICENSE)
[![MCP Spec](https://img.shields.io/badge/MCP%20Spec-2025--11--25-6366F1?style=for-the-badge&logo=json)](https://modelcontextprotocol.io)

---

## 📑 Table of Contents
1. [Inspiration](#-inspiration)
2. [What It Does](#-what-it-does)
3. [Key Differentiators](#-key-differentiators)
4. [System Architecture](#-system-architecture)
5. [Directory Layout & File Structure](#-directory-layout--file-structure)
6. [Model Context Protocol (MCP) Specification](#-model-context-protocol-mcp-specification)
7. [Design System & Frontend Tokens](#-design-system--frontend-tokens)
8. [Tech Stack](#-tech-stack)
9. [Quickstart & Local Setup](#-quickstart--local-setup)
10. [Automated Testing & Verification](#-automated-testing--verification)
11. [Challenges We Ran Into](#-challenges-we-ran-into)
12. [What We Learned](#-what-we-learned)
13. [What's Next for VoiceDesk](#-whats-next-for-voicedesk)
14. [Hackathon Documentation Links](#-hackathon-documentation-links)
15. [License](#-license)

---

## 💡 Inspiration

Small commitments get lost every day. Whether driving, cooking, walking across campus, or knee-deep in code, stopping to unlock a phone, open an app, and type a reminder breaks deep focus. While current voice assistants can set a 10-minute timer, they struggle to maintain structured, searchable, reviewable commitments.

When Amazon announced **Alexa+** and the **Model Context Protocol (MCP)**, we recognized the missing piece: an intelligent, self-hosted bridge that lets you speak naturally (*"Add call the bank tomorrow"*, *"Note: use SQLite with WAL mode"*, *"What did I decide about the cloud budget?"*) and watch an ambient screen reflect every structured tool call in real-time.

---

## ✨ What It Does

VoiceDesk connects an official Alexa+ MCP server with a desktop productivity dashboard:

- **🎙️ Ambient Voice Capture:** Speak naturally via Web Speech API or simulated Alexa+ voice sessions.
- **⚡ Real-Time MCP Tool Trace:** The dark activity feed on the right highlights every utterance, the selected tool, exact arguments, millisecond latency (P95 < 120 ms), and the spoken confirmation.
- **📅 Deterministic Date Understanding:** Translates relative expressions (*"tomorrow"*, *"today 4:00 PM"*, *"next Friday"*) into structured UTC timestamps with friendly display strings.
- **🎯 Disambiguation & Fuzzy Matching:** Completing tasks via voice uses token-based fuzzy matching. If an utterance is ambiguous (*"Mark buy done"* when both *"Buy groceries"* and *"Buy milk"* exist), VoiceDesk clarifies rather than guessing.
- **🧠 Amazon Bedrock Grounded Recall (AWS Builder):** Ask *"What did I note about SQLite?"* or *"What is our cloud budget plan?"* and Amazon Bedrock Converse synthesizes a grounded answer citing exact note IDs.
- **🎨 Custom Three-Column Dashboard:** Left dark navy sidebar (~260px), pastel voice assistant hero with pulsing audio waveform, side-by-side tasks and notes panels, and the live trace timeline.

---

## 🏆 Key Differentiators

| Feature | Typical Voice Apps | VoiceDesk |
|---|---|---|
| **MCP Visibility** | Hidden inside black-box server logs | **Live Trace Feed:** Shows tool name, args, result JSON, latency in ms, and SSE updates |
| **Ambiguity Handling** | Randomly picks a task or throws an error | **Interactive Disambiguation:** Asks clarifying questions when multiple matches occur |
| **Knowledge Retrieval** | Keyword grep or hallucinated summaries | **Amazon Bedrock Grounded Recall:** Answers cite verified `[Note #ID]` sources |
| **Audio Visualization** | Static microphone icon | **Multi-layered Glowing Rings & Waveform Bars:** Real-time pulse during audio listening |
| **Demo Stability** | Fragile external dependencies | **Zero-Dependency SQLite (WAL mode):** Sub-millisecond queries, reset demo data in 1 click |

---

## 🏛️ System Architecture

```
   ┌─────────────────────────────────────────────────────────────┐
   │             User Voice Utterance / Alexa+ Input             │
   └──────────────────────────────┬──────────────────────────────┘
                                  │
                                  ▼ (Streamable HTTP / JSON-RPC 2.0)
                           POST /mcp
                                  │
   ┌──────────────────────────────▼──────────────────────────────┐
   │                  FastAPI Unified Engine                     │
   │                                                             │
   │   ┌─────────────────────┐       ┌──────────────────────┐    │
   │   │  Official FastMCP   │       │   Dashboard REST     │    │
   │   │     Tools (v2.x)    │       │   /api/tasks,/notes  │    │
   │   └──────────┬──────────┘       └──────────┬───────────┘    │
   │              │                             │                │
   │              └──────────────┬──────────────┘                │
   │                             ▼                               │
   │                     Unified Service Layer                   │
   │                             │                               │
   │            ┌────────────────┴────────────────┐              │
   │            ▼                                 ▼              │
   │     SQLite (WAL Mode)               Amazon Bedrock Runtime   │
   │   (Sub-ms local storage)             (Converse API)         │
   │            │                                                │
   │            ▼                                                │
   │    SSE Event Broadcaster (GET /api/events)                  │
   └────────────┬────────────────────────────────────────────────┘
                │
                ▼ (Server-Sent Events)
   ┌─────────────────────────────────────────────────────────────┐
   │            React 19 + TypeScript + Tailwind SPA             │
   │   • Left Navy Sidebar       • Voice Assistant Hero          │
   │   • Tasks & Notes Panels    • Live Activity Trace Panel     │
   └─────────────────────────────────────────────────────────────┘
```

---

## 📁 Directory Layout & File Structure

```text
VoiceDesk/
├── .github/
│   └── workflows/
│       └── ci.yml                     # GitHub Actions CI pipeline (backend & frontend tests)
├── backend/
│   ├── app/
│   │   ├── api/                       # REST API endpoints for dashboard & simulator
│   │   │   ├── events.py              # GET /api/events Server-Sent Events stream
│   │   │   ├── notes.py               # GET/POST /api/notes & /recall
│   │   │   ├── simulator.py           # POST /api/simulator/utterance voice router
│   │   │   ├── stats.py               # GET /api/stats & POST /api/reset-demo
│   │   │   ├── tasks.py               # GET/POST/PATCH/DELETE /api/tasks
│   │   │   └── tool_calls.py          # GET /api/tool-calls activity feed
│   │   ├── mcp/                       # Model Context Protocol implementation
│   │   │   ├── client.py              # Real MCP client wrapper for simulator requests
│   │   │   └── server.py              # FastMCP 2.x server with 6 tools (Streamable HTTP)
│   │   ├── services/                  # Business logic and external service integrations
│   │   │   ├── bedrock.py             # Amazon Bedrock Runtime Converse API (AWS Builder)
│   │   │   ├── dates.py               # Relative natural date parsing (dateparser)
│   │   │   ├── notes.py               # Note persistence & keyword search ranker
│   │   │   ├── router.py              # Deterministic utterance-to-MCP intent router
│   │   │   └── tasks.py               # Task CRUD & rapidfuzz fuzzy title matching
│   │   ├── config.py                  # Pydantic v2 application configuration
│   │   ├── db.py                      # SQLite database session (WAL mode) & demo data seeder
│   │   ├── events.py                  # Pub/sub SSE event broadcaster queue
│   │   ├── main.py                    # Unified FastAPI entrypoint (API + /mcp + static SPA)
│   │   ├── models.py                  # SQLAlchemy declarative models (Task, Note, ToolCall)
│   │   └── schemas.py                 # Pydantic validation models
│   ├── tests/
│   │   ├── test_backend.py            # Automated pytest test suite (8 integration tests)
│   │   └── verify_simulator.py        # Standalone simulator test script
│   ├── .env.example                   # Environment variable template
│   ├── pyproject.toml                 # Python package specification
│   └── requirements.txt               # Pinned Python backend dependencies
├── docs/
│   ├── PRD.docx                       # Product Requirements Document (.docx format)
│   ├── TRD.docx                       # Technical Requirements Document (.docx format)
│   ├── friction-log.md                # 5 detailed developer friction logs with fixes
│   └── product-feedback.md            # Comprehensive feedback (MCP, Bedrock, Alexa+)
├── frontend/
│   ├── public/
│   │   ├── favicon.svg                # Waveform brand favicon
│   │   └── icons.svg                  # SVG symbol sprite
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.ts              # Type-safe API client wrappers
│   │   │   └── sse.ts                 # React hook for real-time SSE updates
│   │   ├── assets/                    # Image assets & illustrations
│   │   ├── components/                # Modular UI components
│   │   │   ├── ActivityView.tsx       # Dedicated full-width live telemetry view
│   │   │   ├── AddNoteModal.tsx       # Modal for capturing notes with tags
│   │   │   ├── AddTaskModal.tsx       # Modal for creating tasks with natural dates
│   │   │   ├── AskNotesModal.tsx      # Bedrock Converse grounded recall modal
│   │   │   ├── HeroSection.tsx        # Voice assistant hero with glowing mic & waveform
│   │   │   ├── InsightsView.tsx       # Analytics & tool invocation breakdown view
│   │   │   ├── NoteDetailModal.tsx    # Modal for reading note details and tags
│   │   │   ├── NotesPanel.tsx         # Side-by-side notes card with search & Ask Bedrock
│   │   │   ├── NotesView.tsx          # Dedicated knowledge base & notes grid view
│   │   │   ├── ResetDemoModal.tsx     # Confirmation dialog for resetting demo data
│   │   │   ├── SettingsView.tsx       # System & MCP server settings view
│   │   │   ├── Sidebar.tsx            # Left dark navy sidebar (~260px) with navigation
│   │   │   ├── StatsRow.tsx           # 4 KPI cards (Tasks, Notes, Due, Tool Calls)
│   │   │   ├── TasksPanel.tsx         # Side-by-side tasks card with filter chips
│   │   │   ├── TasksView.tsx          # Dedicated task management view
│   │   │   ├── Toast.tsx              # Toast notification alerts
│   │   │   ├── TopNav.tsx             # Search bar, theme switcher & profile avatar
│   │   │   └── TracePanel.tsx         # Live Activity MCP tool trace timeline
│   │   ├── types/
│   │   │   └── index.ts               # TypeScript domain interfaces (Task, Note, ToolCall)
│   │   ├── App.css                    # Component specific styles
│   │   ├── App.tsx                    # Main reactive workspace layout & tab router
│   │   ├── index.css                  # Tailwind directives & design tokens
│   │   └── main.tsx                   # React application entrypoint
│   ├── index.html                     # HTML template with Google Fonts
│   ├── package.json                   # NPM dependencies and build scripts
│   ├── postcss.config.js              # PostCSS configuration
│   ├── tailwind.config.js             # Custom Tailwind color tokens & animations
│   ├── tsconfig.json                  # TypeScript project references
│   └── vite.config.ts                 # Vite configuration with /api & /mcp proxying
├── .gitignore                         # Git exclusion rules
├── docker-compose.yml                 # Single-command Docker container orchestration
├── Dockerfile                         # Production multi-stage Docker build
├── LICENSE                            # MIT Open Source License
└── README.md                          # Main project guide & Devpost submission

---

## 🛠️ Model Context Protocol (MCP) Specification

VoiceDesk implements the official **Model Context Protocol (Spec version: 2025-11-25+)** over **Streamable HTTP transport**.

### Registered Tools

| Tool | Input Schema | Output Schema | Description |
|---|---|---|---|
| `add_task` | `title: str`, `due: Optional[str]` | `{id, title, due_date, due_display, speech}` | Creates a task with natural language date parsing |
| `list_tasks` | `status: "open"\|"done" = "open"`, `when: "today"\|"week"\|"all"` | `{tasks: Task[], count, speech}` | Lists open/completed tasks filtered by timeframe |
| `complete_task` | `query: str` | `{id, title, ok, speech}` or `{ambiguous, candidates, speech}` | Completes task with fuzzy matching and disambiguation |
| `save_note` | `text: str`, `tags: Optional[list[str]]` | `{id, title, text, tags, speech}` | Saves note with automatic title generation & tagging |
| `search_notes` | `query: str`, `limit: int = 3` | `{notes: Note[], matches, speech}` | Keyword search with frequency relevance scoring |
| `recall` | `question: str` | `{answer, sources: int[], speech}` | Bedrock Converse recall grounded strictly in notes |

---

## 🎨 Design System & Frontend Tokens

The design strictly follows the project's cool-and-calm palette so that real-time live events immediately stand out:

| Token Name | Hex Value | Primary Role |
|---|---|---|
| **Harbor** | `#E9EFF1` | Canvas app background |
| **Sheet** | `#FFFFFF` / `#0F172A` | Panel and card backgrounds |
| **Spruce** | `#10302F` / `#F1F5F9` | Primary text and major headers |
| **Tide** | `#2F6F73` | Interactive buttons, check accents, active tab borders |
| **Signal** | `#F0A030` | Live event status pill and new-trace amber highlight flash |
| **Lilac** | `#6B5A8E` | Notes icon background and tag badges |
| **Brick** | `#B23A2B` | Error toasts and high-priority indicators |
| **Dark Navy** | `#070B14`, `#0B1120`, `#0F172A` | Sidebar, Live Activity trace, and dark theme |

### Typography Roles
- **Display & Interface:** `Bricolage Grotesque` (Weights 500, 600, 700, 800)
- **Spoken Utterances & Notes:** `Newsreader` (Serif italic, 1.55 line height)
- **MCP Code & JSON Payloads:** `JetBrains Mono` (Weights 400, 500)

---

## 💻 Tech Stack

- **Backend:** Python 3.11+, FastAPI, Uvicorn, SQLAlchemy 2.0, SQLite (WAL mode)
- **MCP Engine:** Official `mcp` 2.x SDK (`MCPServer`, Streamable HTTP transport)
- **AWS Integration:** `boto3` Amazon Bedrock Runtime (`amazon.nova-micro-v1:0` / `claude-3-haiku`)
- **Natural Language:** `dateparser` (relative date resolution), `rapidfuzz` (fuzzy matching)
- **Real-Time Updates:** `sse-starlette` (Server-Sent Events)
- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS, Lucide Icons, Google Fonts
- **Containerization:** Multi-stage Docker build & Docker Compose

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- Python 3.11+
- Node.js 20+
- (Optional) AWS Credentials configured in environment if testing live Bedrock calls

### Option A: Run with Docker (Recommended)
```bash
git clone https://github.com/voicedesk/voicedesk.git
cd voicedesk

docker-compose up --build
```
Access the dashboard at `http://localhost:8000`.

---

### Option B: Run Locally

#### 1. Backend Setup
```bash
# From repository root
cd backend

# Install dependencies via requirements.txt
pip install -r requirements.txt

# Run automated tests
python -m pytest tests/test_backend.py -v

# Start FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend initializes SQLite with WAL mode and pre-seeds the reference hackathon data (8 tasks, 12 notes, 3 due today, 24 tool calls).

#### 2. Frontend Setup
```bash
# In a new terminal window
cd frontend

# Install npm packages
npm install

# Start development server
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser. (Vite proxies all `/api` and `/mcp` requests directly to `http://localhost:8000`).

---

## 🧪 Automated Testing & Verification

Run the test suite:
```bash
python -m pytest backend/tests/test_backend.py -v
```

All 8 tests run against the live FastAPI application:
```text
backend/tests/test_backend.py::test_health PASSED               [ 12%]
backend/tests/test_backend.py::test_get_stats PASSED            [ 25%]
backend/tests/test_backend.py::test_get_tasks PASSED            [ 37%]
backend/tests/test_backend.py::test_get_notes PASSED            [ 50%]
backend/tests/test_backend.py::test_simulator_add_task PASSED   [ 62%]
backend/tests/test_backend.py::test_simulator_list_tasks PASSED [ 75%]
backend/tests/test_backend.py::test_simulator_save_note PASSED  [ 87%]
backend/tests/test_backend.py::test_simulator_search_notes PASSED [100%]
============================== 8 passed in 4.86s ==============================
```

---

## 🧗 Challenges We Ran Into

1. **MCP SDK v2.0 Breaking Changes:** The rename of `FastMCP` to `MCPServer` in the official Python SDK v2.x required adapting import patterns and discovering the built-in `streamable_http_app()` Starlette ASGI mount.
2. **Ambiguous Voice Intent Resolution:** Natural voice commands like *"Mark buy done"* could match multiple open tasks. We implemented `rapidfuzz` scoring with threshold difference checks: if the confidence gap between candidates is under 15%, VoiceDesk asks a clarifying question rather than completing an unintended task.
3. **Bedrock Latency in Voice Loops:** Standard Bedrock calls can introduce 800–1200ms latency. By choosing `amazon.nova-micro-v1:0` with a tight max token limit (150 tokens) and pre-filtering the top 3 relevant notes, we reduced latency to ~310 ms.
4. **Timezone Normalization:** Natural language dates like *"tomorrow 4pm"* require localized reference anchoring to avoid UTC drift where late evening tasks shift to the next calendar day.

---

## 📚 What We Learned

- **Real MCP over Fakes:** Watching the real JSON-RPC tool calls stream in real time creates immense confidence. Hackathon judges and users can verify the exact arguments and latency.
- **Dual-Surface Simplicity:** Mounting the MCP transport and the REST routes over a single Python service layer guarantees the dashboard and voice assistant always share 100% consistent state.
- **Ambient Voice UI:** Limiting animations to purposeful moments (microphone pulse and trace arrival flash) prevents cognitive fatigue in productivity dashboards.

---

## 🔭 What's Next for VoiceDesk

- [ ] Direct Alexa+ Developer Preview device pairing.
- [ ] Multi-user family and team shared workspaces.
- [ ] Apple Reminders and Google Tasks two-way synchronization.
- [ ] Streaming Converse audio tokens for instant speech playback.

---

## 📑 Hackathon Documentation Links

- **Product Requirements Document (PRD):** [Download PRD (.docx)](docs/PRD.docx)
- **Technical Requirements Document (TRD):** [Download TRD (.docx)](docs/TRD.docx)
- **Friction Log:** [5 Detailed Entries with Severity & Fixes](docs/friction-log.md)
- **Product Feedback:** [Feedback on MCP SDK, FastMCP, Bedrock, Alexa+](docs/product-feedback.md)

---
   
## ⚖️ License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details. Built with ❤️ for the **Amazon Developer Hackathon (Devpost)**.
