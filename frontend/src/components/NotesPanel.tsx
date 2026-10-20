import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2
} from 'lucide-react';
import type { Note } from '../types';

interface NotesPanelProps {
  notes: Note[];
  onAddNoteClick: () => void;
  onAskNotesClick: () => void;
  onDeleteNote: (id: number) => Promise<void>;
  onSelectNote: (note: Note) => void;
  onSearchNotes: (query: string) => void;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({
  notes,
  onAddNoteClick,
  onAskNotesClick,
  onDeleteNote,
  onSelectNote,
  onSearchNotes
}) => {
  const [localSearch, setLocalSearch] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
    onSearchNotes(val);
  };

  // Color schemes for note document icons
  const iconColors = [
    'text-lilac bg-lilac/10 border-lilac/20',
    'text-tide bg-tide/10 border-tide/20',
    'text-signal bg-signal/10 border-signal/20',
    'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    'text-rose-500 bg-rose-500/10 border-rose-500/20'
  ];

  return (
    <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200/80 dark:border-navy-700/80 p-5 shadow-xs flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-navy-700/60">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-spruce dark:text-white font-sans">Notes</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-700 text-slate-600 dark:text-slate-300 font-semibold font-mono">
              {notes.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Ask Your Notes Bedrock Button */}
            <button
              onClick={onAskNotesClick}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1.5 border border-indigo-200/60 dark:border-indigo-800/50 transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Ask Bedrock</span>
            </button>

            <button
              onClick={onAddNoteClick}
              className="px-2.5 py-1.5 rounded-lg bg-spruce dark:bg-indigo-600 hover:bg-spruce-light text-white text-xs font-semibold flex items-center gap-1 shadow-2xs transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Note</span>
            </button>
          </div>
        </div>

        {/* Note Search Input */}
        <div className="relative mt-3 mb-3">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={localSearch}
            onChange={handleSearchChange}
            placeholder="Search notes or filter by tag..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-lg focus:bg-white dark:focus:bg-navy-850 focus:border-tide focus:ring-1 focus:ring-tide text-slate-800 dark:text-slate-200"
          />
        </div>

        {/* Note Rows */}
        <div className="divide-y divide-slate-100 dark:divide-navy-700/60 -mx-1">
          {notes.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">
              No notes captured yet. Say "Note: ..." to capture one hands-free.
            </div>
          ) : (
            notes.slice(0, 5).map((note, index) => {
              const colorClass = iconColors[index % iconColors.length];
              const tagList = Array.isArray(note.tags)
                ? note.tags
                : typeof note.tags === 'string'
                ? note.tags.split(',').filter(Boolean)
                : [];

              return (
                <div
                  key={note.id}
                  onClick={() => onSelectNote(note)}
                  className="group py-3 px-2 rounded-xl flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-navy-800/60 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${colorClass}`}>
                      <FileText className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold font-serif text-slate-800 dark:text-slate-100 truncate group-hover:text-tide dark:group-hover:text-cyan-400 transition-colors">
                        {note.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-sans">
                        {note.text}
                      </p>
                    </div>
                  </div>

                  {/* Tags and Delete Action */}
                  <div className="flex items-center gap-2 shrink-0">
                    {tagList.length > 0 && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-navy-700">
                        <Tag className="w-2.5 h-2.5" />
                        <span>{tagList[0]}</span>
                      </span>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteNote(note.id);
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {notes.length > 5 && (
        <div className="pt-2 text-center">
          <span className="text-xs text-slate-400">
            Showing top 5 of {notes.length} notes
          </span>
        </div>
      )}
    </div>
  );
};
