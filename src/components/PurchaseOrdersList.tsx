import React from 'react';
import { 
  ShoppingBag, 
  Search, 
  CheckCircle2, 
  Building, 
  Calendar, 
  ExternalLink,
  ShieldCheck,
  Zap,
  DollarSign,
  Plus
} from 'lucide-react';
import { PurchaseOrder } from '../types';

interface PurchaseOrdersListProps {
  purchaseOrders: PurchaseOrder[];
  onAuditPo: (poNumber: string) => void;
  onOpenCreatePo?: () => void;
}

export const PurchaseOrdersList: React.FC<PurchaseOrdersListProps> = ({
  purchaseOrders,
  onAuditPo,
  onOpenCreatePo
}) => {
  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#262a33] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-headline font-extrabold text-white tracking-tight">
              ERP Purchase Orders Master Record
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              ERP SYNCHRONIZED
            </span>
          </div>
          <p className="text-xs text-[#869397] mt-1">
            Authoritative corporate procurement baseline. All vendor invoices are validated against these active PO contractual bounds.
          </p>
        </div>

        {onOpenCreatePo && (
          <button
            onClick={onOpenCreatePo}
            className="px-4 py-2 rounded-xl bg-[#06b6d4] hover:bg-[#38bdf8] text-white font-bold text-xs shadow-md shadow-[#06b6d4]/20 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Purchase Order</span>
          </button>
        )}
      </div>

      {/* PO Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {purchaseOrders.map((po) => {
          const isDemoPo = po.po_number === 'PO-9921';
          return (
            <div
              key={po.po_number}
              className={`bg-[#181c24] border rounded-xl p-5 flex flex-col justify-between space-y-4 transition-all hover:border-[#4cd7f6]/50 ${
                isDemoPo ? 'border-amber-500/50 shadow-lg shadow-amber-500/10' : 'border-[#262a33]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-white">{po.po_number}</span>
                    {isDemoPo && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        ⚡ BENCHMARK PO
                      </span>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    {po.status}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5">
                  <p className="text-sm font-semibold text-white truncate">{po.vendor}</p>
                  <p className="text-xs text-[#869397] line-clamp-2">{po.product}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#262a33] space-y-2 text-xs">
                  <div className="flex justify-between text-[#869397]">
                    <span>Contracted Quantity:</span>
                    <span className="font-mono font-bold text-white">{po.quantity} units</span>
                  </div>
                  <div className="flex justify-between text-[#869397]">
                    <span>Agreed Unit Price:</span>
                    <span className="font-mono font-bold text-emerald-400">₹{po.agreed_unit_price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#869397]">
                    <span>Authorized Ceiling Total:</span>
                    <span className="font-mono font-extrabold text-white text-sm">
                      ₹{po.expected_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#262a33]">
                <button
                  onClick={() => onAuditPo(po.po_number)}
                  className={`w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    isDemoPo 
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold'
                      : 'bg-[#262a33] hover:bg-[#31353e] text-white border border-[#3d494c]'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Audit Invoice Against {po.po_number}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
