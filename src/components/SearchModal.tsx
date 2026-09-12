import React, { useState, useEffect } from 'react';
import { Search, X, FileText, ShoppingBag, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { InvoiceRecord, PurchaseOrder } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: InvoiceRecord[];
  purchaseOrders: PurchaseOrder[];
  onSelectInvoice: (invoiceNumber: string) => void;
  onSelectPo: (poNumber: string) => void;
  onSelectTab: (tab: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  invoices,
  purchaseOrders,
  onSelectInvoice,
  onSelectPo,
  onSelectTab
}) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState<string>('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const safeQuery = (query || '').toLowerCase();

  const filteredInvoices = (invoices || []).filter(i => 
    (i?.invoice_number && i.invoice_number.toLowerCase().includes(safeQuery)) ||
    (i?.vendor && i.vendor.toLowerCase().includes(safeQuery)) ||
    (i?.po_number && i.po_number.toLowerCase().includes(safeQuery))
  ).slice(0, 4);

  const filteredPos = (purchaseOrders || []).filter(p => 
    (p?.po_number && p.po_number.toLowerCase().includes(safeQuery)) ||
    (p?.vendor && p.vendor.toLowerCase().includes(safeQuery)) ||
    (p?.product && p.product.toLowerCase().includes(safeQuery))
  ).slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-24 p-4">
      <div className="bg-[#181c24] border border-[#262a33] rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Search Bar Input */}
        <div className="p-4 border-b border-[#262a33] flex items-center gap-3 bg-[#151922]">
          <Search className="w-5 h-5 text-[#869397]" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search invoice number, PO reference, vendor, or module..."
            className="w-full bg-transparent text-sm text-white placeholder-[#869397] focus:outline-none"
          />
          <kbd className="px-2 py-0.5 rounded bg-[#262a33] text-[10px] font-mono text-[#869397]">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="p-4 max-h-96 overflow-y-auto space-y-4">
          {/* Quick Actions */}
          <div>
            <div className="text-[10px] font-mono uppercase text-[#869397] tracking-wider mb-2">
              Quick Navigation
            </div>
            <div className="space-y-1 text-xs">
              <button
                onClick={() => {
                  onSelectTab('bench');
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#262a33] text-left text-white"
              >
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Launch Benchmark Test Case (PO-9921 vs INV-10482)</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#869397]" />
              </button>
            </div>
          </div>

          {/* Invoices */}
          {filteredInvoices.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase text-[#869397] tracking-wider mb-2">
                Invoices ({filteredInvoices.length})
              </div>
              <div className="space-y-1">
                {filteredInvoices.map((inv) => (
                  <button
                    key={inv.invoice_number}
                    onClick={() => {
                      onSelectInvoice(inv.invoice_number);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-[#262a33] text-left text-xs transition-colors"
                  >
                    <div>
                      <div className="font-mono font-bold text-white flex items-center gap-2">
                        <span>{inv.invoice_number}</span>
                        <span className="text-[10px] text-[#4cd7f6] font-normal">{inv.po_number}</span>
                      </div>
                      <div className="text-[#869397] text-[11px] truncate">{inv.vendor} • ₹{inv.invoice_total.toLocaleString('en-IN')}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      inv.status === 'DISCREPANCY' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {inv.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Purchase Orders */}
          {filteredPos.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase text-[#869397] tracking-wider mb-2">
                ERP Purchase Orders ({filteredPos.length})
              </div>
              <div className="space-y-1">
                {filteredPos.map((po) => (
                  <button
                    key={po.po_number}
                    onClick={() => {
                      onSelectPo(po.po_number);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-[#262a33] text-left text-xs transition-colors"
                  >
                    <div>
                      <div className="font-mono font-bold text-white">{po.po_number}</div>
                      <div className="text-[#869397] text-[11px] truncate">{po.vendor} • {po.product}</div>
                    </div>
                    <span className="text-emerald-400 font-mono font-semibold">
                      ₹{po.expected_total.toLocaleString('en-IN')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
