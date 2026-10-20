# VoiceDesk: Friction Log

### FL-001: MCP Python SDK v2.0 Renamed FastMCP to MCPServer
- **Task attempted:** Import and instantiate FastMCP from `mcp.server.fastmcp` following standard documentation.
- **Steps taken:** `from mcp.server.fastmcp import FastMCP; mcp = FastMCP("voicedesk")`
- **Expected:** Successful instantiation of FastMCP server.
- **Actual:** `ModuleNotFoundError: No module named 'mcp.server.fastmcp'. This is mcp 2.x, where FastMCP was renamed to MCPServer (from mcp.server.mcpserver import MCPServer)`.
- **Severity:** High
- **Workaround:** Updated import to `from mcp.server.mcpserver import MCPServer` and adjusted initialization accordingly.
- **Suggested fix:** Provide aliases or backward compatibility shims in `mcp.server.fastmcp` with a deprecation warning rather than raising an immediate `ModuleNotFoundError`.

---

### FL-002: Streamable HTTP ASGI Mounting in FastAPI
- **Task attempted:** Mount Streamable HTTP transport directly into FastAPI app instance.
- **Steps taken:** Attempted to bind custom HTTP handlers to `/mcp`.
- **Expected:** Clear official docs on mounting an `MCPServer` instance inside an existing Starlette/FastAPI application.
- **Actual:** Streamable HTTP documentation primarily focuses on standalone CLI runners (`mcp run`) rather than embedding within production FastAPI apps.
- **Severity:** Medium
- **Workaround:** Leveraged `server.streamable_http_app()` which exposes an internal Starlette ASGI application, allowing `app.mount("/mcp", server.streamable_http_app())`.
- **Suggested fix:** Document ASGI mounting patterns directly in the official MCP Python SDK README and tutorial section.

---

### FL-003: Natural Language Date Resolution with Timezone Drift
- **Task attempted:** Parsing relative dates like "tomorrow at 4pm" across different client/server timezones.
- **Steps taken:** Parsed strings using naive datetime parser.
- **Expected:** Task due dates align with the user's localized time.
- **Actual:** Naive datetimes produced offsets when converted to UTC for database storage, causing "today at 8pm" to appear as "tomorrow".
- **Severity:** Medium
- **Workaround:** Wrapped `dateparser` in `backend/app/services/dates.py` with explicit `RELATIVE_BASE` and UTC normalization, computing display strings relative to localized day boundaries.
- **Suggested fix:** Accept client timezone header (`X-Timezone: America/New_York`) in MCP request context or simulator payloads.

---

### FL-004: Ambiguous Fuzzy Task Completion Match Clarification
- **Task attempted:** Mark tasks complete using voice utterances like "Mark buy done" when multiple tasks match ("Buy groceries", "Buy milk").
- **Steps taken:** Simple substring matching selected the first match.
- **Expected:** If ambiguous, request clarification instead of completing an arbitrary task.
- **Actual:** First match completed unintentionally.
- **Severity:** Medium
- **Workaround:** Used `rapidfuzz.process.extract` with token-set-ratio scoring. If the top match score is less than 15 points higher than the second match, the MCP server returns an `ambiguous: true` response listing candidate titles and asking the user to clarify.
- **Suggested fix:** Adopt conversational confirmation patterns natively into MCP tool annotations (e.g. `clarification_prompt`).

---

### FL-005: Amazon Bedrock Converse API Latency in Voice Loops
- **Task attempted:** Live recall of notes using Amazon Bedrock Converse API during a voice interaction.
- **Steps taken:** Called Claude 3 Haiku / Nova Micro on every query.
- **Expected:** Response returned in under 400 ms for seamless voice dialogue.
- **Actual:** Cold start API calls took ~900–1400 ms, noticeable during live voice tests.
- **Severity:** Low
- **Workaround:** Used `amazon.nova-micro-v1:0` with `maxTokens: 150` and tight context window (top 3 notes only), reducing latency to ~310 ms. Provided graceful local semantic fallback when offline.
- **Suggested fix:** Support streaming Converse tokens via SSE directly to the frontend so speech synthesis starts on the first word chunk.
