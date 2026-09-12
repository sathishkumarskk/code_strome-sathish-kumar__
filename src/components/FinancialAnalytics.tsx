import React from 'react';
import { 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  DollarSign, 
  PieChart, 
  Building2, 
  ArrowUpRight,
  BarChart3,
  Calendar,
  Layers
} from 'lucide-react';
import { DashboardMetrics, InvoiceRecord } from '../types';

interface FinancialAnalyticsProps {
  metrics: DashboardMetrics;
  invoices: InvoiceRecord[];
}

export const FinancialAnalytics: React.FC<FinancialAnalyticsProps> = ({
  metrics,
  invoices
}) => {
  const discrepancyInvoices = invoices.filter(i => i.status === 'DISCREPANCY');
  const priceDiscrepancies = discrepancyInvoices.filter(i => i.discrepancy_vector.includes('PRICE') || i.potential_overcharge > 0);
  const qtyDiscrepancies = discrepancyInvoices.filter(i => i.discrepancy_vector.includes('QUANTITY'));

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#262a33] pb-6">
        <div>
          <h1 className="text-2xl font-headline font-extrabold text-white tracking-tight">
            Financial Exposure & Spend Protection Analytics
          </h1>
          <p className="text-xs text-[#869397] mt-1">
            Macro analysis of accounts payable leakage, supplier rate adherence, and prevented capital erosion.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#181c24] border border-[#262a33] text-xs font-mono text-[#869397]">
          <Calendar className="w-3.5 h-3.5 text-[#4cd7f6]" />
          <span>Current Fiscal Quarter (Q1 2026)</span>
        </div>
      </div>

      {/* 3 Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#181c24] border border-[#262a33] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-[#869397]">Total Capital Protected</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-headline font-extrabold text-emerald-400">
              ₹{(metrics.totalOvercharge || 30950).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-[#869397] mt-1">
              Zero accounts payable leakage through deterministic PO matching.
            </p>
          </div>
        </div>

        <div className="bg-[#181c24] border border-[#262a33] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-[#869397]">Gross Billing Scrutinized</span>
            <div className="w-8 h-8 rounded-lg bg-[#06b6d4]/10 border border-[#06b6d4]/30 flex items-center justify-center text-[#4cd7f6]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-headline font-extrabold text-white">
              ₹{(metrics.totalSpendAudited || 1228450).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-[#869397] mt-1">
              Across 6 enterprise supplier master accounts.
            </p>
          </div>
        </div>

        <div className="bg-[#181c24] border border-[#262a33] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-[#869397]">Automation Rate</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-headline font-extrabold text-[#4cd7f6]">
              100.0%
            </div>
            <p className="text-xs text-[#869397] mt-1">
              Continuous real-time verification at 142ms per invoice.
            </p>
          </div>
        </div>
      </div>

      {/* Deep-Dive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Root-Cause Taxonomy Breakdown */}
        <div className="bg-[#181c24] border border-[#262a33] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#262a33] pb-3">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#4cd7f6]" />
              <h3 className="text-sm font-bold font-headline text-white">
                Discrepancy Root-Cause Taxonomy
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#869397]">
              {discrepancyInvoices.length} Flagged Invoices
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-white font-medium">Unauthorized Unit Rate Escalation (Price Variance)</span>
                <span className="text-rose-400 font-mono font-bold">58% of Variance (₹26,450)</span>
              </div>
              <div className="w-full bg-[#121620] h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full w-[58%] rounded-full"></div>
              </div>
              <p className="text-[11px] text-[#869397] mt-1">
                E.g. PO-9921 / INV-10482 billing ₹499 vs contracted ₹450.
              </p>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-white font-medium">Quantity Cap Overruns (Unauthorized Surplus)</span>
                <span className="text-amber-400 font-mono font-bold">32% of Variance (₹24,000)</span>
              </div>
              <div className="w-full bg-[#121620] h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[32%] rounded-full"></div>
              </div>
              <p className="text-[11px] text-[#869397] mt-1">
                E.g. PO-9884 / INV-10479 delivery of 120 units against 100 unit cap.
              </p>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-white font-medium">Uncontracted Surcharges & Surcharge Drift</span>
                <span className="text-purple-400 font-mono font-bold">10% of Variance (₹4,500)</span>
              </div>
              <div className="w-full bg-[#121620] h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full w-[10%] rounded-full"></div>
              </div>
              <p className="text-[11px] text-[#869397] mt-1">
                E.g. PO-9750 freight surcharge contrary to DDP Incoterms.
              </p>
            </div>
          </div>
        </div>

        {/* Supplier Adherence League Table */}
        <div className="bg-[#181c24] border border-[#262a33] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#262a33] pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold font-headline text-white">
                Supplier Compliance League Table
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">
              AUDITED VENDORS
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-[#121620] border border-[#262a33] flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Delta Logistics Services</div>
                <div className="text-[11px] text-[#869397]">PO-9642 • Freight Dispatch</div>
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
                  100% CLEAN MATCH
                </span>
                <div className="text-[10px] text-[#869397] mt-0.5 font-mono">₹85,000 spend</div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#121620] border border-[#262a33] flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Matrix Office Supplies</div>
                <div className="text-[11px] text-[#869397]">PO-9480 • Task Chairs</div>
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
                  100% CLEAN MATCH
                </span>
                <div className="text-[10px] text-[#869397] mt-0.5 font-mono">₹1,95,000 spend</div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#121620] border border-rose-500/30 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Global Supplies Pvt Ltd</div>
                <div className="text-[11px] text-rose-400">PO-9921 • Unit Rate Drift (+10.89%)</div>
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300">
                  ₹2,450 OVERCHARGE
                </span>
                <div className="text-[10px] text-rose-400 mt-0.5 font-mono">AP Hold Active</div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#121620] border border-amber-500/30 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">NexaTech Solutions</div>
                <div className="text-[11px] text-amber-400">PO-9884 • Qty Overage (+20 units)</div>
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300">
                  ₹24,000 EXPOSURE
                </span>
                <div className="text-[10px] text-amber-400 mt-0.5 font-mono">Under Review</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
