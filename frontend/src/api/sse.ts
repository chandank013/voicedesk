import { useEffect, useRef } from 'react';

export type SSEEventType =
  | 'connected'
  | 'task_created'
  | 'task_updated'
  | 'task_completed'
  | 'task_deleted'
  | 'note_created'
  | 'note_deleted'
  | 'tool_call'
  | 'demo_reset';

export interface SSEEventData {
  type: SSEEventType;
  payload: any;
}

export function useSSE(onEvent: (event: SSEEventData) => void) {
  const savedHandler = useRef(onEvent);

  useEffect(() => {
    savedHandler.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    function connect() {
      eventSource = new EventSource('/api/events');

      eventSource.onopen = () => {
        // Connected
      };

      const eventNames: SSEEventType[] = [
        'connected',
        'task_created',
        'task_updated',
        'task_deleted',
        'note_created',
        'note_deleted',
        'tool_call',
        'demo_reset',
      ];

      eventNames.forEach((name) => {
        eventSource?.addEventListener(name, (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            savedHandler.current({ type: name, payload: data });
          } catch (err) {
            console.error('Failed to parse SSE data', err);
          }
        });
      });

      eventSource.onerror = () => {
        eventSource?.close();
        // Reconnect after 3 seconds if disconnected
        reconnectTimeout = setTimeout(connect, 3000);
      };
    }

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      eventSource?.close();
    };
  }, []);
}
