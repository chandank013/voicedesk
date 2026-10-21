import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { HeroSection } from './components/HeroSection';
import { StatsRow } from './components/StatsRow';
import { TasksPanel } from './components/TasksPanel';
import { NotesPanel } from './components/NotesPanel';
import { TracePanel } from './components/TracePanel';
import { TasksView } from './components/TasksView';
import { NotesView } from './components/NotesView';
import { ActivityView } from './components/ActivityView';
import { InsightsView } from './components/InsightsView';
import { SettingsView } from './components/SettingsView';
import { AddTaskModal } from './components/AddTaskModal';
import { AddNoteModal } from './components/AddNoteModal';
import { AskNotesModal } from './components/AskNotesModal';
import { NoteDetailModal } from './components/NoteDetailModal';
import { ResetDemoModal } from './components/ResetDemoModal';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';

import {
  fetchStats,
  fetchTasks,
  createTask,
  toggleTask,
  deleteTask,
  fetchNotes,
  createNote,
  deleteNote,
  fetchToolCalls,
  sendUtterance,
  resetDemoData
} from './api/client';
import { useSSE } from './api/sse';
import type { Task, Note, ToolCall, DashboardStats, Priority } from './types';

export const App: React.FC = () => {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('voicedesk-theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('voicedesk-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('voicedesk-theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  // App Data States
  const [activeTab, setActiveTab] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [stats, setStats] = useState<DashboardStats>({
    open_tasks: 8,
    notes_captured: 12,
    due_today: 3,
    total_tool_calls: 24,
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
  const [newestCallId, setNewestCallId] = useState<number | null>(null);

  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [latestInteraction, setLatestInteraction] = useState<{
    utterance: string;
    speech: string;
    tool?: string;
  } | undefined>(undefined);

  // Modals state
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [isAskNotesOpen, setIsAskNotesOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial Data Fetching
  const refreshAllData = useCallback(async () => {
    try {
      const [statsData, tasksData, notesData, callsData] = await Promise.all([
        fetchStats(),
        fetchTasks(),
        fetchNotes(),
        fetchToolCalls(50),
      ]);
      setStats(statsData);
      setTasks(tasksData);
      setNotes(notesData);
      setToolCalls(callsData);
    } catch (err) {
      console.warn('Backend not currently reachable. Displaying local cache.', err);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Real-time SSE event listener
  useSSE((event) => {
    if (event.type === 'tool_call') {
      const newCall: ToolCall = event.payload;
      setToolCalls((prev) => [newCall, ...prev.filter((c) => c.id !== newCall.id)]);
      setNewestCallId(newCall.id);
      setTimeout(() => setNewestCallId(null), 2000);
      fetchStats().then(setStats).catch(() => {});
    } else if (event.type === 'task_created' || event.type === 'task_updated' || event.type === 'task_deleted' || event.type === 'task_completed') {
      fetchTasks().then(setTasks).catch(() => {});
      fetchStats().then(setStats).catch(() => {});
    } else if (event.type === 'note_created' || event.type === 'note_deleted') {
      fetchNotes().then(setNotes).catch(() => {});
      fetchStats().then(setStats).catch(() => {});
    } else if (event.type === 'demo_reset') {
      refreshAllData();
      addToast('info', 'Demo data reset successfully');
    }
  });

  // Action: Execute Voice / Simulator Utterance
  const handleExecuteUtterance = async (utterance: string) => {
    setIsProcessingVoice(true);
    try {
      const res = await sendUtterance(utterance, 'simulator');
      setLatestInteraction({
        utterance: res.utterance,
        speech: res.speech,
        tool: res.tool,
      });

      addToast(res.ok ? 'success' : 'error', res.speech);

      // Refresh tasks, notes, calls, stats
      await refreshAllData();
    } catch (err: any) {
      addToast('error', err.message || 'Utterance execution failed');
    } finally {
      setIsProcessingVoice(false);
    }
  };

  // Action: Add Task
  const handleAddTask = async (title: string, due?: string, priority?: Priority) => {
    try {
      const newTask = await createTask(title, due, priority);
      setTasks((prev) => [newTask, ...prev]);
      addToast('success', 'Task added');
      fetchStats().then(setStats).catch(() => {});
    } catch (err: any) {
      addToast('error', err.message || 'Could not add task');
    }
  };

  // Action: Toggle Task
  const handleToggleTask = async (id: number) => {
    try {
      const updated = await toggleTask(id);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      addToast('success', updated.status === 'done' ? 'Marked done' : 'Marked open');
      fetchStats().then(setStats).catch(() => {});
    } catch (err: any) {
      addToast('error', err.message || 'Failed to update task');
    }
  };

  // Action: Delete Task
  const handleDeleteTask = async (id: number) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      addToast('info', 'Task deleted');
      fetchStats().then(setStats).catch(() => {});
    } catch (err: any) {
      addToast('error', err.message || 'Failed to delete task');
    }
  };

  // Action: Add Note
  const handleAddNote = async (text: string, tags?: string[], title?: string) => {
    try {
      const newNote = await createNote(text, tags, title);
      setNotes((prev) => [newNote, ...prev]);
      addToast('success', 'Note saved');
      fetchStats().then(setStats).catch(() => {});
    } catch (err: any) {
      addToast('error', err.message || 'Could not save note');
    }
  };

  // Action: Delete Note
  const handleDeleteNote = async (id: number) => {
    try {
      await deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      addToast('info', 'Note removed');
      fetchStats().then(setStats).catch(() => {});
    } catch (err: any) {
      addToast('error', err.message || 'Failed to delete note');
    }
  };

  // Action: Search Notes
  const handleSearchNotes = async (query: string) => {
    try {
      const results = await fetchNotes(query);
      setNotes(results);
    } catch {
      // Ignore
    }
  };

  // Action: Reset Demo Data
  const handleConfirmReset = async () => {
    try {
      await resetDemoData();
      await refreshAllData();
      addToast('success', 'Reset demo data complete');
    } catch (err: any) {
      addToast('error', err.message || 'Failed to reset demo data');
    }
  };

  return (
    <div className="min-h-screen flex bg-harbor dark:bg-navy-950 font-sans text-slate-800 dark:text-slate-100 transition-colors">
      {/* 1. Left Sidebar (Fixed width ~260px) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openTasksCount={stats.open_tasks}
        notesCount={stats.notes_captured}
        className="hidden lg:flex"
      />

      {/* Mobile Drawer Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            openTasksCount={stats.open_tasks}
            notesCount={stats.notes_captured}
            className="relative z-10 w-72"
            onCloseMobile={() => setMobileMenuOpen(false)}
          />
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 2. Top Navigation */}
        <TopNav
          onSearch={(q) => {
            handleSearchNotes(q);
          }}
          onResetDemo={() => setIsResetConfirmOpen(true)}
          isDark={isDark}
          toggleTheme={toggleTheme}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* 3. Main Workspace according to activeTab */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 overflow-y-auto">
          {activeTab === 'home' && (
            <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* Center Area: Hero + Stats + Tasks + Notes (8 cols on XL screens) */}
              <div className="xl:col-span-8 space-y-6">
                {/* Voice Assistant Hero Section */}
                <HeroSection
                  onExecuteUtterance={handleExecuteUtterance}
                  isProcessing={isProcessingVoice}
                  latestInteraction={latestInteraction}
                />

                {/* Statistics Row (4 panels) */}
                <StatsRow stats={stats} />

                {/* Tasks and Notes Section Side-by-Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                  <TasksPanel
                    tasks={tasks}
                    onToggleTask={handleToggleTask}
                    onDeleteTask={handleDeleteTask}
                    onOpenAddTaskModal={() => setIsAddTaskOpen(true)}
                  />

                  <NotesPanel
                    notes={notes}
                    onAddNoteClick={() => setIsAddNoteOpen(true)}
                    onAskNotesClick={() => setIsAskNotesOpen(true)}
                    onDeleteNote={handleDeleteNote}
                    onSelectNote={(note) => setSelectedNote(note)}
                    onSearchNotes={handleSearchNotes}
                  />
                </div>
              </div>

              {/* Right Column: Live Activity / Trace Panel (4 cols on XL screens) */}
              <div className="xl:col-span-4 sticky top-20">
                <TracePanel
                  toolCalls={toolCalls}
                  newestCallId={newestCallId}
                  className="h-[calc(100vh-6.5rem)]"
                />
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="max-w-5xl mx-auto">
              <TasksView
                tasks={tasks}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                onOpenAddTaskModal={() => setIsAddTaskOpen(true)}
              />
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="max-w-6xl mx-auto">
              <NotesView
                notes={notes}
                onAddNoteClick={() => setIsAddNoteOpen(true)}
                onAskNotesClick={() => setIsAskNotesOpen(true)}
                onDeleteNote={handleDeleteNote}
                onSelectNote={(note) => setSelectedNote(note)}
                onSearchNotes={handleSearchNotes}
              />
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="max-w-5xl mx-auto">
              <ActivityView
                toolCalls={toolCalls}
                newestCallId={newestCallId}
              />
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="max-w-5xl mx-auto">
              <InsightsView
                stats={stats}
                toolCalls={toolCalls}
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto">
              <SettingsView
                onResetDemo={() => setIsResetConfirmOpen(true)}
                isDark={isDark}
                toggleTheme={toggleTheme}
              />
            </div>
          )}
        </main>
      </div>

      {/* Modals & Dialogs */}
      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onAddTask={handleAddTask}
      />

      <AddNoteModal
        isOpen={isAddNoteOpen}
        onClose={() => setIsAddNoteOpen(false)}
        onAddNote={handleAddNote}
      />

      <AskNotesModal
        isOpen={isAskNotesOpen}
        onClose={() => setIsAskNotesOpen(false)}
        allNotes={notes}
        onSelectNote={(note) => setSelectedNote(note)}
      />

      <NoteDetailModal
        note={selectedNote}
        onClose={() => setSelectedNote(null)}
      />

      <ResetDemoModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmReset}
      />

      {/* Global Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default App;
