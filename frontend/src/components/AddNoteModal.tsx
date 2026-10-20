import React, { useState } from 'react';
import { X, FileText, Tag } from 'lucide-react';

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNote: (text: string, tags?: string[], title?: string) => Promise<void>;
}

export const AddNoteModal: React.FC<AddNoteModalProps> = ({
  isOpen,
  onClose,
  onAddNote
}) => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await onAddNote(text.trim(), tags.length ? tags : undefined, title.trim() || undefined);
      setTitle('');
      setText('');
      setTagsInput('');
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
            <FileText className="w-5 h-5 text-lilac" />
            <h3 className="font-bold text-base font-sans">New Note</h3>
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
              Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Use SQLite for the demo"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl focus:bg-white dark:focus:bg-navy-850 focus:border-lilac focus:ring-1 focus:ring-lilac text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Note Content
            </label>
            <textarea
              required
              autoFocus
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Dictate or type your note thoughts here..."
              className="w-full px-3.5 py-2 text-sm font-serif bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl focus:bg-white dark:focus:bg-navy-850 focus:border-lilac focus:ring-1 focus:ring-lilac text-slate-900 dark:text-slate-100 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-lilac" />
              <span>Tags (comma-separated)</span>
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. architecture, database, hackathon"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl focus:bg-white dark:focus:bg-navy-850 focus:border-lilac focus:ring-1 focus:ring-lilac text-slate-900 dark:text-slate-100"
            />
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
              disabled={!text.trim() || isSubmitting}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-lilac hover:opacity-90 disabled:opacity-50 text-white shadow-xs"
            >
              {isSubmitting ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
