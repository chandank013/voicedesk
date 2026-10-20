export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'open' | 'done';

export interface Task {
  id: number;
  title: string;
  due_date: string | null;
  due_display: string | null;
  status: TaskStatus;
  priority: Priority;
  created_at: string;
  completed_at?: string | null;
}

export interface Note {
  id: number;
  title: string;
  text: string;
  tags?: string[] | string;
  summary?: string;
  created_at: string;
}

export interface ToolCall {
  id: number;
  tool: string;
  utterance?: string;
  args_json?: string;
  result_json?: string;
  speech?: string;
  ok: boolean;
  latency_ms: number;
  source: 'mcp' | 'simulator' | 'ui';
  created_at: string;
}

export interface DashboardStats {
  open_tasks: number;
  notes_captured: number;
  due_today: number;
  total_tool_calls: number;
}

export interface SimulatorResponse {
  tool: string;
  utterance: string;
  args: Record<string, any>;
  result: any;
  speech: string;
  latency_ms: number;
  ok: boolean;
}
