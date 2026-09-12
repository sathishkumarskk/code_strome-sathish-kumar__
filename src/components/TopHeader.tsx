import React from 'react';
import { Search, Zap, Bell, Plus, RefreshCw, FileCheck2 } from 'lucide-react';

interface TopHeaderProps {
  onOpenSearch: () => void;
  onOpenBench: () => void;
  onOpenAnalyzeModal?: () => void;
  onLoadDemoScenario: () => void;
  flaggedCount: number;
  isRefreshing?: boolean;
  onRefreshData?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenSearch,
  onOpenBench,
  onOpenAnalyzeModal,
  onLoadDemoScenario,
  flaggedCount,
  isRefreshing = false,
  onRefreshData
}) => {
  return (
    <header className="h-16 border-b border-[#262a33] bg-[#121620]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left section: Breadcrumb / Live Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#1c2028] border border-[#262a33] text-xs">
          <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
          <span className="font-mono text-[11px] text-[#bcc9cd]">ERP CONNECTION:</span>
          <span className="font-mono text-[11px] font-bold text-[#4edea3]">LIVE ACTIVE (SAP / ORACLE ERP)</span>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs text-[#869397]">
          <span>|</span>
          <span className="font-mono text-[11px]">AUTONOMOUS AUDITOR RUNNING</span>
        </div>
      </div>

      {/* Middle/Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Search Bar */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-[#181c24] hover:bg-[#1f242e] border border-[#262a33] text-xs text-[#869397] hover:text-[#dfe2ee] transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-[#869397]" />
          <span>Search invoices, POs, vendors...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-[#262a33] text-[10px] font-mono text-[#bcc9cd]">
            ⌘K
          </kbd>
        </button>

        {/* 1-Click Hackathon Demo Launcher */}
        <button
          onClick={onLoadDemoScenario}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 hover:border-amber-400 text-amber-300 hover:text-amber-200 text-xs font-semibold shadow-sm transition-all active:scale-95"
          title="Load required PO-9921 vs INV-10482 demo case"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="hidden md:inline font-mono">Demo Case:</span>
          <span className="font-mono font-bold">PO-9921</span>
        </button>

        {/* Refresh button */}
        {onRefreshData && (
          <button
            onClick={onRefreshData}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-[#181c24] hover:bg-[#1f242e] border border-[#262a33] text-[#869397] hover:text-white transition-colors"
            title="Refresh ERP Records"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#4cd7f6]' : ''}`} />
          </button>
        )}

        {/* Active Discrepancy Alerts Bell */}
        <div className="relative">
          <button
            onClick={onOpenBench}
            className="p-2 rounded-lg bg-[#181c24] hover:bg-[#1f242e] border border-[#262a33] text-[#869397] hover:text-white transition-colors relative"
            title={`${flaggedCount} Active Discrepancies`}
          >
            <Bell className="w-4 h-4" />
            {flaggedCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold font-mono flex items-center justify-center border-2 border-[#121620]">
                {flaggedCount}
              </span>
            )}
          </button>
        </div>

        {/* Primary Action Button: Analyze New Invoice */}
        <button
          onClick={onOpenAnalyzeModal || onOpenBench}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#06b6d4] to-[#0284c7] hover:from-[#38bdf8] hover:to-[#0369a1] text-white text-xs font-semibold shadow-md shadow-[#06b6d4]/20 border border-[#4cd7f6]/40 transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Analyze New Invoice</span>
        </button>
      </div>
    </header>
  );
};
