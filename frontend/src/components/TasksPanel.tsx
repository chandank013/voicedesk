import React, { useState } from 'react';
import {
  Plus,
  Check,
  MoreVertical,
  Trash2,
  Clock
} from 'lucide-react';
import type { Task, Priority } from '../types';

interface TasksPanelProps {
  tasks: Task[];
  onToggleTask: (id: number) => Promise<void>;
  onDeleteTask: (id: number) => Promise<void>;
  onOpenAddTaskModal: () => void;
}

export const TasksPanel: React.FC<TasksPanelProps> = ({
  tasks,
  onToggleTask,
  onDeleteTask,
  onOpenAddTaskModal
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'today', label: 'Today' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'completed', label: 'Completed' },
  ];

  const filteredTasks = tasks.filter((t) => {
    if (activeFilter === 'completed') return t.status === 'done';
    if (activeFilter === 'today') {
      const isDueToday = t.due_display?.toLowerCase().includes('today') || false;
      return t.status === 'open' && isDueToday;
    }
    if (activeFilter === 'upcoming') {
      const isDueToday = t.due_display?.toLowerCase().includes('today') || false;
      return t.status === 'open' && !isDueToday;
    }
    // 'all': show open first, then completed
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
    <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200/80 dark:border-navy-700/80 p-5 shadow-xs flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-navy-700/60">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-spruce dark:text-white font-sans">Tasks</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-700 text-slate-600 dark:text-slate-300 font-semibold font-mono">
              {tasks.filter(t => t.status === 'open').length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className="text-xs font-semibold text-tide hover:underline"
            >
              View all
            </button>
            <button
              onClick={onOpenAddTaskModal}
              className="px-2.5 py-1.5 rounded-lg bg-tide hover:bg-tide-hover text-white text-xs font-semibold flex items-center gap-1 shadow-2xs transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 mt-3 mb-4 overflow-x-auto pb-1 text-xs">
          {filterOptions.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                activeFilter === f.id
                  ? 'bg-spruce dark:bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-navy-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Task List Rows */}
        <div className="divide-y divide-slate-100 dark:divide-navy-700/60 -mx-1">
          {filteredTasks.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">
              No tasks found in this view.
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isDone = task.status === 'done';
              return (
                <div
                  key={task.id}
                  className={`group py-3 px-2 rounded-xl flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-navy-800/60 transition-colors ${
                    isDone ? 'opacity-65' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Custom Satisfying Checkbox */}
                    <button
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
                        className={`text-sm font-medium font-sans truncate transition-all ${
                          isDone
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-slate-100'
                        }`}
                      >
                        {task.title}
                      </p>

                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                        {task.due_display && (
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{task.due_display}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Priority Badge & Overflow Action */}
                  <div className="flex items-center gap-2 shrink-0">
                    {getPriorityBadge(task.priority)}

                    <div className="relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === task.id ? null : task.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-700 opacity-60 group-hover:opacity-100 transition-all"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuId === task.id && (
                        <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-navy-800 rounded-xl shadow-lg border border-slate-200 dark:border-navy-700 py-1 z-20 text-xs">
                          <button
                            onClick={() => {
                              onToggleTask(task.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300"
                          >
                            {isDone ? 'Mark as Open' : 'Mark as Done'}
                          </button>
                          <button
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
