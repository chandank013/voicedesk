# VoiceDesk: Technical Requirements Document (TRD)

**Project:** VoiceDesk — Voice-First Task & Knowledge Assistant  
**Protocol:** Model Context Protocol (MCP Spec 2025-11-25+)  
**Architecture:** Unified FastAPI Backend + React 19 Frontend + SQLite (WAL Mode) + Amazon Bedrock

---

## 1. System Architecture

```
 Alexa+ / MCP Client ──(Streamable HTTP / JSON-RPC 2.0)──► POST /mcp (FastAPI)
 React Dashboard ────────────(REST + SSE)───────────────► /api & /events
                                                               │
                                                        Service Layer
                                                               │
                                         ┌─────────────────────┴──────────────────┐
                                         ▼                                        ▼
                                  SQLite Database                       Amazon Bedrock Runtime
                                    (WAL Mode)                           (Converse API)
```

---

## 2. Technical Stack Specification
| Layer | Technology | Rationale |
|---|---|---|
| **Runtime & Language** | Python 3.11+ | High performance, modern async/await, native MCP SDK support |
| **Backend Framework** | FastAPI + Uvicorn | High throughput ASGI web server, automatic OpenAPI documentation |
| **MCP Implementation** | Official `mcp` 2.x SDK | FastMCP / `MCPServer`, Streamable HTTP transport compliance |
| **Database & ORM** | SQLite + SQLAlchemy 2.0 | Zero external dependencies, WAL mode for sub-millisecond local reads/writes |
| **Relative Date Parsing** | `dateparser` | Resolves relative natural-language date strings to UTC |
| **Fuzzy Matching** | `rapidfuzz` | Token-set-ratio matching for voice task completion disambiguation |
| **AI Recall (AWS Builder)**| `boto3` Bedrock Runtime | Converse API with `amazon.nova-micro-v1:0` for grounded note QA |
| **Realtime Stream** | `sse-starlette` | Lightweight Server-Sent Events (SSE) broadcaster |
| **Frontend Framework** | React 19, TypeScript, Vite | Modern component model, type safety, sub-second HMR |
| **Styling & Design** | Tailwind CSS v3 | Custom design tokens: Harbor, Sheet, Spruce, Tide, Signal, Lilac, Brick |

---

## 3. Model Context Protocol (MCP) Tools

| Tool | Parameters | Return Structure |
|---|---|---|
| `add_task` | `title: str`, `due: Optional[str]` | `{id, title, due_date, due_display, priority, speech}` |
| `list_tasks` | `status: str = "open"`, `when: str = "all"` | `{tasks: Task[], count, speech}` |
| `complete_task` | `query: str` | `{id, title, ok, speech}` or `{ambiguous, candidates, speech}` |
| `save_note` | `text: str`, `tags: Optional[list[str]]` | `{id, title, text, tags, speech}` |
| `search_notes` | `query: str`, `limit: int = 3` | `{notes: Note[], matches, speech}` |
| `recall` | `question: str` | `{answer, sources: int[], speech}` |

---

## 4. Non-Functional Requirements & Performance
- **Latency Floor:** P95 local MCP tool execution under 120 ms (without Bedrock); under 400 ms with Bedrock Nova Micro.
- **Reliability:** All MCP tools wrap errors in user-friendly speech responses.
- **Accessibility:** WCAG AA contrast standards, keyboard navigation (`/` hotkey to focus speak bar, `Enter` to submit), `aria-live="polite"` on activity feed.
- **Dual Surface Deployment:** Single Docker container serves both backend REST / MCP transport and compiled static frontend on port 8000.

---

## 5. Document Reference
- Separate `.docx` file available at: `docs/VoiceDesk Technical Requirements Document (TRD).docx`
