import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  ArrowRight, 
  Building, 
  ShoppingBag, 
  Tag, 
  Layers, 
  ExternalLink,
  Zap,
  Plus
} from 'lucide-react';
import { PurchaseOrder, AuditComparisonResult } from '../types';

interface AnalyzeInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrders?: PurchaseOrder[];
  onAuditComplete?: (result: AuditComparisonResult, poNumber: string) => void;
  onAuditSuccess?: (result: AuditComparisonResult, poNumber?: string) => void;
  onOpenCreatePo?: (suggestedPoNumber?: string) => void;
  onRequestCreatePo?: (suggestedPoNumber?: string) => void;
}

const SAMPLE_INVOICES = [
  {
    id: 'test-case-inv-30002',
    name: 'Test Case: INV-30002 (PO-10002)',
    badge: 'Short Delivery (-50 units)',
    po_number: 'PO-10002',
    invoice_number: 'INV-30002',
    date: '2026-03-05',
    vendor: 'OfficeMart Solutions Pvt Ltd',
    tax_id: '33AABCO7890H1Z2',
    product: 'A4 Printer Paper',
    quantity: 150,
    unit_price: 250.00,
    total: 37500.00,
    raw_text: `TAX INVOICE
Invoice Number: INV-30002
Invoice Date: 2026-03-05
Supplier: OfficeMart Solutions Pvt Ltd
GSTIN: 33AABCO7890H1Z2
Billing Entity: Enterprise Tech Operations Ltd
PO Reference: PO-10002

Line Items:
Item Description: A4 Printer Paper
Quantity: 150 units
Unit Rate: ₹250.00
Line Amount: ₹37,500.00

Grand Total Payable: ₹37,500.00
Payment Terms: Net 30 Days`
  },
  {
    id: 'hackathon-p0',
    name: 'Hackathon Benchmark (PO-9921)',
    badge: 'Price Discrepancy',
    po_number: 'PO-9921',
    invoice_number: 'INV-10482',
    date: '2026-03-02',
    vendor: 'Global Supplies Pvt Ltd',
    tax_id: '27AABCG1234F1Z8',
    product: 'Wireless Mouse (Ergonomic Optical 2.4G)',
    quantity: 50,
    unit_price: 499.00,
    total: 24950.00,
    raw_text: `TAX INVOICE
Invoice Number: INV-10482
Invoice Date: 2026-03-02
Supplier: Global Supplies Pvt Ltd
GSTIN / Tax ID: 27AABCG1234F1Z8
Billing Entity: Enterprise Tech Operations Ltd
PO Reference: PO-9921

Line Items:
Item Description: Wireless Mouse (Ergonomic Optical 2.4G)
Quantity: 50 units
Unit Rate: ₹499.00
Line Amount: ₹24,950.00

Grand Total Payable: ₹24,950.00
Payment Terms: Net 30 Days`
  },
  {
    id: 'custom-chair',
    name: 'Precision Office (PO-10001)',
    badge: 'Custom Real Flow',
    po_number: 'PO-10001',
    invoice_number: 'INV-2025-881',
    date: '2026-03-02',
    vendor: 'Precision Office Solutions',
    tax_id: '07AABCP9876C1Z3',
    product: 'Ergonomic Office Chair',
    quantity: 20,
    unit_price: 1200.00,
    total: 24000.00,
    raw_text: `TAX INVOICE
Invoice Number: INV-2025-881
Invoice Date: 2026-03-02
Supplier: Precision Office Solutions
PO Reference: PO-10001

Line Items:
Item: Ergonomic Office Chair
Quantity: 20
Unit Price: ₹1,200.00
Total: ₹24,000.00

Payment Terms: Net 30 Days`
  },
  {
    id: 'qty-surplus',
    name: 'NexaTech Surplus (PO-9884)',
    badge: 'Quantity Surplus',
    po_number: 'PO-9884',
    invoice_number: 'INV-10479',
    date: '2026-03-01',
    vendor: 'NexaTech Solutions',
    tax_id: '19AAECN4455K1Z9',
    product: 'Cloud Routers & Managed Switches',
    quantity: 120,
    unit_price: 1200.00,
    total: 144000.00,
    raw_text: `COMMERCIAL INVOICE
Invoice Number: INV-10479
Invoice Date: 2026-03-01
Supplier: NexaTech Solutions
PO Reference: PO-9884

Line Items:
Item: Cloud Routers & Managed Switches
Quantity Billed: 120 units
Contract Rate: ₹1,200.00 / unit
Total Amount: ₹1,44,000.00`
  },
  {
    id: 'clean-match',
    name: 'Delta Logistics (PO-9642)',
    badge: 'Clean 3-Way Match',
    po_number: 'PO-9642',
    invoice_number: 'INV-10465',
    date: '2026-02-28',
    vendor: 'Delta Logistics Services',
    tax_id: '29AABCD1122J1Z0',
    product: 'Intermodal Freight Dispatch Logistics',
    quantity: 1,
    unit_price: 85000.00,
    total: 85000.00,
    raw_text: `INVOICE DISPATCH VOUCHER
Invoice Number: INV-10465
Invoice Date: 2026-02-28
Vendor: Delta Logistics Services
PO Reference: PO-9642

Description: Intermodal Freight Dispatch Logistics
Quantity: 1 shipment
Agreed Rate: ₹85,000.00
Grand Total: ₹85,000.00`
  }
];

