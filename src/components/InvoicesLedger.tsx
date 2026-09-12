import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  Clock,
  Building2,
  DollarSign
} from 'lucide-react';
import { InvoiceRecord } from '../types';

interface InvoicesLedgerProps {
  invoices: InvoiceRecord[];
  onSelectInvoice: (invoiceNumber: string) => void;
  onOpenBench: () => void;
}

export const InvoicesLedger: React.FC<InvoicesLedgerProps> = ({
  invoices,
  onSelectInvoice,
  onOpenBench
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DISCREPANCY' | 'CLEAR'>('ALL');

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = 
      inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.product.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && inv.status === statusFilter;
  });

  const handleExportCSV = () => {
    const headers = ['Invoice Number', 'PO Number', 'Vendor', 'Product', 'Quantity', 'Unit Price', 'Total', 'Status', 'Overcharge', 'Date'];
    const rows = filteredInvoices.map(i => [
      i.invoice_number,
      i.po_number,
      `"${i.vendor}"`,
      `"${i.product}"`,
      i.quantity,
      i.unit_price,
      i.invoice_total,
      i.status,
      i.potential_overcharge,
      i.created_at
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vendora_invoices_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#262a33] pb-6">
        <div>
          <h1 className="text-2xl font-headline font-extrabold text-white tracking-tight">
            Invoices Ledger & Historical Repository
          </h1>
          <p className="text-xs text-[#869397] mt-1">
            Complete database of supplier billings matched against ERP purchase orders with immutable forensic records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#181c24] hover:bg-[#262a33] text-[#bcc9cd] hover:text-white border border-[#262a33] text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenBench}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#38bdf8] text-white text-xs font-semibold shadow-md transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Audit New Invoice</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#181c24] border border-[#262a33] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#869397] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by invoice, PO, or supplier..."
            className="w-full bg-[#121620] border border-[#262a33] focus:border-[#4cd7f6] rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-[#869397] focus:outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-mono text-[#869397] mr-2 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Filter:
          </span>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'ALL'
                ? 'bg-[#262a33] text-white border border-[#3d494c]'
                : 'text-[#869397] hover:text-white'
            }`}
          >
            All Invoices ({invoices.length})
          </button>
          <button
            onClick={() => setStatusFilter('DISCREPANCY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'DISCREPANCY'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                : 'text-rose-400/80 hover:text-rose-300'
            }`}
          >
            Discrepancies ({invoices.filter(i => i.status === 'DISCREPANCY').length})
          </button>
          <button
            onClick={() => setStatusFilter('CLEAR')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'CLEAR'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'text-emerald-400/80 hover:text-emerald-300'
            }`}
          >
            3-Way Match ({invoices.filter(i => i.status === 'CLEAR').length})
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-[#181c24] border border-[#262a33] rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#262a33] text-[11px] font-mono uppercase text-[#869397] bg-[#121620]">
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">PO Ref</th>
                <th className="py-3.5 px-4">Vendor Name</th>
                <th className="py-3.5 px-4">Product / Item</th>
                <th className="py-3.5 px-4 text-center">Billed Qty</th>
                <th className="py-3.5 px-4 text-right">Unit Rate</th>
                <th className="py-3.5 px-4 text-right">Total Payable</th>
                <th className="py-3.5 px-4 text-center">Audit Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262a33] text-xs">
              {filteredInvoices.map((inv) => {
                const isFlagged = inv.status === 'DISCREPANCY';
                return (
                  <tr
                    key={inv.invoice_number}
                    className="hover:bg-[#1f242e] transition-colors cursor-pointer group"
                    onClick={() => onSelectInvoice(inv.invoice_number)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-white flex items-center gap-2">
                      <span>{inv.invoice_number}</span>
                      {inv.invoice_number === 'INV-10482' && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          DEMO
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#4cd7f6]">
                      {inv.po_number}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white truncate max-w-[160px]">
                      {inv.vendor}
                    </td>
                    <td className="py-3.5 px-4 text-[#869397] truncate max-w-[160px]">
                      {inv.product}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-white">
                      {inv.quantity}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-[#bcc9cd]">
                      ₹{inv.unit_price.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                      ₹{inv.invoice_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      {isFlagged && inv.potential_overcharge > 0 && (
                        <div className="text-[10px] text-rose-400">
                          +₹{inv.potential_overcharge.toLocaleString('en-IN', { minimumFractionDigits: 2 })} var
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {isFlagged ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          <AlertTriangle className="w-3 h-3" />
                          DISCREPANCY
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#4edea3]/15 text-[#4edea3] border border-[#4edea3]/30">
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
                        className="px-3 py-1 rounded bg-[#262a33] group-hover:bg-[#06b6d4] text-white text-xs font-medium border border-[#3d494c] group-hover:border-[#4cd7f6] transition-all"
                      >
                        Inspect Diff
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
