import React from 'react';
import { X, FileText, Tag } from 'lucide-react';
import type { Note } from '../types';

interface NoteDetailModalProps {
  note: Note | null;
  onClose: () => void;
}

export const NoteDetailModal: React.FC<NoteDetailModalProps> = ({ note, onClose }) => {
  if (!note) return null;

  const tagList = Array.isArray(note.tags)
    ? note.tags
    : typeof note.tags === 'string'
    ? note.tags.split(',').filter(Boolean)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200 dark:border-navy-700 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-navy-700/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-lilac/10 text-lilac border border-lilac/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-spruce dark:text-white font-sans">
                {note.title}
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Note #{note.id}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200/80 dark:border-navy-700">
            <p className="text-sm font-serif text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
              {note.text}
            </p>
          </div>

          {tagList.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              {tagList.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-navy-700"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}

          <div className="pt-2 text-right">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
