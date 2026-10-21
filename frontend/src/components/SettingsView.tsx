import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  Radio,
  Sparkles,
  RotateCcw,
  Moon,
  Sun
} from 'lucide-react';

interface SettingsViewProps {
  onResetDemo: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onResetDemo,
  isDark,
  toggleTheme
}) => {
  const [health, setHealth] = useState<{
    status: string;
    version: string;
    mcp_protocol_version: string;
    bedrock_enabled: boolean;
    bedrock_model_id: string;
  } | null>(null);

  useEffect(() => {
    fetch('/health')
      .then((res) => res.json())
      .then(setHealth)
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200/80 dark:border-navy-700/80 p-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-navy-750 text-slate-700 dark:text-slate-300">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-spruce dark:text-white font-sans">
              Settings & Configuration
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Protocol endpoints, AI model configuration, and database management.
            </p>
          </div>
        </div>
      </div>

      {/* Protocol & MCP Settings */}
      <div className="p-6 rounded-2xl bg-white dark:bg-navy-850 border border-slate-200/80 dark:border-navy-700/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-spruce dark:text-white">
          <Radio className="w-4 h-4 text-indigo-500" />
          <h2 className="font-bold text-base font-sans">Model Context Protocol (MCP) Server</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700">
            <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">
              Streamable HTTP Endpoint
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-100">
              http://localhost:8000/mcp
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700">
            <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">
              Protocol Version
            </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {health?.mcp_protocol_version || '2025-11-25'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700">
            <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">
              Server Name & Version
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-100">
              voicedesk v{health?.version || '1.0.0'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700">
            <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">
              Registered Tools
            </span>
            <span className="font-semibold text-indigo-500">
              6 tools (add, list, complete, note, search, recall)
            </span>
          </div>
        </div>
      </div>

      {/* Amazon Bedrock Configuration */}
      <div className="p-6 rounded-2xl bg-white dark:bg-navy-850 border border-slate-200/80 dark:border-navy-700/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-spruce dark:text-white">
          <Sparkles className="w-4 h-4 text-signal" />
          <h2 className="font-bold text-base font-sans">Amazon Bedrock (AWS Builder)</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700">
            <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">
              Model Identifier
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-100">
              {health?.bedrock_model_id || 'amazon.nova-micro-v1:0'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700">
            <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">
              Bedrock Integration Status
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-100">
              {health?.bedrock_enabled ? 'Active (Converse API)' : 'Ready (Intelligent Fallback Active)'}
            </span>
          </div>
        </div>
      </div>

      {/* Database & Demo Reset */}
      <div className="p-6 rounded-2xl bg-white dark:bg-navy-850 border border-slate-200/80 dark:border-navy-700/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-spruce dark:text-white">
          <Database className="w-4 h-4 text-tide" />
          <h2 className="font-bold text-base font-sans">Database & State Management</h2>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          VoiceDesk uses local SQLite with Write-Ahead Logging (WAL) mode for low-latency concurrent queries.
          You can reset all tasks, notes, and tool call traces back to the initial hackathon reference demo state at any time.
        </p>

        <div className="pt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={onResetDemo}
            className="px-4 py-2 rounded-xl bg-signal hover:bg-signal-hover text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data to Reference State</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            <span>Toggle Theme ({isDark ? 'Dark' : 'Light'})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
