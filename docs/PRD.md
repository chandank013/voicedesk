# VoiceDesk: Product Requirements Document (PRD)

**Project:** VoiceDesk — Voice-First Task & Knowledge Assistant  
**Hackathon:** Build, Ship, Shape: Amazon Developer Hackathon (Devpost)  
**Primary Track:** Alexa+  
**Mini Challenges:** AWS Builder (Amazon Bedrock) & Open Source (MIT)

---

## 1. Executive Summary & Pitch
VoiceDesk is an Alexa+ Model Context Protocol (MCP) server that turns ambient spoken requests into structured tasks and notes, paired with a live desktop dashboard that renders every tool call as it happens in real time.

---

## 2. Problem Statement
Small commitments (*"call the bank tomorrow"*, *"remember to check the Bedrock API"*, *"schedule sync with team"*) get lost because stopping to unlock a phone or type breaks focus. Existing voice assistants can set timers and play music, but rarely maintain structured, searchable, and reviewable productivity commitments across devices.

---

## 3. Target User Personas
| Persona | Key Needs & Scenarios |
|---|---|
| **Busy Professional** | Hands-free task capture while multitasking; desktop dashboard review |
| **Student & Researcher** | Voice-dictated research notes; intelligent semantic recall |
| **Household & Team** | Shared daily reminders, quick lookups (*"What is due today?"*) |

---

## 4. Goals & Non-Goals
### Core Goals
1. Working self-hosted MCP server (Spec 2025-11-25+, Streamable HTTP transport) with 6 tools.
2. Reactive React dashboard connected via Server-Sent Events (SSE).
3. Simulated Alexa+ voice & text interface calling real MCP tools (zero mocked responses).
4. Grounded semantic recall over saved notes via Amazon Bedrock Converse API.
5. Permissive open-source MIT license and comprehensive developer documentation.

### Non-Goals
- Multi-tenant enterprise SSO (demo is focused on fast self-hosted setup).
- Native iOS/Android app wrappers (web application is mobile-responsive).

---

## 5. User Stories & Acceptance Criteria

| ID | User Story | Acceptance Criteria |
|---|---|---|
| **US-1** | As a user, I say *"Add call the bank tomorrow"* to create a task | Task row created with parsed due date; spoken confirmation under 20 words; visible on dashboard in < 2s |
| **US-2** | I ask *"What's on my list today?"* | Filters and speaks open tasks due today; latency < 150 ms |
| **US-3** | I say *"Mark call the bank done"* | Fuzzy title matching marks task complete; asks clarifying questions if multiple matches exist |
| **US-4** | I say *"Note: use SQLite for the demo"* | Note saved with timestamp and tags; appears immediately in Notes panel |
| **US-5** | I ask *"What did I note about SQLite?"* | Retrieves relevant notes; Amazon Bedrock summarizes the answer with cited note IDs |
| **US-6** | I watch the dashboard during voice calls | Live Activity trace displays tool name, input arguments, latency in ms, and spoken result |
| **US-7** | An utterance fails or is invalid | Human-readable error message with guidance and retry suggestions |

---

## 6. Document Reference
- Separate `.docx` file available at: `docs/VoiceDesk Product Requirements Document (PRD).docx`
