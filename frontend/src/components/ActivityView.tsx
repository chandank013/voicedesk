import React, { useState } from 'react';
import {
  Activity,
  Search,
  ChevronDown,
  ChevronRight,
  Copy,
  Check
} from 'lucide-react';
import type { ToolCall } from '../types';

interface ActivityViewProps {
  toolCalls: ToolCall[];
  newestCallId?: number | null;
}

export const ActivityView: React.FC<ActivityViewProps> = ({
  toolCalls,
  newestCallId
}) => {
  const [filterSource, setFilterSource] = useState<'all' | 'mcp' | 'simulator' | 'ui'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const filtered = toolCalls.filter((call) => {
    if (filterSource !== 'all' && call.source.toLowerCase() !== filterSource) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchUtterance = call.utterance?.toLowerCase().includes(q) || false;
      const matchTool = call.tool.toLowerCase().includes(q);
      const matchSpeech = call.speech?.toLowerCase().includes(q) || false;
      return matchUtterance || matchTool || matchSpeech;
    }
    return true;
  });

  const avgLatency = toolCalls.length
    ? Math.round(toolCalls.reduce((acc, c) => acc + c.latency_ms, 0) / toolCalls.length)
    : 0;

  const successRate = toolCalls.length
    ? Math.round((toolCalls.filter((c) => c.ok).length / toolCalls.length) * 100)
    : 100;

  const handleCopy = (call: ToolCall, e: React.MouseEvent) => {
    e.stopPropagation();
    const data = {
      tool: call.tool,
      utterance: call.utterance,
      args: call.args_json ? JSON.parse(call.args_json) : {},
      result: call.result_json ? JSON.parse(call.result_json) : {},
      speech: call.speech,
      latency_ms: call.latency_ms,
      ok: call.ok
    };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedId(call.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-navy-950 rounded-2xl border border-navy-700/80 p-6 shadow-xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight font-sans">
                  Live Activity & MCP Telemetry
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  STREAMING
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time execution log of every Model Context Protocol tool call.
              </p>
            </div>
          </div>
        </div>

        {/* Telemetry Stats */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3.5 py-2 rounded-xl bg-navy-900 border border-navy-700">
            <span className="text-slate-400 block text-[10px]">TOTAL CALLS</span>
            <span className="text-lg font-bold text-white">{toolCalls.length}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-navy-900 border border-navy-700">
            <span className="text-slate-400 block text-[10px]">AVG LATENCY</span>
            <span className="text-lg font-bold text-amber-400">{avgLatency} ms</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-navy-900 border border-navy-700">
            <span className="text-slate-400 block text-[10px]">SUCCESS RATE</span>
            <span className="text-lg font-bold text-emerald-400">{successRate}%</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-navy-900 p-4 rounded-2xl border border-navy-700/80 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'mcp', 'simulator', 'ui'] as const).map((src) => (
            <button
              type="button"
              key={src}
              onClick={() => setFilterSource(src)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                filterSource === src
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'bg-navy-850 text-slate-400 hover:text-white hover:bg-navy-800 border border-navy-700'
              }`}
            >
              {src.toUpperCase()} SOURCE
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by utterance, tool, or reply..."
            className="w-full pl-8 pr-3 py-1.5 bg-navy-950 border border-navy-700 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Main Activity Timeline Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400 bg-navy-950 rounded-2xl border border-navy-700/80">
            No tool call logs found matching your criteria.
          </div>
        ) : (
          filtered.map((call) => {
            const isNew = call.id === newestCallId;
            const isExpanded = expandedId === call.id;

            let parsedArgs: any = null;
            let parsedResult: any = null;
            try {
              if (call.args_json) parsedArgs = JSON.parse(call.args_json);
              if (call.result_json) parsedResult = JSON.parse(call.result_json);
            } catch {
              // Ignore
            }

            return (
              <div
                key={call.id}
                onClick={() => setExpandedId(isExpanded ? null : call.id)}
                className={`cursor-pointer rounded-2xl border transition-all text-xs p-5 ${
                  isNew ? 'animate-trace-flash' : ''
                } ${
                  isExpanded
                    ? 'bg-navy-900 border-indigo-500/60 shadow-xl'
                    : 'bg-navy-950 hover:bg-navy-900/80 border-navy-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        call.ok ? 'bg-emerald-400' : 'bg-rose-500'
                      }`}
                    />
                    <span className="font-mono text-sm font-bold text-indigo-300 bg-indigo-950/80 border border-indigo-800/60 px-2.5 py-0.5 rounded-lg">
                      {call.tool}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-navy-800 px-2 py-0.5 rounded border border-navy-700">
                      {call.source}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-400 font-mono text-xs">
                    <span className="text-amber-400 font-semibold">{call.latency_ms} ms</span>
                    <span>•</span>
                    <span>{new Date(call.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>

                {call.utterance && (
                  <p className="font-serif italic text-base text-slate-100 mb-2 leading-snug">
                    "{call.utterance}"
                  </p>
                )}

                {call.speech && (
                  <div className="p-3 rounded-xl bg-navy-900/90 border border-navy-800 text-slate-300 font-sans flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">Assistant Spoke:</span>
                    <span>{call.speech}</span>
                  </div>
                )}

                <div className="mt-3 pt-2.5 border-t border-navy-800/80 flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    <span>{isExpanded ? 'Hide Raw JSON Inspector' : 'Inspect Input Arguments & Result Payloads'}</span>
                  </span>

                  {isExpanded && (
                    <button
                      type="button"
                      onClick={(e) => handleCopy(call, e)}
                      className="flex items-center gap-1.5 text-slate-300 hover:text-white px-3 py-1 rounded-lg bg-navy-800 hover:bg-navy-700 transition-colors"
                    >
                      {copiedId === call.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Payload</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {isExpanded && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[11px] pt-3 border-t border-navy-800">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5 font-bold">
                        Input Parameters
                      </p>
                      <pre className="bg-navy-950 p-3 rounded-xl border border-navy-800 text-cyan-300 overflow-x-auto">
                        {JSON.stringify(parsedArgs, null, 2)}
                      </pre>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5 font-bold">
                        Execution Output
                      </p>
                      <pre className="bg-navy-950 p-3 rounded-xl border border-navy-800 text-emerald-300 overflow-x-auto">
                        {JSON.stringify(parsedResult, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
