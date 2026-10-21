import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Sparkles,
  Trash2
} from 'lucide-react';
import type { Note } from '../types';

interface NotesViewProps {
  notes: Note[];
  onAddNoteClick: () => void;
  onAskNotesClick: () => void;
  onDeleteNote: (id: number) => Promise<void>;
  onSelectNote: (note: Note) => void;
  onSearchNotes: (query: string) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  onAddNoteClick,
  onAskNotesClick,
  onDeleteNote,
  onSelectNote,
  onSearchNotes
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract all distinct tags
  const allTags = Array.from(
    new Set(
      notes.flatMap((n) => {
        if (Array.isArray(n.tags)) return n.tags;
        if (typeof n.tags === 'string') return n.tags.split(',').map((t) => t.trim()).filter(Boolean);
        return [];
      })
    )
  );

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      searchTerm.trim() === '' ||
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.text.toLowerCase().includes(searchTerm.toLowerCase());

    const noteTags = Array.isArray(n.tags)
      ? n.tags
      : typeof n.tags === 'string'
      ? n.tags.split(',').map((t) => t.trim())
      : [];

    const matchesTag = selectedTag === null || noteTags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200/80 dark:border-navy-700/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-lilac/10 text-lilac">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-spruce dark:text-white font-sans">
              Notes & Knowledge
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Dictate thoughts, capture architectural notes, and query them with Amazon Bedrock.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onAskNotesClick}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1.5 border border-indigo-200/60 dark:border-indigo-800/50 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Ask Bedrock Recall</span>
          </button>

          <button
            type="button"
            onClick={onAddNoteClick}
            className="px-3.5 py-2 rounded-xl bg-spruce dark:bg-indigo-600 hover:bg-spruce-light text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Note</span>
          </button>
        </div>
      </div>

      {/* Tag Filters and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-navy-850 p-4 rounded-2xl border border-slate-200/80 dark:border-navy-700/80">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              selectedTag === null
                ? 'bg-spruce dark:bg-indigo-600 text-white shadow-xs font-semibold'
                : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-navy-700'
            }`}
          >
            All Notes ({notes.length})
          </button>
          {allTags.slice(0, 8).map((tag) => (
            <button
              type="button"
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                selectedTag === tag
                  ? 'bg-lilac text-white shadow-xs font-semibold'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-navy-700'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onSearchNotes(e.target.value);
            }}
            placeholder="Search notes..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl focus:bg-white dark:focus:bg-navy-850 focus:border-lilac focus:ring-1 focus:ring-lilac text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full py-16 text-center text-sm text-slate-400 bg-white dark:bg-navy-850 rounded-2xl border border-slate-200/80 dark:border-navy-700/80">
            No notes found. Say "Note: [content]" or click "Add Note" above.
          </div>
        ) : (
          filteredNotes.map((note) => {
            const tagList = Array.isArray(note.tags)
              ? note.tags
              : typeof note.tags === 'string'
              ? note.tags.split(',').map((t) => t.trim()).filter(Boolean)
              : [];

            return (
              <div
                key={note.id}
                onClick={() => onSelectNote(note)}
                className="group cursor-pointer p-5 rounded-2xl bg-white dark:bg-navy-850 border border-slate-200/80 dark:border-navy-700/80 hover:border-lilac/50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-navy-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-navy-700">
                      Note #{note.id}
                    </span>

                    <button
                      type="button"
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

                  <h3 className="font-bold text-base font-serif text-slate-900 dark:text-white group-hover:text-lilac transition-colors leading-snug">
                    {note.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 font-sans mt-2 line-clamp-4 leading-relaxed">
                    {note.text}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-700/60 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {tagList.slice(0, 2).map((t, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-lilac/10 text-lilac border border-lilac/20"
                      >
                        #{t}
                      </span>
                    ))}
                    {tagList.length > 2 && (
                      <span className="text-[10px] text-slate-400">
                        +{tagList.length - 2}
                      </span>
                    )}
                  </div>

                  <span>{new Date(note.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
