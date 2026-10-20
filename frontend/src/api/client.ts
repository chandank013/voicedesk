import type { Task, Note, ToolCall, DashboardStats, SimulatorResponse } from '../types';

const API_BASE = '/api';

export async function fetchStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return res.json();
}

export async function fetchTasks(status?: string, when?: string): Promise<Task[]> {
  const params = new URLSearchParams();
  if (status && status !== 'all') params.append('status', status);
  if (when && when !== 'all') params.append('when', when);

  const res = await fetch(`${API_BASE}/tasks?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

export async function createTask(title: string, due?: string, priority: string = 'medium'): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, due, priority }),
  });
  if (!res.ok) throw new Error('Failed to create task');
  return res.json();
}

export async function toggleTask(id: number): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks/${id}/toggle`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to toggle task');
  return res.json();
}

export async function deleteTask(id: number): Promise<{ ok: boolean }> {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete task');
  return res.json();
}

export async function fetchNotes(query?: string): Promise<Note[]> {
  const url = query ? `${API_BASE}/notes?q=${encodeURIComponent(query)}` : `${API_BASE}/notes`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch notes');
  return res.json();
}

export async function createNote(text: string, tags?: string[], title?: string): Promise<Note> {
  const res = await fetch(`${API_BASE}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, tags, title }),
  });
  if (!res.ok) throw new Error('Failed to save note');
  return res.json();
}

export async function deleteNote(id: number): Promise<{ ok: boolean }> {
  const res = await fetch(`${API_BASE}/notes/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete note');
  return res.json();
}

export async function recallNotes(question: string): Promise<{ answer: string; sources: number[]; speech: string }> {
  const res = await fetch(`${API_BASE}/notes/recall`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error('Failed to recall notes');
  return res.json();
}

export async function fetchToolCalls(limit = 50, source?: string): Promise<ToolCall[]> {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  if (source && source !== 'all') params.append('source', source);

  const res = await fetch(`${API_BASE}/tool-calls?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch tool calls');
  return res.json();
}

export async function sendUtterance(utterance: string, source = 'simulator'): Promise<SimulatorResponse> {
  const res = await fetch(`${API_BASE}/simulator/utterance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ utterance, source }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to process utterance');
  }
  return res.json();
}

export async function resetDemoData(): Promise<{ ok: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/reset-demo`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to reset demo data');
  return res.json();
}
