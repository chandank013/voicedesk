import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import settings
from .db import init_db
from .api import tasks, notes, tool_calls, simulator, stats, events
from .mcp.server import mcp_server

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB & Seed reference demo data
    init_db()
    yield

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="VoiceDesk: Alexa+ MCP Server and Voice-First Productivity Dashboard",
    lifespan=lifespan
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount REST API Routers
app.include_router(tasks.router)
app.include_router(notes.router)
app.include_router(tool_calls.router)
app.include_router(simulator.router)
app.include_router(stats.router)
app.include_router(events.router)

# Mount official Streamable HTTP MCP server
try:
    app.mount("/mcp", mcp_server.streamable_http_app())
except Exception as e:
    print(f"Warning: Failed to mount MCP streamable HTTP app: {e}")

# If frontend build exists, serve static files
dist_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "frontend", "dist")
if os.path.exists(dist_dir):
    app.mount("/", StaticFiles(directory=dist_dir, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
