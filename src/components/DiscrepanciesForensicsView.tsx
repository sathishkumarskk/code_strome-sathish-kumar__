import React from 'react';
import { 
  AlertTriangle, 
  Send, 
  DollarSign, 
  ChevronRight, 
  FileText, 
  ShieldAlert,
  ArrowUpRight,
  Filter,
  Zap
} from 'lucide-react';
import { InvoiceRecord } from '../types';

interface DiscrepanciesForensicsViewProps {
  invoices: InvoiceRecord[];
  onSelectInvoice: (invoiceNumber: string) => void;
  onOpenDispute: (invNumber: string, poNumber: string, vendor: string, overcharge: number, reason: string) => void;
  onOpenBenchWithDemo: () => void;
}

export const DiscrepanciesForensicsView: React.FC<DiscrepanciesForensicsViewProps> = ({
  invoices,
  onSelectInvoice,
  onOpenDispute,
  onOpenBenchWithDemo
}) => {
  const flagged = invoices.filter(i => i.status === 'DISCREPANCY');

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#262a33] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-headline font-extrabold text-white tracking-tight">
              Discrepancies & Payment Hold Queue
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
              {flagged.length} ACTIVE HOLDS
            </span>
          </div>
          <p className="text-xs text-[#869397] mt-1">
            Prioritized action queue for AP forensic auditors. Automatic disbursement locks engaged pending reconciliation.
          </p>
        </div>

        <button
          onClick={onOpenBenchWithDemo}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
        >
          <Zap className="w-4 h-4 fill-slate-950" />
          <span>Launch PO-9921 Benchmark Test Case</span>
        </button>
      </div>

      {/* Flagged Cards List */}
      <div className="space-y-4">
        {flagged.map((inv) => {
          const isBenchmark = inv.invoice_number === 'INV-10482';
          return (
            <div
              key={inv.invoice_number}
              className={`bg-[#181c24] border rounded-xl p-6 transition-all hover:border-[#3d494c] ${
                isBenchmark ? 'border-amber-500/50 shadow-xl shadow-amber-500/5' : 'border-rose-500/30'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-base font-bold text-white">
                      {inv.invoice_number}
                    </span>
                    <span className="font-mono text-xs text-[#4cd7f6] bg-[#06b6d4]/10 px-2 py-0.5 rounded border border-[#06b6d4]/30">
                      PO: {inv.po_number}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      {inv.discrepancy_vector || 'PRICE_DISCREPANCY'}
                    </span>
                    {isBenchmark && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        ⚡ REQUIRED DEMO CASE
                      </span>
                    )}
                    {inv.action_status && inv.action_status !== 'OPEN' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        STATUS: {inv.action_status}
                      </span>
                    )}
                  </div>

                  <div className="text-sm font-semibold text-white">
                    {inv.vendor} — <span className="text-[#869397] font-normal">{inv.product}</span>
                  </div>

                  <p className="text-xs text-[#bcc9cd] leading-relaxed">
                    {inv.explanation}
                  </p>
                </div>

                {/* Metrics & Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#262a33]">
                  <div className="text-left lg:text-right">
                    <div className="text-[11px] font-mono text-[#869397] uppercase">Potential Overcharge</div>
                    <div className="text-xl font-headline font-extrabold text-rose-400">
                      ₹{inv.potential_overcharge.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[11px] text-[#869397]">
                      Invoice Total: ₹{inv.invoice_total.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenDispute(
                        inv.invoice_number,
                        inv.po_number,
                        inv.vendor,
                        inv.potential_overcharge,
                        inv.explanation
                      )}
                      className="px-3.5 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Transmit Dispute</span>
                    </button>

                    <button
                      onClick={() => onSelectInvoice(inv.invoice_number)}
                      className="px-3.5 py-2 rounded-lg bg-[#262a33] hover:bg-[#31353e] border border-[#3d494c] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <span>Audit Diff</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
