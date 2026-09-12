import React from 'react';
import { 
  DollarSign, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  ArrowUpRight, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  FileSearch,
  Zap,
  ExternalLink,
  Filter,
  Building2
} from 'lucide-react';
import { InvoiceRecord, DashboardMetrics } from '../types';

interface ExecutiveDashboardProps {
  metrics: DashboardMetrics;
  invoices: InvoiceRecord[];
  onSelectInvoice: (invoiceNumber: string) => void;
  onOpenBenchWithDemo: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  metrics,
  invoices,
  onSelectInvoice,
  onOpenBenchWithDemo,
  onNavigateToTab
}) => {
  const recentInvoices = invoices.slice(0, 6);
  const flaggedInvoices = invoices.filter(i => i.status === 'DISCREPANCY');

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner: Mission & Hackathon Quick Demo */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#181f2c] via-[#1c2230] to-[#121824] border border-[#262a33] p-6 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-[#06b6d4]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#06b6d4]/15 border border-[#06b6d4]/30 text-xs font-mono text-[#4cd7f6]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>CONTINUOUS DETERMINISTIC SETTLEMENT ENFORCEMENT</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-headline font-extrabold text-white tracking-tight">
              Enterprise Vendor Invoice Auditor
            </h1>
            <p className="text-sm text-[#869397] leading-relaxed">
              Autonomous line-item validation of vendor billing claims against authorized ERP Purchase Orders.
              Zero-tolerance discrepancy detection with mathematical proof and automated dispute generation.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={onOpenBenchWithDemo}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all transform active:scale-95"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Test PO-9921 vs INV-10482</span>
            </button>
            <button
              onClick={() => onNavigateToTab('bench')}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1c2028] hover:bg-[#262a33] border border-[#3d494c] text-white font-semibold text-sm transition-all"
            >
              <FileSearch className="w-4 h-4 text-[#4cd7f6]" />
              <span>Open Audit Bench</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Executive KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Spend Audited */}
        <div className="bg-[#181c24] border border-[#262a33] rounded-xl p-5 relative overflow-hidden group hover:border-[#3d494c] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#869397]">Spend Audited</span>
            <div className="w-8 h-8 rounded-lg bg-[#06b6d4]/10 border border-[#06b6d4]/30 flex items-center justify-center text-[#4cd7f6]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-headline font-extrabold text-white">
              ₹{(metrics.totalSpendAudited || 1228450).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-[#4edea3]">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span className="font-semibold">100% automated coverage</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Potential Overcharge Prevented */}
        <div className="bg-[#181c24] border border-rose-500/30 rounded-xl p-5 relative overflow-hidden group hover:border-rose-500/50 transition-colors shadow-sm shadow-rose-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-rose-300">Overcharge Blocked</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-headline font-extrabold text-rose-400">
              ₹{(metrics.totalOvercharge || 30950).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-rose-300/80">
              <span className="font-mono font-semibold">{metrics.flaggedCount} invoices held</span>
              <span>• Zero leakage</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Audit Accuracy & Match Rate */}
        <div className="bg-[#181c24] border border-[#262a33] rounded-xl p-5 relative overflow-hidden group hover:border-[#3d494c] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#869397]">Extraction Accuracy</span>
            <div className="w-8 h-8 rounded-lg bg-[#4edea3]/10 border border-[#4edea3]/30 flex items-center justify-center text-[#4edea3]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-headline font-extrabold text-[#4edea3]">
              {metrics.accuracyRate || '99.8'}%
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-[#869397]">
              <span>Gemini 3.8 Flash + Exact Rules</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Avg Audit Latency */}
        <div className="bg-[#181c24] border border-[#262a33] rounded-xl p-5 relative overflow-hidden group hover:border-[#3d494c] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#869397]">Audit Latency</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-headline font-extrabold text-white">
              {metrics.avgAuditLatencyMs || 142}ms
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-[#869397]">
              <span>Real-time ERP validation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flagged Invoices Alert Callout */}
      {flaggedInvoices.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950/30 via-[#1e1b24] to-[#181c24] border border-rose-500/30 rounded-xl p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{flaggedInvoices.length} Invoices Flagged for Financial Discrepancies</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    URGENT ACTION
                  </span>
                </h2>
                <p className="text-xs text-[#bcc9cd] mt-0.5">
                  Automated AP payment holds engaged. Review rate escalation on <strong className="text-white">PO-9921 (INV-10482)</strong> and quantity surplus on PO-9884.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onSelectInvoice('INV-10482')}
                className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center gap-1.5"
              >
                <span>Audit INV-10482 (₹2,450 Overcharge)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid: Invoices Table (Left) + Vendor Intelligence / Side Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Invoices Audit Table matching Stitch Design */}
        <div className="lg:col-span-2 bg-[#181c24] border border-[#262a33] rounded-xl overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#262a33] flex items-center justify-between bg-[#151922]">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-[#06b6d4]"></div>
              <h2 className="text-sm font-bold font-headline text-white tracking-wide">
                Audited Invoices (Continuous Feed)
              </h2>
            </div>
            <button
              onClick={() => onNavigateToTab('invoices')}
              className="text-xs text-[#4cd7f6] hover:text-[#9cf0ff] font-medium flex items-center gap-1"
            >
              <span>View All Invoices</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#262a33] text-[11px] font-mono uppercase text-[#869397] bg-[#121620]">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">PO Ref</th>
                  <th className="py-3 px-4">Supplier / Item</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Audit Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262a33]/60 text-xs">
                {recentInvoices.map((inv) => {
                  const isFlagged = inv.status === 'DISCREPANCY';
                  return (
                    <tr 
                      key={inv.invoice_number}
                      className="hover:bg-[#1f242e] transition-colors cursor-pointer group"
                      onClick={() => onSelectInvoice(inv.invoice_number)}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-white flex items-center gap-2">
                        <span>{inv.invoice_number}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#4cd7f6]">
                        {inv.po_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white truncate max-w-[180px]">{inv.vendor}</div>
                        <div className="text-[11px] text-[#869397] truncate max-w-[180px]">{inv.product}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-white">
                        ₹{inv.invoice_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        {isFlagged && inv.potential_overcharge > 0 && (
                          <div className="text-[10px] text-rose-400 font-mono">
                            +₹{inv.potential_overcharge.toLocaleString('en-IN', { minimumFractionDigits: 2 })} var
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isFlagged ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                            <AlertTriangle className="w-3 h-3" />
                            DISCREPANCY
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#4edea3]/15 text-[#4edea3] border border-[#4edea3]/30">
                            <CheckCircle2 className="w-3 h-3" />
                            3-WAY MATCH
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectInvoice(inv.invoice_number);
                          }}
                          className="px-2.5 py-1 rounded bg-[#262a33] hover:bg-[#31353e] text-white text-[11px] font-medium border border-[#3d494c] transition-colors"
                        >
                          Audit Diff
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Vendor Risk & Discrepancy Breakdown */}
        <div className="space-y-6">
          {/* Demo Highlight Card: PO-9921 */}
          <div className="bg-gradient-to-br from-[#1c2230] to-[#161a24] border border-amber-500/30 rounded-xl p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold">
                <Zap className="w-4 h-4 fill-amber-400" />
                <span>BENCHMARK TEST CASE</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                PO-9921
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#869397]">
                <span>Vendor:</span>
                <span className="text-white font-medium">Global Supplies Pvt Ltd</span>
              </div>
              <div className="flex justify-between text-[#869397]">
                <span>PO Agreed Rate:</span>
                <span className="font-mono text-emerald-400 font-bold">₹450.00 / unit (Qty 50)</span>
              </div>
              <div className="flex justify-between text-[#869397]">
                <span>Invoice Billed Rate:</span>
                <span className="font-mono text-rose-400 font-bold">₹499.00 / unit (+₹49.00)</span>
              </div>
              <div className="flex justify-between text-[#869397] pt-2 border-t border-[#262a33]">
                <span>Potential Overcharge:</span>
                <span className="font-mono text-rose-400 font-extrabold text-sm">₹2,450.00</span>
              </div>
            </div>

            <button
              onClick={onOpenBenchWithDemo}
              className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors active:scale-98"
            >
              <span>Run Automated Forensic Audit</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Supplier Risk Scorecard */}
          <div className="bg-[#181c24] border border-[#262a33] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#869397]">
                Supplier Drift Telemetry
              </h3>
              <Building2 className="w-4 h-4 text-[#869397]" />
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-white font-medium">Global Supplies Pvt Ltd</span>
                  <span className="text-rose-400 font-mono font-bold">Rate Drift (10.9%)</span>
                </div>
                <div className="w-full bg-[#262a33] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full w-[85%] rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-white font-medium">NexaTech Solutions</span>
                  <span className="text-amber-400 font-mono font-bold">Qty Surplus (20%)</span>
                </div>
                <div className="w-full bg-[#262a33] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[65%] rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-white font-medium">Delta Logistics Services</span>
                  <span className="text-emerald-400 font-mono font-bold">100% Compliant</span>
                </div>
                <div className="w-full bg-[#262a33] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full w-[100%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
