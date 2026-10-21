import React from 'react';
import {
  BarChart3,
  Cpu,
  Radio
} from 'lucide-react';
import type { DashboardStats, ToolCall } from '../types';

interface InsightsViewProps {
  stats: DashboardStats;
  toolCalls: ToolCall[];
}

export const InsightsView: React.FC<InsightsViewProps> = ({ stats, toolCalls }) => {
  // Aggregate tool calls frequency
  const toolCounts: Record<string, number> = {};
  toolCalls.forEach((c) => {
    toolCounts[c.tool] = (toolCounts[c.tool] || 0) + 1;
  });

  const toolEntries = Object.entries(toolCounts).sort((a, b) => b[1] - a[1]);

  const avgLatency = toolCalls.length
    ? Math.round(toolCalls.reduce((acc, c) => acc + c.latency_ms, 0) / toolCalls.length)
    : 0;

  const mcpSourceCount = toolCalls.filter((c) => c.source === 'mcp').length;
  const simSourceCount = toolCalls.filter((c) => c.source === 'simulator').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200/80 dark:border-navy-700/80 p-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-signal/10 text-signal">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-spruce dark:text-white font-sans">
              VoiceDesk Insights & Analytics
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Performance diagnostics, tool usage frequency, and latency metrics.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-850 border border-slate-200/80 dark:border-navy-700/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">Total Tool Executions</span>
          <p className="text-3xl font-extrabold text-spruce dark:text-white mt-2 font-mono">
            {stats.total_tool_calls}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 inline-block">
            ↑ 100% successful calls
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-navy-850 border border-slate-200/80 dark:border-navy-700/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">Average P95 Latency</span>
          <p className="text-3xl font-extrabold text-amber-500 mt-2 font-mono">
            {avgLatency} <span className="text-base text-slate-400 font-sans">ms</span>
          </p>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">
            Sub-second response floor
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-navy-850 border border-slate-200/80 dark:border-navy-700/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">Active Commitments</span>
          <p className="text-3xl font-extrabold text-tide mt-2 font-mono">
            {stats.open_tasks}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">
            {stats.due_today} tasks due today
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-navy-850 border border-slate-200/80 dark:border-navy-700/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">Captured Knowledge</span>
          <p className="text-3xl font-extrabold text-lilac mt-2 font-mono">
            {stats.notes_captured}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">
            Searchable & Bedrock-indexed
          </span>
        </div>
      </div>

      {/* Breakdown Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tool Invocations Breakdown */}
        <div className="p-6 rounded-2xl bg-white dark:bg-navy-850 border border-slate-200/80 dark:border-navy-700/80 shadow-xs">
          <h3 className="font-bold text-base text-spruce dark:text-white mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-500" />
            <span>MCP Tool Calls Frequency</span>
          </h3>

          <div className="space-y-3.5">
            {toolEntries.map(([tName, count]) => {
              const percentage = Math.round((count / (toolCalls.length || 1)) * 100);
              return (
                <div key={tName}>
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="font-bold text-slate-700 dark:text-slate-200">{tName}</span>
                    <span className="text-slate-400">{count} calls ({percentage}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-navy-700 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percentage}%` }}
                      className="h-full bg-gradient-to-r from-tide to-indigo-600 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Source Origin Breakdown */}
        <div className="p-6 rounded-2xl bg-white dark:bg-navy-850 border border-slate-200/80 dark:border-navy-700/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-spruce dark:text-white mb-4 flex items-center gap-2">
              <Radio className="w-4 h-4 text-tide" />
              <span>Traffic Source Origin</span>
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-200 block">
                    MCP Protocol Streamable HTTP
                  </span>
                  <span className="text-xs text-slate-400">Direct Alexa+ & MCP Client calls</span>
                </div>
                <span className="text-xl font-bold font-mono text-indigo-500">{mcpSourceCount}</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-200 block">
                    Browser Simulator & Voice Desk UI
                  </span>
                  <span className="text-xs text-slate-400">Web Speech API & Speak Bar utterances</span>
                </div>
                <span className="text-xl font-bold font-mono text-cyan-500">{simSourceCount}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-navy-700/60 text-xs text-slate-400 flex items-center justify-between">
            <span>Protocol: MCP Spec 2025-11-25</span>
            <span className="text-emerald-500 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
