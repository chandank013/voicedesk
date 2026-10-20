# VoiceDesk: Product Feedback

### 1. Official MCP Python SDK (`mcp` 2.x)
- **What I used it for:** Implementing the self-hosted VoiceDesk MCP server over Streamable HTTP transport and exposing 6 distinct tools (`add_task`, `list_tasks`, `complete_task`, `save_note`, `search_notes`, `recall`).
- **What worked well:** Type annotations automatically convert Python functions to valid JSON-RPC schemas and tool descriptors. The Streamable HTTP ASGI integration (`streamable_http_app()`) makes mounting inside FastAPI clean.
- **What needs work:** The v2.0 rename from `FastMCP` to `MCPServer` broke many existing v1 tutorials. Clearer documentation on integrating with existing web frameworks (FastAPI/Starlette) without using CLI wrappers would save significant time.
- **Onboarding experience:** 4/5. Quick to get a basic server running; took extra exploration to mount over existing ASGI apps.
- **Would I build with it again? Why or why not:** Yes. MCP is clearly the future standard for AI agent tools.

---

### 2. Amazon Bedrock (Converse API - AWS Builder)
- **What I used it for:** Grounded recall over unstructured saved notes (`recall` tool and "Ask your notes" feature), summarizing user questions while citing note IDs.
- **Services used:** Amazon Bedrock Runtime Converse API (`boto3`).
- **Model ID:** `amazon.nova-micro-v1:0` (and `anthropic.claude-3-haiku-20240307-v1:0`).
- **Region:** `us-east-1`.
- **What worked well:** The Converse API offers a standardized message structure across foundation models without vendor-specific payload schemas. Nova Micro delivered response latency under 350 ms at negligible cost (~$0.0001 per query).
- **What needs work:** Setting up AWS credentials in local development during a hackathon can be tricky for newcomers. A built-in sandbox or mocking layer in the AWS SDK would accelerate rapid prototyping.
- **Onboarding experience:** 4.5/5. Converse API documentation and Python samples are concise and reliable.
- **Would I build with it again? Why or why not:** Yes. Bedrock makes production LLM deployment secure, scalable, and cost-effective.

---

### 3. MCP Inspector
- **What I used it for:** Interactive debugging of MCP JSON-RPC payloads, schema validation, and verifying tool execution responses over Streamable HTTP.
- **What worked well:** Immediate visual inspection of input parameters, JSON responses, and error propagation.
- **What needs work:** Web-based inspector occasionally hangs when an SSE connection is aborted unexpectedly.
- **Onboarding experience:** 5/5. Running `npx @modelcontextprotocol/inspector` works immediately out of the box.
- **Would I build with it again? Why or why not:** Yes, an indispensable tool for developing any MCP server.

---

### 4. Alexa+ Developer Documentation & Simulator
- **What I used it for:** Designing spoken response strings (`speech` field), natural-language date understanding, and designing the simulated Alexa+ conversational loop.
- **What worked well:** The emphasis on concise spoken responses (under 25 words) directly guided the prompt design and TTS formatting.
- **What needs work:** Public documentation regarding native MCP server registration on production Alexa+ developer previews is still evolving.
- **Onboarding experience:** 4/5.
- **Would I build with it again? Why or why not:** Yes, voice-first ambient computing is the most natural interaction paradigm for tasks and notes.
