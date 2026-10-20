import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Copy,
  Check
} from 'lucide-react';
import type { ToolCall } from '../types';

interface TracePanelProps {
  toolCalls: ToolCall[];
  newestCallId?: number | null;
  className?: string;
}

export const TracePanel: React.FC<TracePanelProps> = ({
  toolCalls,
  newestCallId,
  className = ''
}) => {
  const [filterSource, setFilterSource] = useState<'all' | 'mcp' | 'simulator' | 'ui'>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const filteredCalls = toolCalls.filter((call) => {
    if (filterSource === 'all') return true;
    return call.source.toLowerCase() === filterSource;
  });

  const handleCopyJson = (call: ToolCall, e: React.MouseEvent) => {
    e.stopPropagation();
    const payload = {
      tool: call.tool,
      utterance: call.utterance,
      args: call.args_json ? JSON.parse(call.args_json) : {},
      result: call.result_json ? JSON.parse(call.result_json) : {},
      speech: call.speech,
      latency_ms: call.latency_ms,
      ok: call.ok
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedId(call.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div
      aria-live="polite"
      className={`bg-navy-950 border border-navy-700/80 rounded-2xl flex flex-col h-full shadow-lg text-slate-200 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-navy-700/60 bg-navy-900/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-tight text-white font-sans">Live Activity</h3>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Watch every tool call happen in real time.
              </p>
            </div>
          </div>

          <span className="text-xs font-mono text-slate-400 bg-navy-800/80 px-2 py-1 rounded-md border border-navy-700">
            {filteredCalls.length} calls
          </span>
        </div>

        {/* Source Filter Chips */}
        <div className="flex items-center gap-1.5 mt-3 text-[11px]">
          {(['all', 'mcp', 'simulator', 'ui'] as const).map((src) => (
            <button
              key={src}
              onClick={() => setFilterSource(src)}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                filterSource === src
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'bg-navy-850 text-slate-400 hover:text-slate-200 hover:bg-navy-800 border border-navy-700/60'
              }`}
            >
              {src.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Feed Timeline */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredCalls.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No activity recorded yet for this source.
          </div>
        ) : (
          filteredCalls.map((call, idx) => {
            const isNew = call.id === newestCallId;
            const isExpanded = expandedId === call.id;

            let parsedArgs: any = null;
            let parsedResult: any = null;
            try {
              if (call.args_json) parsedArgs = JSON.parse(call.args_json);
              if (call.result_json) parsedResult = JSON.parse(call.result_json);
            } catch {
              // Ignore parse errors
            }

            return (
              <div
                key={call.id}
                className={`relative pl-6 pb-2 transition-all rounded-xl ${
                  isNew ? 'animate-trace-flash' : ''
                }`}
              >
                {/* Vertical Timeline Guide Line */}
                {idx !== filteredCalls.length - 1 && (
                  <span className="absolute left-[9px] top-6 bottom-0 w-0.5 bg-navy-700/70" />
                )}

                {/* Timeline Dot Indicator */}
                <span
                  className={`absolute left-0 top-1.5 w-5 h-5 rounded-full flex items-center justify-center border ${
                    call.ok
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                  }`}
                >
                  {call.ok ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-2.5 h-2.5" />
                  )}
                </span>

                {/* Trace Card */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : call.id)}
                  className={`cursor-pointer p-3.5 rounded-xl border transition-all text-xs ${
                    isExpanded
                      ? 'bg-navy-900 border-indigo-500/50 shadow-md'
                      : 'bg-navy-900/60 hover:bg-navy-850 border-navy-700/70 hover:border-navy-600'
                  }`}
                >
                  {/* Top Row: Tool Name, Source Badge, Latency, Timestamp */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-indigo-300 bg-indigo-950/60 border border-indigo-700/50 px-2 py-0.5 rounded text-[11px]">
                        {call.tool}
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 bg-navy-800 px-1.5 py-0.5 rounded border border-navy-700">
                        {call.source}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="font-mono text-amber-400/90 font-medium">
                        {call.latency_ms} ms
                      </span>
                      <span className="text-slate-500">•</span>
                      <span>{formatTime(call.created_at)}</span>
                    </div>
                  </div>

                  {/* Utterance Spoken Sentence */}
                  {call.utterance && (
                    <p className="font-serif italic text-sm text-slate-200 mb-1.5 leading-snug">
                      "{call.utterance}"
                    </p>
                  )}

                  {/* Speech Result / Spoken Reply */}
                  {call.speech && (
                    <div className="flex items-start gap-1.5 text-slate-300 font-sans text-xs bg-navy-950/60 p-2 rounded-lg border border-navy-800">
                      <span className="text-emerald-400 font-semibold shrink-0">Voice:</span>
                      <span className="leading-relaxed">{call.speech}</span>
                    </div>
                  )}

                  {/* Expand Toggle */}
                  <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-navy-800/80 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300">
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      <span>{isExpanded ? 'Hide Raw JSON' : 'Inspect MCP Payload'}</span>
                    </span>

                    {isExpanded && (
                      <button
                        onClick={(e) => handleCopyJson(call, e)}
                        className="flex items-center gap-1 text-slate-400 hover:text-white px-2 py-0.5 rounded bg-navy-800 hover:bg-navy-700 transition-colors"
                      >
                        {copiedId === call.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy JSON</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Expanded JSON Inspector */}
                  {isExpanded && (
                    <div className="mt-3 space-y-2 pt-2 border-t border-navy-800 font-mono text-[11px]">
                      {parsedArgs && (
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">
                            Arguments
                          </p>
                          <pre className="bg-navy-950 p-2.5 rounded-lg border border-navy-800 text-cyan-300 overflow-x-auto">
                            {JSON.stringify(parsedArgs, null, 2)}
                          </pre>
                        </div>
                      )}

                      {parsedResult && (
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">
                            Result Payload
                          </p>
                          <pre className="bg-navy-950 p-2.5 rounded-lg border border-navy-800 text-emerald-300 overflow-x-auto">
                            {JSON.stringify(parsedResult, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