export const AnalyzeInvoiceModal: React.FC<AnalyzeInvoiceModalProps> = ({
  isOpen,
  onClose,
  purchaseOrders = [],
  onAuditComplete,
  onAuditSuccess,
  onOpenCreatePo,
  onRequestCreatePo
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'raw'>('form');

  // Form Fields
  const [invoiceNumber, setInvoiceNumber] = useState<string>('INV-2025-881');
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [vendor, setVendor] = useState<string>('Precision Office Solutions');
  const [taxId, setTaxId] = useState<string>('');
  const [poNumber, setPoNumber] = useState<string>('PO-9921');
  const [product, setProduct] = useState<string>('Ergonomic Office Chair');
  const [quantity, setQuantity] = useState<number>(20);
  const [unitPrice, setUnitPrice] = useState<number>(1200);
  const [total, setTotal] = useState<number>(24000);
  const [rawText, setRawText] = useState<string>(SAMPLE_INVOICES[0].raw_text);

  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [missingPo, setMissingPo] = useState<string | null>(null);

  // Sync total when quantity or unit price changes in form mode
  const handleQuantityChange = (val: number) => {
    setQuantity(val);
    setTotal(Number((val * unitPrice).toFixed(2)));
  };

  const handleUnitPriceChange = (val: number) => {
    setUnitPrice(val);
    setTotal(Number((quantity * val).toFixed(2)));
  };

  // Detect PO from raw text automatically
  const handleRawTextChange = (text: string) => {
    setRawText(text);
    const poMatch = text.match(/(?:po\s*reference|po\s*#|purchase\s*order(?:\s*no\.?)?|p\.?o\.?)[:\s]+(PO-[A-Z0-9\-_]+)/i) ||
                    text.match(/\b(PO-[A-Z0-9\-_]+)\b/i);
    if (poMatch && poMatch[1]) {
      const detected = poMatch[1].trim().toUpperCase();
      setPoNumber(detected);
    }
  };

  // Check PO existence in SQLite ERP store
  const safePoList = Array.isArray(purchaseOrders) ? purchaseOrders : [];
  const matchedPo = safePoList.find(
    p => p?.po_number?.toUpperCase() === (poNumber || '').trim().toUpperCase()
  );

  const triggerOpenCreatePo = (po?: string) => {
    if (onOpenCreatePo) {
      onOpenCreatePo(po);
    } else if (onRequestCreatePo) {
      onRequestCreatePo(po);
    }
  };

  const handleApplyPreset = (preset: typeof SAMPLE_INVOICES[0]) => {
    setInvoiceNumber(preset.invoice_number);
    setInvoiceDate(preset.date);
    setVendor(preset.vendor);
    setTaxId(preset.tax_id);
    setPoNumber(preset.po_number);
    setProduct(preset.product);
    setQuantity(preset.quantity);
    setUnitPrice(preset.unit_price);
    setTotal(preset.total);
    setRawText(preset.raw_text);
    setError(null);
    setMissingPo(null);
  };

  // AI Extraction via Gemini
  const handleExtractWithGemini = async () => {
    if (!rawText.trim()) {
      setError('Please paste raw invoice text before requesting AI extraction.');
      return;
    }

    setIsExtracting(true);
    setError(null);
    setMissingPo(null);

    try {
      const res = await fetch('/api/extract-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_text: rawText, po_number: poNumber })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'AI Extraction failed');
      }

      const ext = data.extracted;
      if (ext.invoice_number) setInvoiceNumber(ext.invoice_number);
      if (ext.vendor) setVendor(ext.vendor);
      if (ext.po_number) setPoNumber(ext.po_number);
      if (ext.product) setProduct(ext.product);
      if (ext.quantity) setQuantity(ext.quantity);
      if (ext.unit_price) setUnitPrice(ext.unit_price);
      if (ext.total) setTotal(ext.total);
      if (ext.date) setInvoiceDate(ext.date);

      setActiveTab('form');
    } catch (err: any) {
      setError(err.message || 'AI extraction failed');
    } finally {
      setIsExtracting(false);
    }
  };

  // Run Forensic Audit
  const handleRunAudit = async () => {
    const targetPo = poNumber.trim().toUpperCase();
    if (!targetPo) {
      setError('Please enter a PO Reference (e.g. PO-9921, PO-10001).');
      return;
    }

    setIsAuditing(true);
    setError(null);
    setMissingPo(null);

    try {
      const payload: any = {
        po_number: targetPo,
        invoice_number: invoiceNumber.trim().toUpperCase(),
        vendor: vendor.trim(),
        product: product.trim(),
        quantity: Number(quantity),
        unit_price: Number(unitPrice),
        total: Number(total),
        date: invoiceDate
      };

      if (activeTab === 'raw') {
        payload.invoice_text = rawText;
      } else {
        // Also provide synthesized payload for logs
        payload.invoice_text = `TAX INVOICE
Invoice Number: ${invoiceNumber}
Date: ${invoiceDate}
Vendor: ${vendor}
GSTIN / Tax ID: ${taxId || 'N/A'}
PO Reference: ${targetPo}
Product: ${product}
Quantity: ${quantity} units
Unit Price: ₹${unitPrice}
Total Payable: ₹${total}`;
      }

      const res = await fetch('/api/analyze-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.missing_po || data.error?.includes('was not found')) {
          setMissingPo(targetPo);
          throw new Error(`Purchase Order ${targetPo} was not found in ERP records.`);
        }
        throw new Error(data.error || 'Forensic audit failed');
      }

      if (onAuditComplete) {
        onAuditComplete(data.comparison, targetPo);
      } else if (onAuditSuccess) {
        onAuditSuccess(data.comparison, targetPo);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to execute forensic audit');
    } finally {
      setIsAuditing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-[#181c24] border border-[#262a33] rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl shadow-cyan-950/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#262a33] bg-[#141822] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#06b6d4]/20 to-[#0284c7]/20 border border-[#06b6d4]/40 flex items-center justify-center text-[#4cd7f6] shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-headline font-bold text-white tracking-tight">
                  Analyze New Vendor Invoice
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#06b6d4]/15 text-[#4cd7f6] border border-[#06b6d4]/30">
                  Forensic Ingestion
                </span>
              </div>
              <p className="text-xs text-[#869397]">
                Ingest any supplier invoice, cross-reference against ERP purchase orders, and calculate mathematical overcharge.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#869397] hover:text-white hover:bg-[#262a33] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Sample Invoices Bar */}
        <div className="bg-[#121620] px-5 py-2.5 border-b border-[#262a33] flex flex-wrap items-center gap-2 shrink-0">
          <span className="text-[11px] font-mono text-[#869397] mr-1 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Quick Presets:
          </span>
          {SAMPLE_INVOICES.map((s) => (
            <button
              key={s.id}
              onClick={() => handleApplyPreset(s)}
              className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#181c24] hover:bg-[#262a33] text-[#bcc9cd] hover:text-white border border-[#262a33] transition-all flex items-center gap-1.5"
            >
              <span>{s.name}</span>
              <span className="text-[9px] font-mono px-1 rounded bg-[#262a33] text-[#869397]">
                {s.badge}
              </span>
            </button>
          ))}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SECTION A: PURCHASE ORDER SELECTION & VERIFICATION */}
          <div className="p-4 bg-[#121620] border border-[#262a33] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-[#06b6d4]/20 text-[#4cd7f6] text-[10px] font-mono font-bold flex items-center justify-center">
                  A
                </span>
                <label className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                  Purchase Order Baseline
                </label>
              </div>
              {matchedPo ? (
                <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#4edea3] bg-[#4edea3]/10 px-2 py-0.5 rounded border border-[#4edea3]/30">
                  <CheckCircle2 className="w-3 h-3" />
                  ERP RECORD VERIFIED
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  <AlertTriangle className="w-3 h-3" />
                  UNREGISTERED PO
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Select from Database POs */}
              <div>
                <label className="block text-[11px] font-mono text-[#869397] mb-1">
                  Select Existing ERP Purchase Order:
                </label>
                <select
                  value={matchedPo ? matchedPo.po_number : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      setPoNumber(e.target.value);
                      const selected = safePoList.find(p => p.po_number === e.target.value);
                      if (selected) {
                        setVendor(selected.vendor || selected.supplier || vendor);
                        setProduct(selected.product || selected.item_description || product);
                      }
                      setMissingPo(null);
                      setError(null);
                    }
                  }}
                  className="w-full bg-[#181c24] border border-[#262a33] focus:border-[#4cd7f6] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
                >
                  <option value="">-- Choose from {safePoList.length} Registered POs --</option>
                  {safePoList.map((p) => (
                    <option key={p.po_number} value={p.po_number}>
                      {p.po_number} - {p.vendor} ({p.product})
                    </option>
                  ))}
                </select>
              </div>

              {/* Or type custom / detected PO */}
              <div>
                <label className="block text-[11px] font-mono text-[#869397] mb-1">
                  Or Specify PO Reference Number:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={poNumber}
                    onChange={(e) => {
                      setPoNumber(e.target.value.toUpperCase());
                      setMissingPo(null);
                      setError(null);
                    }}
                    placeholder="e.g. PO-10002"
                    className="flex-1 bg-[#181c24] border border-[#262a33] focus:border-[#4cd7f6] rounded-lg px-3 py-2 text-xs font-mono font-bold text-white placeholder-[#869397] focus:outline-none"
                  />
                  {(onOpenCreatePo || onRequestCreatePo) && !matchedPo && (
                    <button
                      type="button"
                      onClick={() => triggerOpenCreatePo(poNumber)}
                      className="px-3 py-2 rounded-lg bg-[#262a33] hover:bg-[#31353e] text-[#4cd7f6] text-xs font-semibold border border-[#3d494c] flex items-center gap-1.5 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create PO</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Matched PO Details Card */}
            {matchedPo ? (
              <div className="p-2.5 rounded-lg bg-[#181c24] border border-[#262a33] text-[11px] text-[#869397] flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>Supplier: <strong className="text-white">{matchedPo.vendor || matchedPo.supplier}</strong></span>
                <span>•</span>
                <span>Authorized Item: <strong className="text-white">{matchedPo.product || matchedPo.item_description}</strong></span>
                <span>•</span>
                <span>Expected Qty: <strong className="text-white">{matchedPo.quantity || matchedPo.expected_quantity} units</strong></span>
                <span>•</span>
                <span>Agreed Rate: <strong className="text-[#4edea3] font-mono">₹{(matchedPo.agreed_unit_price || 0).toFixed(2)}</strong></span>
                <span>•</span>
                <span>Cap: <strong className="text-white font-mono">₹{(matchedPo.expected_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></span>
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center justify-between">
                <span>
                  Purchase Order <strong>{poNumber || 'None'}</strong> was not found in the ERP database. Please create it or select an existing PO.
                </span>
                {(onOpenCreatePo || onRequestCreatePo) && (
                  <button
                    type="button"
                    onClick={() => triggerOpenCreatePo(poNumber)}
                    className="ml-3 px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-bold border border-amber-500/40"
                  >
                    + Create {poNumber || 'PO'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* SECTION B: VENDOR INVOICE INPUT */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#262a33] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-[#06b6d4]/20 text-[#4cd7f6] text-[10px] font-mono font-bold flex items-center justify-center">
                  B
                </span>
                <label className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                  Vendor Invoice Input
                </label>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('form')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    activeTab === 'form'
                      ? 'bg-[#06b6d4] text-white shadow-sm'
                      : 'bg-[#121620] text-[#869397] hover:text-white border border-[#262a33]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Structured Form</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('raw')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    activeTab === 'raw'
                      ? 'bg-[#06b6d4] text-white shadow-sm'
                      : 'bg-[#121620] text-[#869397] hover:text-white border border-[#262a33]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Paste Raw Text / OCR</span>
                </button>
              </div>
            </div>

            {/* Missing PO Warning Card */}
            {missingPo && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
                  <div>
                    <span className="font-bold">Purchase Order {missingPo} was not found in ERP repository.</span>
                    <p className="text-[11px] text-rose-200/80 mt-0.5">
                      Vendora AI enforces zero silent substitutions. Please create PO-{missingPo} to audit against it.
                    </p>
                  </div>
                </div>
                {(onOpenCreatePo || onRequestCreatePo) && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      triggerOpenCreatePo(missingPo || undefined);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-md shadow-rose-500/20"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create {missingPo} Now</span>
                  </button>
                )}
              </div>
            )}

            {/* General Error Notice */}
            {error && !missingPo && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* TAB 1: STRUCTURED FORM FIELDS */}
            {activeTab === 'form' && (
              <div className="space-y-4">
                {/* Row 1: Invoice Number & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#869397] mb-1">
                      Invoice Number *
                    </label>
                    <input
                      type="text"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. INV-30002"
                      className="w-full bg-[#121620] border border-[#262a33] focus:border-[#4cd7f6] rounded-lg px-3 py-2 text-xs font-mono font-bold text-white placeholder-[#869397] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#869397] mb-1">
                      Invoice Date *
                    </label>
                    <input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="w-full bg-[#121620] border border-[#262a33] focus:border-[#4cd7f6] rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-[#869397] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Row 2: Vendor Name & Tax ID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#869397] mb-1">
                      Vendor / Supplier Name *
                    </label>
                    <input
                      type="text"
                      value={vendor}
                      onChange={(e) => setVendor(e.target.value)}
                      placeholder="e.g. OfficeMart Solutions Pvt Ltd"
                      className="w-full bg-[#121620] border border-[#262a33] focus:border-[#4cd7f6] rounded-lg px-3 py-2 text-xs text-white placeholder-[#869397] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#869397] mb-1">
                      GSTIN / Tax ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value.toUpperCase())}
                      placeholder="e.g. 33AABCO7890H1Z2"
                      className="w-full bg-[#121620] border border-[#262a33] focus:border-[#4cd7f6] rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-[#869397] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Row 3: Item Description */}
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#869397] mb-1">
                    Item Description / Product *
                  </label>
                  <input
                    type="text"
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    placeholder="e.g. A4 Printer Paper"
                    className="w-full bg-[#121620] border border-[#262a33] focus:border-[#4cd7f6] rounded-lg px-3 py-2 text-xs text-white placeholder-[#869397] focus:outline-none"
                  />
                </div>

                {/* Row 4: Quantity, Unit Price, Total */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#869397] mb-1">
                      Billed Quantity (units) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-[#121620] border border-[#262a33] focus:border-[#4cd7f6] rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-[#869397] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#869397] mb-1">
                      Unit Price (₹) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={unitPrice}
                      onChange={(e) => handleUnitPriceChange(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#121620] border border-[#262a33] focus:border-[#4cd7f6] rounded-lg px-3 py-2 text-xs font-mono text-[#4edea3] font-bold placeholder-[#869397] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#869397] mb-1">
                      Invoice Total (₹) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={total}
                      onChange={(e) => setTotal(parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#121620] border border-[#262a33] focus:border-[#4cd7f6] rounded-lg px-3 py-2 text-xs font-mono font-extrabold text-white placeholder-[#869397] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: RAW INVOICE TEXT PAYLOAD */}
            {activeTab === 'raw' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase text-[#869397]">
                    Raw Supplier Invoice Document Payload
                  </label>
                  <button
                    type="button"
                    onClick={handleExtractWithGemini}
                    disabled={isExtracting}
                    className="px-3 py-1.5 rounded-lg bg-[#262a33] hover:bg-[#31353e] text-[#4cd7f6] text-xs font-mono font-bold border border-[#06b6d4]/40 flex items-center gap-1.5 transition-all"
                  >
                    {isExtracting ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                        <span>Gemini Extracting...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Extract Entities with Gemini</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  rows={10}
                  value={rawText}
                  onChange={(e) => handleRawTextChange(e.target.value)}
                  placeholder="Paste raw invoice text, OCR scan, or supplier EDI document (e.g. PO Reference: PO-10002)..."
                  className="w-full bg-[#121620] border border-[#262a33] focus:border-[#4cd7f6] rounded-xl p-3.5 text-xs font-mono text-[#dfe2ee] placeholder-[#869397] focus:outline-none leading-relaxed"
                />
                <p className="text-[11px] text-[#869397]">
                  PO references like "PO Reference: PO-10002" are detected in real-time. Click "Extract Entities with Gemini" to parse all fields into the form.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-[#262a33] bg-[#141822] flex items-center justify-between shrink-0">
          <div className="text-xs text-[#869397]">
            <span>Deterministic checks: </span>
            <strong className="text-emerald-400 font-mono">0.00% variance tolerance</strong>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#262a33] hover:bg-[#31353e] text-[#bcc9cd] hover:text-white text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRunAudit}
              disabled={isAuditing}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#0284c7] hover:from-[#38bdf8] hover:to-[#0369a1] text-white text-xs font-bold shadow-lg shadow-[#06b6d4]/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {isAuditing ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  <span>Executing Audit & DB Write...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run Forensic Audit</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
