import React from 'react';
import {
  CheckSquare,
  FileText,
  CalendarClock,
  Terminal,
  ArrowUpRight
} from 'lucide-react';
import type { DashboardStats } from '../types';

interface StatsRowProps {
  stats: DashboardStats;
}

export const StatsRow: React.FC<StatsRowProps> = ({ stats }) => {
  const statCards = [
    {
      id: 'open_tasks',
      label: 'Open Tasks',
      value: stats.open_tasks,
      icon: CheckSquare,
      color: 'text-tide',
      bgColor: 'bg-tide/10 dark:bg-tide/20',
      borderColor: 'border-tide/20',
      trend: '+2 from yesterday',
      trendPositive: true,
      sparkline: [3, 5, 4, 6, 7, 8],
    },
    {
      id: 'notes_captured',
      label: 'Notes Captured',
      value: stats.notes_captured,
      icon: FileText,
      color: 'text-lilac',
      bgColor: 'bg-lilac/10 dark:bg-lilac/20',
      borderColor: 'border-lilac/20',
      trend: '100% searchable',
      trendPositive: true,
      sparkline: [6, 8, 9, 10, 11, 12],
    },
    {
      id: 'due_today',
      label: 'Due Today',
      value: stats.due_today,
      icon: CalendarClock,
      color: 'text-brick',
      bgColor: 'bg-brick/10 dark:bg-brick/20',
      borderColor: 'border-brick/20',
      trend: 'Requires attention',
      trendPositive: false,
      sparkline: [1, 2, 2, 3, 3, 3],
    },
    {
      id: 'total_tool_calls',
      label: 'Total Tool Calls',
      value: stats.total_tool_calls,
      icon: Terminal,
      color: 'text-signal',
      bgColor: 'bg-signal/10 dark:bg-signal/20',
      borderColor: 'border-signal/20',
      trend: 'Real-time MCP',
      trendPositive: true,
      sparkline: [10, 14, 18, 20, 22, 24],
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="p-5 rounded-2xl bg-white dark:bg-navy-850 border border-slate-200/80 dark:border-navy-700/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {card.label}
              </span>
              <div className={`p-2 rounded-xl ${card.bgColor} ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-spruce dark:text-white font-sans tracking-tight">
                {card.value}
              </span>

              {/* Sparkline mini graphic */}
              <div className="flex items-end gap-1 h-6">
                {card.sparkline.map((val, idx) => (
                  <span
                    key={idx}
                    style={{ height: `${(val / Math.max(...card.sparkline)) * 20}px` }}
                    className={`w-1 rounded-full ${
                      idx === card.sparkline.length - 1
                        ? 'bg-tide dark:bg-cyan-400'
                        : 'bg-slate-200 dark:bg-navy-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <ArrowUpRight className="w-3 h-3 text-emerald-500" />
              <span>{card.trend}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
