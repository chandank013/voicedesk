import React, { useState } from 'react';
import { X, Calendar, Flag, CheckSquare } from 'lucide-react';
import type { Priority } from '../types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (title: string, due?: string, priority?: Priority) => Promise<void>;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onAddTask
}) => {
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddTask(title.trim(), due.trim() || undefined, priority);
      setTitle('');
      setDue('');
      setPriority('medium');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200 dark:border-navy-700 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-navy-700/60">
          <div className="flex items-center gap-2 text-spruce dark:text-white">
            <CheckSquare className="w-5 h-5 text-tide" />
            <h3 className="font-bold text-base font-sans">New Task</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Task Title
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Call the bank or Finish hackathon demo"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl focus:bg-white dark:focus:bg-navy-850 focus:border-tide focus:ring-1 focus:ring-tide text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-tide" />
              <span>Due Date (natural language supported)</span>
            </label>
            <input
              type="text"
              value={due}
              onChange={(e) => setDue(e.target.value)}
              placeholder="e.g. Tomorrow 4pm, Today, or Oct 25"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl focus:bg-white dark:focus:bg-navy-850 focus:border-tide focus:ring-1 focus:ring-tide text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Flag className="w-3.5 h-3.5 text-signal" />
              <span>Priority Level</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                    priority === p
                      ? p === 'high'
                        ? 'bg-brick text-white border-brick'
                        : p === 'medium'
                        ? 'bg-signal text-white border-signal'
                        : 'bg-tide text-white border-tide'
                      : 'bg-slate-50 dark:bg-navy-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-navy-700 hover:bg-slate-100 dark:hover:bg-navy-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-navy-700/60 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isSubmitting}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-tide hover:bg-tide-hover disabled:opacity-50 text-white shadow-xs"
            >
              {isSubmitting ? 'Adding...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
