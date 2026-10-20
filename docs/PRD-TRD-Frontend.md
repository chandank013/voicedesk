# VoiceDesk: PRD, TRD, Frontend Design and Winning Plan

**Hackathon:** Build, Ship, Shape: Amazon Developer Hackathon (Devpost)  
**Primary track:** Alexa+  
**Mini challenges:** Open Source (MIT) and AWS Builder (Amazon Bedrock)  
**Stack:** React (Vite, TypeScript) + FastAPI + SQLite (SQLAlchemy)

---

# Part 1: Product Requirements Document (PRD)

## 1.1 One-line pitch
VoiceDesk is an Alexa+ MCP server that turns spoken requests into tasks and notes, with a live dashboard that shows every tool call as it happens.

## 1.2 Problem
Small commitments ("call the bank tomorrow", "remember the Wi-Fi password idea") get lost because stopping to type breaks focus, and hands are often busy (cooking, driving, working). Voice assistants can set timers but rarely keep structured, searchable, reviewable tasks and notes.

## 1.3 Target users
| Persona | Need |
|---|---|
| Busy professional | Capture tasks hands-free, review them later on a screen |
| Student | Dictate study notes, get summaries |
| Caretaker or family member | Shared household reminders, quick lookups ("what's due today?") |

## 1.4 Goals and non-goals
**Goals**
1. A working self-hosted MCP server (spec 2025-11-25 or later, Streamable HTTP) with 5+ tools.
2. A React dashboard that updates live when tools are called.
3. A simulated Alexa+ experience in the web app that calls the real MCP server through a real MCP client (no faked responses).
4. A public GitHub repo with an MIT license and a clear README.
5. A demo video under 3 minutes, product feedback, and a friction log.

**Non-goals**
- User accounts, multi-tenant auth, mobile apps, payments, calendar sync.

## 1.5 What makes it stand out
1. **Live tool-call trace:** the dashboard shows each utterance, the MCP tool chosen, the arguments, the result, and the latency. Judges can see MCP working, not just trust it.
2. **Ambiguity handling:** "tomorrow", "next Friday", "the bank thing" are resolved deterministically, with a spoken-style confirmation back ("Added: call the bank, due Wed Oct 21").
3. **Bedrock-powered recall:** "what did I decide about the budget?" searches notes and Bedrock summarizes the answer (AWS Builder).
4. **Honest product feedback:** a detailed friction log with severity and workarounds (up to a 10% judging bonus).
5. **Polish:** a distinctive, accessible UI and a tight demo video.

## 1.6 User stories and acceptance criteria
| ID | Story | Acceptance criteria |
|---|---|---|
| US-1 | As a user, I say "Add call the bank tomorrow" and a task is created | Task row exists with correct due date; response text is under 25 words; dashboard shows it within 2s |
| US-2 | I ask "What's on my list today?" | Returns only open tasks due today or earlier, sorted by due date |
| US-3 | I say "Mark call the bank done" | Fuzzy match on title; if 2 or more matches, the server asks which one |
| US-4 | I say "Note: use SQLite for the demo" | Note saved with timestamp |
| US-5 | I ask "What did I note about SQLite?" | Search returns top 3 notes; Bedrock summary returned if enabled, plain excerpt if not |
| US-6 | I watch the dashboard while speaking | Activity feed shows tool name, args, result, latency for each call |
| US-7 | A tool fails | Error is spoken in plain language and visible in the feed with a retry hint |

---

# Part 2: Technical Requirements Document (TRD)

## 2.1 Architecture
```
 Alexa+ / MCP client ----(Streamable HTTP, JSON-RPC)----> FastAPI  /mcp
 React dashboard ---------------(REST + SSE)-----------> FastAPI  /api
                                                              |
                                                       service layer
                                                              |
                                           SQLite   <---> Bedrock (optional)
```

## 2.2 Tech stack
- Python 3.11+, FastAPI, Uvicorn
- Official MCP Python SDK (`mcp` 2.x, Streamable HTTP transport)
- SQLAlchemy 2.0 + SQLite (WAL mode)
- Date parsing: `dateparser`
- Fuzzy match: `rapidfuzz`
- AWS: `boto3` Bedrock Runtime Converse API
- Realtime: Server-Sent Events (`/api/events`)
- Frontend: React 19 / 18, Vite, TypeScript, Tailwind CSS, Lucide icons

## 2.3 MCP Server Specification
- Streamable HTTP endpoint: `POST /mcp`
- Server name: `voicedesk`, Protocol version: `2025-11-25`
- Tools:
  - `add_task(title: str, due: str = None)`
  - `list_tasks(status: str = "open", when: str = "all")`
  - `complete_task(query: str)`
  - `save_note(text: str, tags: list[str] = None)`
  - `search_notes(query: str, limit: int = 3)`
  - `recall(question: str)`

---

# Part 3: Frontend Design Tokens

| Token | Hex | Role |
|---|---|---|
| Harbor | `#E9EFF1` | Canvas background |
| Sheet | `#FFFFFF` | Panels |
| Spruce | `#10302F` | Primary text, headers |
| Tide | `#2F6F73` | Interactive elements, task accents |
| Signal | `#F0A030` | Live indicator, highlights |
| Lilac | `#6B5A8E` | Notes |
| Brick | `#B23A2B` | Errors & urgent priority |

**Typography:**
- UI & Display: `Bricolage Grotesque`
- Spoken words & Notes: `Newsreader` (serif italic)
- Code & Tool names: `JetBrains Mono`
