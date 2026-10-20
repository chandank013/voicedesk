import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Send,
  Sparkles,
  PlusCircle,
  FilePlus,
  ListTodo,
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface HeroSectionProps {
  onExecuteUtterance: (utterance: string) => Promise<void>;
  isProcessing: boolean;
  latestInteraction?: {
    utterance: string;
    speech: string;
    tool?: string;
  };
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExecuteUtterance,
  isProcessing,
  latestInteraction
}) => {
  const [textInput, setTextInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Web Speech API recognition reference
  const recognitionRef = useRef<any>(null);

  // Keyboard shortcut '/' to focus speak bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setRecognitionError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setTextInput(transcript);
          onExecuteUtterance(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setRecognitionError('Microphone access denied. You can type commands below.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [onExecuteUtterance]);

  const handleMicClick = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        setIsListening(false);
      }
    } else {
      // Fallback demo utterance when speech recognition is not available in browser
      const defaultUtterances = [
        "Add call the bank tomorrow",
        "What's on my list today?",
        "Note: use SQLite for the demo",
        "What did I note about SQLite?",
        "Mark call the bank done"
      ];
      const randomPrompt = defaultUtterances[Math.floor(Math.random() * defaultUtterances.length)];
      setTextInput(randomPrompt);
      onExecuteUtterance(randomPrompt);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || isProcessing) return;
    onExecuteUtterance(textInput.trim());
    setTextInput('');
  };

  const handleSuggestionClick = (prompt: string) => {
    setTextInput(prompt);
    onExecuteUtterance(prompt);
  };

  // Conversational bubbles data (defaults to reference image)
  const displayUserUtterance = latestInteraction?.utterance || "Add call the bank tomorrow";
  const displayAssistantReply = latestInteraction?.speech || "Added: Call the bank";
  const displayDueDate = latestInteraction?.tool === 'add_task' ? "Due: Wed, Oct 21" : null;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-navy-700/80 bg-gradient-to-br from-[#EBF3FA] via-[#EDE9FE] to-[#FEE2E2] dark:from-navy-900 dark:via-indigo-950/40 dark:to-navy-850 p-6 sm:p-8 shadow-sm">
      {/* Soft Glow Orbs */}
      <div className="absolute -top-12 -left-12 w-64 h-64 bg-indigo-300/30 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-rose-200/40 dark:bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Heading, Supporting Text, Suggestion Buttons */}
        <div className="lg:col-span-4 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 dark:bg-navy-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-navy-700 text-xs font-semibold text-tide dark:text-cyan-400 mb-3.5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-signal" />
            <span>Voice-First Assistant</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-spruce dark:text-white font-sans">
            Talk to VoiceDesk
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
            Add tasks, capture notes, search your thoughts and get things done — just by speaking.
          </p>

          {/* Suggestion Buttons */}
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={() => handleSuggestionClick("Add call the bank tomorrow")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-white/90 dark:bg-navy-800 text-spruce dark:text-slate-200 hover:bg-white dark:hover:bg-navy-700 border border-slate-200/90 dark:border-navy-700 shadow-2xs hover:shadow-xs transition-all active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5 text-tide" />
              <span>Add a task</span>
            </button>
            <button
              onClick={() => handleSuggestionClick("Note: use SQLite for the demo")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-white/90 dark:bg-navy-800 text-spruce dark:text-slate-200 hover:bg-white dark:hover:bg-navy-700 border border-slate-200/90 dark:border-navy-700 shadow-2xs hover:shadow-xs transition-all active:scale-95"
            >
              <FilePlus className="w-3.5 h-3.5 text-lilac" />
              <span>Save a note</span>
            </button>
            <button
              onClick={() => handleSuggestionClick("What's on my list today?")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-white/90 dark:bg-navy-800 text-spruce dark:text-slate-200 hover:bg-white dark:hover:bg-navy-700 border border-slate-200/90 dark:border-navy-700 shadow-2xs hover:shadow-xs transition-all active:scale-95"
            >
              <ListTodo className="w-3.5 h-3.5 text-indigo-500" />
              <span>What's on my list?</span>
            </button>
          </div>
        </div>

        {/* Center Column: Glowing Microphone Interface & Waveform */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            {/* Outer Translucent Pulse Ring 1 */}
            <div
              className={`absolute w-36 h-36 rounded-full transition-all duration-700 ${
                isListening || isProcessing
                  ? 'bg-indigo-400/30 scale-125 animate-pulse'
                  : 'bg-indigo-300/20 dark:bg-indigo-500/10 scale-105'
              }`}
            />
            {/* Outer Translucent Pulse Ring 2 */}
            <div
              className={`absolute w-28 h-28 rounded-full transition-all duration-500 ${
                isListening || isProcessing
                  ? 'bg-violet-400/40 scale-115'
                  : 'bg-violet-300/25 dark:bg-violet-500/15 scale-100'
              }`}
            />

            {/* Glowing Interactive Microphone Button */}
            <button
              onClick={handleMicClick}
              disabled={isProcessing}
              aria-label={isListening ? "Stop listening" : "Start speaking"}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl active:scale-95 ${
                isListening
                  ? 'bg-gradient-to-tr from-rose-500 to-indigo-600 text-white shadow-rose-500/40 ring-4 ring-rose-400/40 animate-pulse'
                  : 'bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-indigo-600/35 hover:shadow-indigo-600/50 hover:scale-105'
              }`}
            >
              {isListening ? (
                <Mic className="w-8 h-8 animate-bounce" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>
          </div>

          {/* Status Label & Waveform */}
          <div className="mt-4 flex flex-col items-center">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isListening
                    ? 'bg-rose-500 animate-ping'
                    : isProcessing
                    ? 'bg-signal animate-pulse'
                    : 'bg-emerald-500'
                }`}
              />
              <span className="text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-200">
                {isListening
                  ? 'Listening to you...'
                  : isProcessing
                  ? 'Processing tool call...'
                  : 'Ready to listen'}
              </span>
            </div>

            {/* Animated Waveform Visualization */}
            <div className="flex items-center gap-1 mt-2 h-6 px-3 py-1 rounded-full bg-white/60 dark:bg-navy-800/60 backdrop-blur-xs border border-slate-200/50 dark:border-navy-700">
              <span className={`w-1 bg-indigo-500 rounded-full transition-all duration-200 ${isListening ? 'h-5 animate-pulse' : 'h-2'}`} />
              <span className={`w-1 bg-violet-500 rounded-full transition-all duration-200 ${isListening ? 'h-6 animate-pulse delay-75' : 'h-3.5'}`} />
              <span className={`w-1 bg-cyan-500 rounded-full transition-all duration-200 ${isListening ? 'h-4 animate-pulse delay-150' : 'h-2'}`} />
              <span className={`w-1 bg-indigo-500 rounded-full transition-all duration-200 ${isListening ? 'h-6 animate-pulse delay-100' : 'h-4'}`} />
              <span className={`w-1 bg-violet-500 rounded-full transition-all duration-200 ${isListening ? 'h-3 animate-pulse delay-200' : 'h-1.5'}`} />
            </div>

            {recognitionError && (
              <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{recognitionError}</p>
            )}
          </div>
        </div>

        {/* Right Column: Conversational Feedback Bubbles */}
        <div className="lg:col-span-4 flex flex-col gap-3 justify-center">
          {/* User Request Bubble */}
          <div className="self-end max-w-xs sm:max-w-sm rounded-2xl rounded-tr-xs bg-indigo-600 text-white p-3.5 shadow-md shadow-indigo-600/10 text-right">
            <p className="text-[11px] font-medium text-indigo-200 mb-0.5">Spoken command</p>
            <p className="text-sm font-medium font-serif italic">"{displayUserUtterance}"</p>
          </div>

          {/* Assistant Confirmation Bubble */}
          <div className="self-start max-w-xs sm:max-w-sm rounded-2xl rounded-tl-xs bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 p-3.5 shadow-md shadow-slate-200/50 dark:shadow-none text-left">
            <div className="flex items-center gap-1.5 mb-1 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold">VoiceDesk Confirmed</span>
            </div>
            <p className="text-sm font-semibold text-spruce dark:text-white font-sans">
              {displayAssistantReply}
            </p>
            {displayDueDate && (
              <div className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <Calendar className="w-3 h-3 text-tide" />
                <span>{displayDueDate}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sleek Text Input Bar at bottom of Hero */}
      <div className="mt-6 pt-5 border-t border-slate-200/60 dark:border-navy-700/60">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={isProcessing}
              placeholder="Say or type anything (e.g. 'Add call the bank tomorrow' or 'What's due today?')..."
              className="w-full pl-4 pr-12 py-2.5 text-sm bg-white/90 dark:bg-navy-800 border border-slate-300/80 dark:border-navy-700 rounded-xl focus:bg-white dark:focus:bg-navy-850 focus:border-tide focus:ring-2 focus:ring-tide/20 shadow-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 transition-all"
            />
            <span className="hidden sm:inline-block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-navy-700 text-slate-400 border border-slate-200 dark:border-navy-600">
              /
            </span>
          </div>

          <button
            type="submit"
            disabled={!textInput.trim() || isProcessing}
            className="px-4 py-2.5 rounded-xl bg-tide hover:bg-tide-hover disabled:opacity-50 disabled:pointer-events-none text-white text-sm font-semibold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
          >
            <span>Execute</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </section>
  );
};
