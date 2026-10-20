import React, { useState } from 'react';
import { X, Sparkles, Send, BookOpen } from 'lucide-react';
import { recallNotes } from '../api/client';
import type { Note } from '../types';

interface AskNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  allNotes: Note[];
  onSelectNote: (note: Note) => void;
}

export const AskNotesModal: React.FC<AskNotesModalProps> = ({
  isOpen,
  onClose,
  allNotes,
  onSelectNote
}) => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    answer: string;
    sources: number[];
    speech: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await recallNotes(question.trim());
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to query Amazon Bedrock');
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQuestions = [
    "What did I note about SQLite?",
    "What is our cloud budget plan?",
    "What are the ideas for Alexa+ features?",
    "What are the core design tokens?"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200 dark:border-navy-700 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-navy-700/60 bg-gradient-to-r from-indigo-50/50 to-violet-50/50 dark:from-navy-900 dark:to-indigo-950/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-spruce dark:text-white font-sans">
                Ask Your Notes
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Powered by Amazon Bedrock Converse API
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <form onSubmit={handleAsk} className="flex gap-2">
            <input
              type="text"
              autoFocus
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. What did I note about SQLite?"
              className="flex-1 px-3.5 py-2 text-sm bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl focus:bg-white dark:focus:bg-navy-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            />
            <button
              type="submit"
              disabled={!question.trim() || isLoading}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
            >
              {isLoading ? 'Thinking...' : 'Ask'}
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Suggestions */}
          {!result && !isLoading && (
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Example questions
              </p>
              <div className="flex flex-wrap gap-1.5">
                {sampleQuestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      setQuestion(q);
                    }}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-navy-800 hover:bg-indigo-50 dark:hover:bg-navy-700 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-navy-700 transition-colors text-left"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Result Card */}
          {result && (
            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-navy-800/80 border border-indigo-100 dark:border-navy-700">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Bedrock Recall Summary</span>
                </div>
                <p className="text-sm font-serif text-slate-800 dark:text-slate-100 leading-relaxed italic">
                  "{result.answer}"
                </p>
              </div>

              {/* Cited Sources */}
              {result.sources.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    Cited Sources:
                  </p>
                  <div className="space-y-1.5">
                    {result.sources.map((sourceId) => {
                      const matchedNote = allNotes.find((n) => n.id === sourceId);
                      if (!matchedNote) return null;
                      return (
                        <div
                          key={sourceId}
                          onClick={() => {
                            onClose();
                            onSelectNote(matchedNote);
                          }}
                          className="cursor-pointer p-2.5 rounded-lg bg-slate-50 dark:bg-navy-800 hover:bg-slate-100 dark:hover:bg-navy-750 border border-slate-200 dark:border-navy-700 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-3.5 h-3.5 text-tide" />
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              [Note #{sourceId}] {matchedNote.title}
                            </span>
                          </div>
                          <span className="text-[11px] text-tide hover:underline">View note →</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
