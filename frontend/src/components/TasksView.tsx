import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Check,
  MoreVertical,
  Trash2,
  Clock
} from 'lucide-react';
import type { Task, Priority } from '../types';

interface TasksViewProps {
  tasks: Task[];
  onToggleTask: (id: number) => Promise<void>;
  onDeleteTask: (id: number) => Promise<void>;
  onOpenAddTaskModal: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onToggleTask,
  onDeleteTask,
  onOpenAddTaskModal
}) => {
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'completed' | 'high'>('all');
  const [search, setSearch] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  const openCount = tasks.filter((t) => t.status === 'open').length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;
  const todayCount = tasks.filter((t) => t.status === 'open' && t.due_display?.toLowerCase().includes('today')).length;

  const filteredTasks = tasks.filter((t) => {
    if (search.trim() && !t.title.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filter === 'completed') return t.status === 'done';
    if (filter === 'high') return t.status === 'open' && t.priority === 'high';
    if (filter === 'today') {
      return t.status === 'open' && (t.due_display?.toLowerCase().includes('today') || false);
    }
    if (filter === 'upcoming') {
      return t.status === 'open' && !(t.due_display?.toLowerCase().includes('today') || false);
    }
    return true;
  });

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brick/10 dark:bg-brick/20 text-brick dark:text-rose-400 border border-brick/20">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-signal/10 dark:bg-signal/20 text-signal dark:text-amber-400 border border-signal/20">
            Medium
          </span>
        );
      case 'low':
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-tide/10 dark:bg-tide/20 text-tide dark:text-cyan-400 border border-tide/20">
            Low
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200/80 dark:border-navy-700/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-tide/10 text-tide">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-spruce dark:text-white font-sans">
                Task Management
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Organize, filter, and complete commitments made via voice or text.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="px-3 py-1.5 rounded-xl bg-tide/10 text-tide border border-tide/20">
              {openCount} Open
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-brick/10 text-brick border border-brick/20">
              {todayCount} Due Today
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-750 text-slate-600 dark:text-slate-300">
              {doneCount} Completed
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenAddTaskModal}
            className="px-3.5 py-2 rounded-xl bg-tide hover:bg-tide-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-navy-850 p-4 rounded-2xl border border-slate-200/80 dark:border-navy-700/80">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
          {(
            [
              { id: 'all', label: 'All Tasks' },
              { id: 'today', label: 'Due Today' },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'high', label: 'High Priority' },
              { id: 'completed', label: 'Completed' }
            ] as const
          ).map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                filter === item.id
                  ? 'bg-spruce dark:bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-navy-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl focus:bg-white dark:focus:bg-navy-850 focus:border-tide focus:ring-1 focus:ring-tide text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200/80 dark:border-navy-700/80 p-5 shadow-xs">
        <div className="divide-y divide-slate-100 dark:divide-navy-700/60">
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              No tasks match your current filter. Say "Add [task title]" to create one.
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isDone = task.status === 'done';
              return (
                <div
                  key={task.id}
                  className={`group py-3.5 px-3 rounded-xl flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-navy-800/60 transition-colors ${
                    isDone ? 'opacity-65' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => onToggleTask(task.id)}
                      role="checkbox"
                      aria-checked={isDone}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 dark:border-navy-600 hover:border-tide dark:hover:border-indigo-400 bg-white dark:bg-navy-800'
                      }`}
                    >
                      {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-semibold font-sans truncate transition-all ${
                          isDone
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-slate-100'
                        }`}
                      >
                        {task.title}
                      </p>

                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        {task.due_display && (
                          <span className="flex items-center gap-1 font-medium text-slate-500 dark:text-slate-400">
                            <Clock className="w-3 h-3 text-tide" />
                            <span>{task.due_display}</span>
                          </span>
                        )}
                        <span>•</span>
                        <span>Created {new Date(task.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {getPriorityBadge(task.priority)}

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setActiveMenuId(activeMenuId === task.id ? null : task.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-700 transition-all"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuId === task.id && (
                        <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-navy-800 rounded-xl shadow-lg border border-slate-200 dark:border-navy-700 py-1 z-20 text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              onToggleTask(task.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300"
                          >
                            {isDone ? 'Mark as Open' : 'Mark as Done'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteTask(task.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-1.5 text-left hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
