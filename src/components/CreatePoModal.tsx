import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, CheckCircle2, AlertTriangle, Building, Box, Hash, DollarSign, Calendar, FileText, Sparkles } from 'lucide-react';
import { PurchaseOrder } from '../types';

interface CreatePoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPoCreated: (newPo?: PurchaseOrder) => void;
  initialPoNumber?: string;
}

export const CreatePoModal: React.FC<CreatePoModalProps> = ({
  isOpen,
  onClose,
  onPoCreated,
  initialPoNumber
}) => {
  const [poNumber, setPoNumber] = useState<string>('PO-10002');
  const [poDate, setPoDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [buyer, setBuyer] = useState<string>('Enterprise Tech Operations Ltd');
  const [supplier, setSupplier] = useState<string>('OfficeMart Solutions Pvt Ltd');
  const [supplierGstin, setSupplierGstin] = useState<string>('33AABCO7890H1Z2');
  const [itemDescription, setItemDescription] = useState<string>('A4 Printer Paper');
  const [expectedQuantity, setExpectedQuantity] = useState<number>(200);
  const [agreedUnitPrice, setAgreedUnitPrice] = useState<number>(250);
  const [paymentTerms, setPaymentTerms] = useState<string>('Net 30 Days');
  const [status, setStatus] = useState<'APPROVED' | 'PENDING' | 'CLOSED'>('APPROVED');
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialPoNumber && initialPoNumber.trim()) {
      setPoNumber(initialPoNumber.trim().toUpperCase());
    }
  }, [initialPoNumber, isOpen]);

  if (!isOpen) return null;

  const calculatedTotal = Number((expectedQuantity * agreedUnitPrice).toFixed(2));

  const loadTestCasePreset = () => {
    setPoNumber('PO-10002');
    setPoDate(new Date().toISOString().split('T')[0]);
    setBuyer('Enterprise Tech Operations Ltd');
    setSupplier('OfficeMart Solutions Pvt Ltd');
    setSupplierGstin('33AABCO7890H1Z2');
    setItemDescription('A4 Printer Paper');
    setExpectedQuantity(200);
    setAgreedUnitPrice(250);
    setPaymentTerms('Net 30 Days');
    setStatus('APPROVED');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Validation
    const cleanPo = poNumber.trim().toUpperCase();
    const cleanSupplier = supplier.trim();
    const cleanItem = itemDescription.trim();

    if (!cleanPo) {
      setError('PO Number is required.');
      return;
    }
    if (!cleanSupplier) {
      setError('Supplier / Vendor name is required.');
      return;
    }
    if (!cleanItem) {
      setError('Item Description is required.');
      return;
    }
    if (isNaN(expectedQuantity) || expectedQuantity <= 0) {
      setError('Expected Quantity must be a positive number greater than 0.');
      return;
    }
    if (isNaN(agreedUnitPrice) || agreedUnitPrice <= 0) {
      setError('Agreed Unit Price must be a positive number greater than 0.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          po_number: cleanPo,
          po_date: poDate,
          buyer: buyer.trim(),
          vendor: cleanSupplier,
          supplier: cleanSupplier,
          supplier_gstin: supplierGstin.trim(),
          product: cleanItem,
          item_description: cleanItem,
          quantity: expectedQuantity,
          expected_quantity: expectedQuantity,
          agreed_unit_price: agreedUnitPrice,
          expected_total: calculatedTotal,
          payment_terms: paymentTerms.trim(),
          status: status
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create Purchase Order in ERP database.');
      }

      setSuccessMsg(`Purchase Order ${cleanPo} successfully registered in ERP database.`);
      onPoCreated(data.purchase_order);
      
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the Purchase Order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#181c24] border border-[#262a33] rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl shadow-cyan-950/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#262a33] bg-[#141822] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#06b6d4]/15 border border-[#06b6d4]/30 flex items-center justify-center text-[#4cd7f6]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-headline font-bold text-white">Create Purchase Order</h2>
              <p className="text-xs text-[#869397]">Authorized ERP contract baseline for three-way invoice matching</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadTestCasePreset}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-mono transition-colors"
              title="Preload Test Case PO-10002"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load PO-10002 Preset</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#869397] hover:text-white hover:bg-[#262a33] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="m-5 mb-0 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="m-5 mb-0 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Row 1: PO Number & PO Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase text-[#869397] mb-1">
                PO Reference Number *
              </label>
              <input
                type="text"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value.toUpperCase())}
                placeholder="e.g. PO-10002"
                required
                className="w-full bg-[#121620] border border-[#262a33] focus:border-[#4cd7f6] rounded-lg px-3 py-2 text-xs font-mono font-bold text-white placeholder-[#869397] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-[#869397] mb-1">
                PO Date *
              </label>
              <input
                type="date"
                value={poDate}
                onChange={(e) => setPoDate(e.target.value)}
                required
                className="w-full bg-[#121620] border border-[#262a33] focus:border-[#4cd7f6] rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-[#869397] focus:outline-none"
              />
            </div>
          </div>

          {/* Row 2: Buyer / Billing Entity */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-[#869397] mb-1">
              Buyer / Billing Entity *
            </label>
            <input
              type="text"
              value={buyer}
              onChange={(e) => setBuyer(e.target.value)}
              placeholder="e.g. Enterprise Tech Operations Ltd"
              required
              className="w-full bg-[#121620] border border-[#262a33] focus:border-[#4cd7f6] rounded-lg px-3 py-2 text-xs text-white placeholder-[#869397] focus:outline-none"
            />
          </div>

          {/* Row 3: Supplier / Vendor & GSTIN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase text-[#869397] mb-1">
                Supplier / Vendor Legal Name *
              </label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="e.g. OfficeMart Solutions Pvt Ltd"
                required
                className="w-full bg-[#121620] border border-[#262a33] focus:border-[#4cd7f6] rounded-lg px-3 py-2 text-xs text-white placeholder-[#869397] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-[#869397] mb-1">
                Supplier GSTIN / Tax ID <span className="text-[#869397]/70 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={supplierGstin}
                onChange={(e) => setSupplierGstin(e.target.value.toUpperCase())}
                placeholder="e.g. 33AABCO7890H1Z2"
                className="w-full bg-[#121620] border border-[#262a33] focus:border-[#4cd7f6] rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-[#869397] focus:outline-none"
              />
            </div>
          </div>

          {/* Row 4: Item Description */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-[#869397] mb-1">
              Item Description *
            </label>
            <input
              type="text"
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              placeholder="e.g. A4 Printer Paper"
              required
              className="w-full bg-[#121620] border border-[#262a33] focus:border-[#4cd7f6] rounded-lg px-3 py-2 text-xs text-white placeholder-[#869397] focus:outline-none"
            />
          </div>

          {/* Row 5: Expected Quantity, Agreed Unit Price, Expected Total */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase text-[#869397] mb-1">
                Expected Quantity (units) *
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={expectedQuantity}
                onChange={(e) => setExpectedQuantity(parseInt(e.target.value, 10) || 0)}
                required
                className="w-full bg-[#121620] border border-[#262a33] focus:border-[#4cd7f6] rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-[#869397] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-[#869397] mb-1">
                Agreed Unit Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={agreedUnitPrice}
                onChange={(e) => setAgreedUnitPrice(parseFloat(e.target.value) || 0)}
                required
                className="w-full bg-[#121620] border border-[#262a33] focus:border-[#4cd7f6] rounded-lg px-3 py-2 text-xs font-mono text-[#4edea3] font-bold placeholder-[#869397] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-[#869397] mb-1">
                Expected Total (₹)
              </label>
              <div className="w-full bg-[#121620] border border-[#262a33] rounded-lg px-3 py-2 text-xs font-mono text-white font-extrabold flex items-center justify-between">
                <span>₹{calculatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                <span className="text-[10px] text-[#869397] font-normal font-sans">Auto-calculated</span>
              </div>
            </div>
          </div>

          {/* Row 6: Payment Terms & PO Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase text-[#869397] mb-1">
                Payment Terms *
              </label>
              <input
                type="text"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                placeholder="e.g. Net 30 Days"
                required
                className="w-full bg-[#121620] border border-[#262a33] focus:border-[#4cd7f6] rounded-lg px-3 py-2 text-xs text-white placeholder-[#869397] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-[#869397] mb-1">
                PO Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-[#121620] border border-[#262a33] focus:border-[#4cd7f6] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
              >
                <option value="APPROVED">APPROVED (Active for Settlement)</option>
                <option value="PENDING">PENDING (Pending ERP Sign-off)</option>
                <option value="CLOSED">CLOSED (Completed)</option>
              </select>
            </div>
          </div>

          {/* Audit Rule Calculation Preview */}
          <div className="p-3 bg-[#121620] border border-[#262a33] rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#869397]">
              <CheckCircle2 className="w-4 h-4 text-[#4edea3]" />
              <span>Formula: {expectedQuantity} units × ₹{agreedUnitPrice.toFixed(2)}</span>
            </div>
            <span className="font-mono text-xs font-bold text-[#4cd7f6]">
              Ceiling: ₹{calculatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[#262a33] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#262a33] hover:bg-[#31353e] text-[#bcc9cd] hover:text-white text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#38bdf8] text-white text-xs font-bold shadow-md shadow-[#06b6d4]/20 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>Registering PO in SQLite...</span>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Create Purchase Order</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
