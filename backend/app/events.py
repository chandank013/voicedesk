import asyncio
import json
from typing import AsyncGenerator
from collections import deque

class SSEBroadcaster:
    def __init__(self):
        self._subscribers: set[asyncio.Queue] = set()
        self._history: deque = deque(maxlen=50)

    async def subscribe(self) -> AsyncGenerator[str, None]:
        queue: asyncio.Queue = asyncio.Queue()
        self._subscribers.add(queue)
        try:
            # Yield initial connection confirmation
            yield f"event: connected\ndata: {json.dumps({'status': 'connected'})}\n\n"
            while True:
                data = await queue.get()
                yield data
        except asyncio.CancelledError:
            pass
        finally:
            self._subscribers.discard(queue)

    async def broadcast(self, event_type: str, data: dict):
        payload = f"event: {event_type}\ndata: {json.dumps(data)}\n\n"
        self._history.append(payload)
        
        # Broadcast to all connected subscriber queues
        dead_queues = set()
        for q in self._subscribers:
            try:
                q.put_nowait(payload)
            except Exception:
                dead_queues.add(q)
        for dq in dead_queues:
            self._subscribers.discard(dq)

broadcaster = SSEBroadcaster()
