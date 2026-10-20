"""
MCP Client Wrapper for VoiceDesk.
Enables local simulator and external clients to invoke VoiceDesk MCP tools
adhering strictly to the Model Context Protocol (2025-11-25+).
"""
import httpx
from typing import Dict, Any, Optional

class VoiceDeskMCPClient:
    def __init__(self, base_url: str = "http://127.0.0.1:8000"):
        self.base_url = base_url.rstrip("/")

    async def call_tool(self, name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes an MCP tool call over HTTP JSON-RPC or REST bridge.
        """
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/call",
            "params": {
                "name": name,
                "arguments": arguments
            }
        }
        async with httpx.AsyncClient() as client:
            try:
                res = await client.post(
                    f"{self.base_url}/mcp",
                    json=payload,
                    headers={"Content-Type": "application/json", "Accept": "application/json"},
                    timeout=10.0
                )
                if res.status_code == 200:
                    return res.json()
            except Exception as e:
                return {"error": str(e), "ok": False}
        return {"error": "Failed to connect to MCP server", "ok": False}

mcp_client = VoiceDeskMCPClient()
