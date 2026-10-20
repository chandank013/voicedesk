import React, { useState } from 'react';
import {
  Search,
  Sun,
  Moon,
  ChevronDown,
  RotateCcw,
  Menu
} from 'lucide-react';

interface TopNavProps {
  onSearch: (query: string) => void;
  onResetDemo: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  onOpenMobileMenu?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onSearch,
  onResetDemo,
  isDark,
  toggleTheme,
  onOpenMobileMenu
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  return (
    <header className="h-16 px-6 border-b border-slate-200/80 dark:border-navy-700/60 bg-white/70 dark:bg-navy-900/70 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-4">
      {/* Mobile Menu Trigger & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              onSearch(e.target.value);
            }}
            placeholder="Search your tasks, notes, or ask anything..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100/90 dark:bg-navy-800 border border-slate-200/80 dark:border-navy-700 rounded-full focus:bg-white dark:focus:bg-navy-850 focus:border-tide focus:ring-2 focus:ring-tide/20 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => {
                setSearchValue('');
                onSearch('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-[12px] font-medium text-emerald-700 dark:text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>MCP Server Connected</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* User Avatar & Menu */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-tide to-indigo-600 text-white font-semibold text-xs flex items-center justify-center shadow-sm">
              AC
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight">Alex Chen</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Good morning</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-navy-850 rounded-xl shadow-xl border border-slate-200 dark:border-navy-700 py-1.5 z-50 text-sm">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-navy-700/60">
                <p className="text-xs font-medium text-slate-400">Signed in as</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">alex.chen@voicedesk.ai</p>
              </div>

              <button
                onClick={() => {
                  setShowDropdown(false);
                  onResetDemo();
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-800 flex items-center gap-2.5 transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-signal" />
                <span>Reset Demo Data</span>
              </button>

              <div className="border-t border-slate-100 dark:border-navy-700/60 my-1" />

              <div className="px-4 py-2 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Protocol</span>
                <span className="font-mono text-slate-500">2025-11-25</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
