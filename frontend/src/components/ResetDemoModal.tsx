import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';

interface ResetDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const ResetDemoModal: React.FC<ResetDemoModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const [isResetting, setIsResetting] = useState(false);

  if (!isOpen) return null;

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200 dark:border-navy-700 shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in duration-200">
        <div className="p-5 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 text-signal border border-amber-200 dark:border-amber-800/50 flex items-center justify-center mx-auto mb-3">
            <RotateCcw className="w-6 h-6" />
          </div>

          <h3 className="font-bold text-base text-spruce dark:text-white font-sans">
            Reset Demo Data?
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            This will restore the original reference tasks, notes, statistics (8 tasks, 12 notes, 3 due today, 24 tool calls), and clear test records.
          </p>

          <div className="mt-5 flex items-center justify-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800"
            >
              Cancel
            </button>
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-signal hover:bg-signal-hover text-white shadow-xs"
            >
              {isResetting ? 'Resetting...' : 'Confirm Reset'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
