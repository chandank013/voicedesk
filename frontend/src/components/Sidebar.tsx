import React from 'react';
import {
  Home,
  CheckSquare,
  FileText,
  Activity,
  BarChart3,
  Settings,
  Radio
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openTasksCount: number;
  notesCount: number;
  className?: string;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  openTasksCount,
  notesCount,
  className = '',
  onCloseMobile
}) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: openTasksCount },
    { id: 'notes', label: 'Notes', icon: FileText, badge: notesCount },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`w-64 bg-navy-900 border-r border-navy-700/60 flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none text-slate-300 ${className}`}
    >
      {/* Brand Header */}
      <div>
        <div className="p-5 pb-4 border-b border-navy-700/40">
          <div className="flex items-center gap-3">
            {/* Logo Waveform Icon */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <div className="flex items-center gap-0.5">
                <span className="w-1 h-3 bg-white rounded-full animate-pulse" />
                <span className="w-1 h-5 bg-white rounded-full" />
                <span className="w-1 h-6 bg-white rounded-full animate-pulse" />
                <span className="w-1 h-4 bg-white rounded-full" />
                <span className="w-1 h-2 bg-white rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-white font-sans">VoiceDesk</span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
                  MCP
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-tight">Talk it. Track it. Get it done.</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  onCloseMobile?.();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/80 to-indigo-700/60 text-white shadow-sm border border-indigo-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-navy-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-200' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? 'bg-indigo-400/30 text-white'
                        : 'bg-navy-800 text-slate-400 border border-navy-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Promotional Panel */}
      <div className="p-4 m-3 rounded-xl bg-gradient-to-b from-navy-800/90 to-navy-850 border border-navy-700/80 relative overflow-hidden">
        {/* Abstract Decorative Wave Background */}
        <div className="absolute -right-4 -bottom-4 w-28 h-28 opacity-15 pointer-events-none">
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="text-indigo-400 w-full h-full">
            <path d="M0,50 Q25,20 50,50 T100,50" strokeWidth="3" />
            <path d="M0,65 Q25,35 50,65 T100,65" strokeWidth="2" />
            <path d="M0,80 Q25,50 50,80 T100,80" strokeWidth="2" />
          </svg>
        </div>

        <div className="flex items-center gap-2 mb-1.5">
          <div className="p-1 rounded bg-indigo-500/20 text-indigo-400">
            <Radio className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-semibold tracking-wide text-indigo-300 uppercase">
            Official Integration
          </span>
        </div>

        <p className="text-xs font-medium text-white leading-snug">
          Powered by Alexa+ MCP and Amazon Bedrock
        </p>
        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
          Intelligent voice infrastructure for a more organized tomorrow.
        </p>

        <div className="mt-3 pt-2.5 border-t border-navy-700/50 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Spec 2025-11-25
          </span>
          <span className="text-slate-500 font-mono">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};
