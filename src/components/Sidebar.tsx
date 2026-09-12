import React from 'react';
import { 
  LayoutDashboard, 
  ScanSearch, 
  FileText, 
  ShoppingBag, 
  AlertTriangle, 
  History, 
  TrendingUp, 
  ShieldCheck,
  Cpu,
  Database,
  CheckCircle2
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  flaggedCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, flaggedCount = 3 }) => {
  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'bench', label: 'Invoice Audit Bench', icon: ScanSearch, badge: 'AI AUDIT' },
    { id: 'invoices', label: 'Invoices Ledger', icon: FileText, badge: null },
    { id: 'pos', label: 'Purchase Orders (ERP)', icon: ShoppingBag, badge: null },
    { id: 'discrepancies', label: 'Discrepancies & Alerts', icon: AlertTriangle, badge: flaggedCount > 0 ? String(flaggedCount) : null, badgeAlert: true },
    { id: 'audit-trail', label: 'Audit Logs & Proof', icon: History, badge: null },
    { id: 'analytics', label: 'Financial Analytics', icon: TrendingUp, badge: null },
  ];

  return (
    <aside className="w-68 shrink-0 bg-[#121620] border-r border-[#262a33] flex flex-col justify-between h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-[#262a33]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#06b6d4] to-[#0284c7] flex items-center justify-center shadow-lg shadow-[#06b6d4]/20 border border-[#4cd7f6]/40">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-headline font-extrabold text-lg tracking-wider text-white">VENDORA</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#06b6d4]/20 text-[#4cd7f6] border border-[#06b6d4]/40">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-[#869397] font-medium tracking-tight">Enterprise AP Forensic Auditor</p>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <div className="px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-mono tracking-wider text-[#869397] uppercase">
            Core Modules
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#1e232f] text-[#4cd7f6] font-semibold border-l-2 border-[#4cd7f6] shadow-sm'
                    : 'text-[#bcc9cd] hover:text-white hover:bg-[#181c24]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#4cd7f6]' : 'text-[#869397]'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                      item.badgeAlert
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-[#06b6d4]/15 text-[#4cd7f6] border border-[#06b6d4]/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer System Status & Auditor Profile */}
      <div className="p-3 border-t border-[#262a33] bg-[#0f131c]/60 space-y-3">
        {/* Real-time System Indicators */}
        <div className="bg-[#181c24] rounded-lg p-2.5 border border-[#262a33] space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-[#869397]">
              <Cpu className="w-3.5 h-3.5 text-[#4cd7f6]" />
              AI Extraction
            </span>
            <span className="text-[10px] font-mono text-[#4cd7f6] bg-[#06b6d4]/10 px-1.5 py-0.2 rounded">
              Gemini 3.8 Flash
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-[#869397]">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              ERP Master DB
            </span>
            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              SQLite Synced
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-[#869397]">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              Settlement Rule
            </span>
            <span className="text-[10px] font-mono text-indigo-300">
              Deterministic v4.2
            </span>
          </div>
        </div>

        {/* Auditor Profile */}
        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white border border-cyan-400/40">
            ER
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-white truncate">Elena Rostova</p>
            <p className="text-[10px] text-[#869397] truncate">Lead AP Forensic Auditor</p>
          </div>
          <CheckCircle2 className="w-3.5 h-3.5 text-[#4edea3]" />
        </div>
      </div>
    </aside>
  );
};
