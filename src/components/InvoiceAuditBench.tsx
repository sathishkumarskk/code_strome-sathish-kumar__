import React, { useState, useEffect } from 'react';
import { 
  ScanSearch, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  FileText, 
  RotateCcw, 
  Send, 
  DollarSign, 
  Calculator, 
  ShieldAlert, 
  ShieldCheck, 
  FileCheck2,
  MessageSquare,
  Copy,
  ExternalLink,
  ChevronDown,
  Info,
  Clock,
  Check,
  Building,
  Box
} from 'lucide-react';
import { AuditComparisonResult, PurchaseOrder } from '../types';

interface InvoiceAuditBenchProps {
  initialPo?: string;
  initialInvoiceText?: string;
  initialResult?: AuditComparisonResult | null;
  onOpenDispute: (invNumber: string, poNumber: string, vendor: string, overcharge: number, reason: string) => void;
  onRefreshData?: () => void;
  onOpenAnalyzeModal?: () => void;
  onOpenCreatePo?: (suggestedPo?: string) => void;
}

const PRESET_HACKATHON = {
  po_number: 'PO-9921',
  text: `TAX INVOICE
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

Subtotal: ₹24,950.00
Applicable Taxes: Included in base contract
Grand Total Payable: ₹24,950.00

Payment Terms: Net 30 Days via NEFT/RTGS
Remittance Account: Global Supplies Commercial Current A/C #88219401`
};

const PRESET_TEST_CASE_30002 = {
  po_number: 'PO-10002',
  text: `TAX INVOICE
Invoice Number: INV-30002
Invoice Date: 2026-03-05
Supplier: OfficeMart Solutions Pvt Ltd
GSTIN / Tax ID: 33AABCO7890H1Z2
Billing Entity: Enterprise Corporate Services
PO Reference: PO-10002

Line Items:
Item Description: A4 Printer Paper (Ream 500 Sheets)
Quantity: 150 units
Unit Rate: ₹250.00
Line Amount: ₹37,500.00

Subtotal: ₹37,500.00
Applicable Taxes: Included in base contract
Grand Total Payable: ₹37,500.00

Payment Terms: Net 30 Days via NEFT/RTGS`
};

const PRESET_QTY_SURPLUS = {
  po_number: 'PO-9884',
  text: `COMMERCIAL INVOICE
Invoice Number: INV-10479
Invoice Date: 2026-03-01
Supplier: NexaTech Solutions
PO Reference: PO-9884

Line Items:
Item Description: Cloud Routers & Managed Switches
Quantity Billed: 120 units
Contract Rate: ₹1,200.00 / unit
Total Amount: ₹1,44,000.00

Terms: Deliveries exceeding PO ceiling billed at contracted volume rate.`
};

const PRESET_CLEAN_MATCH = {
  po_number: 'PO-9642',
  text: `INVOICE DISPATCH VOUCHER
Invoice Number: INV-10465
Invoice Date: 2026-02-28
Vendor: Delta Logistics Services
PO Reference: PO-9642

Description: Intermodal Freight Dispatch Logistics
Quantity: 1 shipment
Agreed Rate: ₹85,000.00
Grand Total: ₹85,000.00

Incoterms: DDP. Three-way match verified against dispatch slip #DS-9901.`
};

export const InvoiceAuditBench: React.FC<InvoiceAuditBenchProps> = ({
  initialPo,
  initialInvoiceText,
  initialResult,
  onOpenDispute,
  onRefreshData,
  onOpenAnalyzeModal,
  onOpenCreatePo
}) => {
  const [poNumber, setPoNumber] = useState<string>(initialPo || 'PO-9921');
  const [invoiceText, setInvoiceText] = useState<string>(initialInvoiceText || PRESET_HACKATHON.text);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [pipelineStep, setPipelineStep] = useState<number>(0);
  const [result, setResult] = useState<AuditComparisonResult | null>(initialResult || null);
  const [error, setError] = useState<string | null>(null);
  const [missingPo, setMissingPo] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>('');
  const [notesList, setNotesList] = useState<string[]>([]);
  const [shortPaySuccess, setShortPaySuccess] = useState<boolean>(false);
  const [overrideSuccess, setOverrideSuccess] = useState<boolean>(false);

  // Sync initial props
  useEffect(() => {
    if (initialPo) setPoNumber(initialPo);
    if (initialInvoiceText) setInvoiceText(initialInvoiceText);
    if (initialResult) setResult(initialResult);
  }, [initialPo, initialInvoiceText, initialResult]);

  const handleApplyPreset = (preset: { po_number: string; text: string }) => {
    setPoNumber(preset.po_number);
    setInvoiceText(preset.text);
    setResult(null);
    setError(null);
    setMissingPo(null);
    setShortPaySuccess(false);
    setOverrideSuccess(false);
  };

  const handleRunAudit = async () => {
    if (!invoiceText.trim()) {
      setError('Please provide raw invoice text or choose a scenario.');
      return;
    }

    setIsAuditing(true);
    setError(null);
    setMissingPo(null);
    setShortPaySuccess(false);
    setOverrideSuccess(false);
    setPipelineStep(1);

    // Realistic pipeline animation steps
    setTimeout(() => setPipelineStep(2), 350);
    setTimeout(() => setPipelineStep(3), 700);
    setTimeout(() => setPipelineStep(4), 1050);

    try {
      const response = await fetch('/api/analyze-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          po_number: poNumber.trim().toUpperCase(),
          invoice_text: invoiceText
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        if (data.missing_po || data.error?.includes('was not found')) {
          setMissingPo(poNumber.trim().toUpperCase());
          throw new Error(`Purchase Order ${poNumber.trim().toUpperCase()} was not found in ERP repository.`);
        }
        throw new Error(data.error || 'Failed to audit invoice');
      }

      setPipelineStep(5);
      setTimeout(() => {
        setResult(data.comparison);
        setIsAuditing(false);
        setPipelineStep(0);
        if (onRefreshData) onRefreshData();
      }, 300);
    } catch (err: any) {
      setError(err.message || 'Audit execution encountered an error');
      setIsAuditing(false);
      setPipelineStep(0);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !result) return;
    try {
      await fetch(`/api/invoices/${result.invoice_number}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: noteText,
          author: 'Elena Rostova',
          role: 'Lead AP Forensic Auditor'
        })
      });
      setNotesList([noteText, ...notesList]);
      setNoteText('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleShortPay = async () => {
    if (!result) return;
    try {
      await fetch(`/api/invoices/${result.invoice_number}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SHORT_PAY',
          note: `Authorized settlement for exact PO expected total ₹${result.expected_total.toFixed(2)}. Deducted unauthorized surcharge ₹${result.potential_overcharge.toFixed(2)}.`
        })
      });
      setShortPaySuccess(true);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveOverride = async () => {
    if (!result) return;
    try {
      await fetch(`/api/invoices/${result.invoice_number}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'APPROVE',
          note: 'Auditor authorized executive variance override after procurement confirmation.'
        })
      });
      setOverrideSuccess(true);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Bench Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#262a33] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-headline font-extrabold text-white tracking-tight">
              Invoice Audit Bench
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#06b6d4]/15 text-[#4cd7f6] border border-[#06b6d4]/30">
              Interactive Workspace
            </span>
          </div>
          <p className="text-xs text-[#869397] mt-1">
            Deterministic PO vs Invoice forensic validation engine backed by Gemini 3.8 Flash entity extraction.
          </p>
        </div>

        {/* Preset Scenarios Tabs & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenAnalyzeModal && (
            <button
              onClick={onOpenAnalyzeModal}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#06b6d4] hover:bg-[#38bdf8] text-white shadow-md shadow-[#06b6d4]/20 flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Analyze New Invoice</span>
            </button>
          )}
          <button
            onClick={() => handleApplyPreset(PRESET_HACKATHON)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              poNumber === 'PO-9921' 
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' 
                : 'bg-[#181c24] hover:bg-[#262a33] text-amber-300 border border-amber-500/30'
            }`}
          >
            <span>⚡ Demo Case (PO-9921)</span>
          </button>
          <button
            onClick={() => handleApplyPreset(PRESET_TEST_CASE_30002)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              poNumber === 'PO-10002' 
                ? 'bg-[#4edea3] text-slate-950 shadow-md shadow-emerald-500/20 font-bold' 
                : 'bg-[#181c24] hover:bg-[#262a33] text-[#4edea3] border border-emerald-500/30'
            }`}
          >
            <span>PO-10002 Test Case (INV-30002)</span>
          </button>
          <button
            onClick={() => handleApplyPreset(PRESET_QTY_SURPLUS)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              poNumber === 'PO-9884' 
                ? 'bg-[#06b6d4] text-white shadow-md' 
                : 'bg-[#181c24] hover:bg-[#262a33] text-[#bcc9cd] border border-[#262a33]'
            }`}
          >
            Quantity Surplus (PO-9884)
          </button>
          <button
            onClick={() => handleApplyPreset(PRESET_CLEAN_MATCH)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              poNumber === 'PO-9642' 
                ? 'bg-emerald-500 text-white shadow-md' 
                : 'bg-[#181c24] hover:bg-[#262a33] text-emerald-300 border border-emerald-500/30'
            }`}
          >
            Clean 3-Way Match (PO-9642)
          </button>
        </div>
      </div>

      {/* Input Form & Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Target PO & Config */}
        <div className="bg-[#181c24] border border-[#262a33] rounded-xl p-5 space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-[#869397] mb-1.5">
              Verified ERP PO Reference
            </label>
            <input
              type="text"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              placeholder="e.g. PO-9921"
              className="w-full bg-[#121620] border border-[#262a33] focus:border-[#4cd7f6] rounded-lg px-3.5 py-2 text-sm font-mono text-white placeholder-[#869397] focus:outline-none"
            />
            <p className="text-[11px] text-[#869397] mt-1">
              ERP Master Record: Matches against registered Purchase Orders in SQLite.
            </p>
          </div>

          <div className="p-3.5 bg-[#121620] rounded-lg border border-[#262a33] space-y-2 text-xs">
            <div className="flex justify-between items-center text-[#869397]">
              <span>Extraction Engine:</span>
              <span className="font-mono text-[#4cd7f6] font-bold">Gemini 3.8 Flash</span>
            </div>
            <div className="flex justify-between items-center text-[#869397]">
              <span>Business Logic:</span>
              <span className="font-mono text-emerald-400 font-bold">Deterministic Application Code</span>
            </div>
            <div className="flex justify-between items-center text-[#869397]">
              <span>Tolerance Mode:</span>
              <span className="font-mono text-amber-300">Strict (0.00% variance)</span>
            </div>
          </div>

          {/* Run Button */}
          <button
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#0284c7] hover:from-[#38bdf8] hover:to-[#0369a1] text-white font-bold text-sm shadow-lg shadow-[#06b6d4]/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {isAuditing ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Executing Forensic Audit...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run AI Audit & PO Comparison</span>
              </>
            )}
          </button>
        </div>

        {/* Right 2 Cols: Raw Invoice Document Payload */}
        <div className="lg:col-span-2 bg-[#181c24] border border-[#262a33] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono uppercase text-[#869397]">
                Raw Invoice Document / Payload (Text or OCR Data)
              </label>
              <span className="text-[11px] font-mono text-[#4cd7f6]">
                Editable Payload
              </span>
            </div>
            <textarea
              rows={8}
              value={invoiceText}
              onChange={(e) => setInvoiceText(e.target.value)}
              placeholder="Paste raw vendor invoice text here..."
              className="w-full bg-[#121620] border border-[#262a33] focus:border-[#4cd7f6] rounded-lg p-3.5 text-xs font-mono text-[#dfe2ee] placeholder-[#869397] focus:outline-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#869397] pt-3 border-t border-[#262a33] mt-2">
            <span>Supports raw text, PDF transcripts, ERP JSON packets, and email attachments.</span>
            <button
              onClick={() => handleApplyPreset(PRESET_HACKATHON)}
              className="text-[#4cd7f6] hover:underline font-semibold"
            >
              Reset to PO-9921 Demo Case
            </button>
          </div>
        </div>
      </div>

      {/* Missing PO Alert Banner with Action */}
      {missingPo && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
            <div>
              <span className="font-bold text-sm">Purchase Order {missingPo} was not found.</span>
              <p className="text-[11px] text-rose-200/80 mt-0.5">
                The database does not contain this Purchase Order. Vendora AI will NOT silently substitute another PO.
              </p>
            </div>
          </div>
          {onOpenCreatePo && (
            <button
              onClick={() => onOpenCreatePo(missingPo)}
              className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-md shadow-rose-500/20"
            >
              <span>Create Purchase Order {missingPo}</span>
            </button>
          )}
        </div>
      )}

      {/* General Error Message */}
      {error && !missingPo && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Pipeline Execution Animation Bar */}
      {isAuditing && (
        <div className="bg-[#181c24] border border-[#262a33] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-white font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#4cd7f6] animate-pulse" />
              Continuous Audit Pipeline Executing
            </span>
            <span className="text-[#4cd7f6]">Step {pipelineStep} of 4</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className={`p-3 rounded-lg border transition-all ${pipelineStep >= 1 ? 'bg-[#06b6d4]/10 border-[#06b6d4]/40 text-white' : 'bg-[#121620] border-[#262a33] text-[#869397]'}`}>
              <div className="font-mono text-[10px] text-[#4cd7f6]">STEP 1</div>
              <div className="font-semibold mt-1">Gemini AI Extraction</div>
              <div className="text-[10px] text-[#869397]">Parsing entities & line items</div>
            </div>
            <div className={`p-3 rounded-lg border transition-all ${pipelineStep >= 2 ? 'bg-[#06b6d4]/10 border-[#06b6d4]/40 text-white' : 'bg-[#121620] border-[#262a33] text-[#869397]'}`}>
              <div className="font-mono text-[10px] text-[#4cd7f6]">STEP 2</div>
              <div className="font-semibold mt-1">ERP Master Lookup</div>
              <div className="text-[10px] text-[#869397]">Retrieved {poNumber} from SQLite</div>
            </div>
            <div className={`p-3 rounded-lg border transition-all ${pipelineStep >= 3 ? 'bg-[#06b6d4]/10 border-[#06b6d4]/40 text-white' : 'bg-[#121620] border-[#262a33] text-[#869397]'}`}>
              <div className="font-mono text-[10px] text-[#4cd7f6]">STEP 3</div>
              <div className="font-semibold mt-1">Deterministic Rules</div>
              <div className="text-[10px] text-[#869397]">Calculating rate & qty delta</div>
            </div>
            <div className={`p-3 rounded-lg border transition-all ${pipelineStep >= 4 ? 'bg-[#06b6d4]/10 border-[#06b6d4]/40 text-white' : 'bg-[#121620] border-[#262a33] text-[#869397]'}`}>
              <div className="font-mono text-[10px] text-[#4cd7f6]">STEP 4</div>
              <div className="font-semibold mt-1">Sealing Audit Trail</div>
              <div className="text-[10px] text-[#869397]">Writing cryptographic log</div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Comparison Results View */}
      {result && !isAuditing && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Status Verdict Header Banner */}
          <div className={`rounded-2xl p-6 border shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 ${
            result.status === 'DISCREPANCY'
              ? 'bg-gradient-to-r from-rose-950/40 via-[#201822] to-[#181c24] border-rose-500/40'
              : 'bg-gradient-to-r from-emerald-950/40 via-[#14221c] to-[#181c24] border-emerald-500/40'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                result.status === 'DISCREPANCY'
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                  : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
              }`}>
                {result.status === 'DISCREPANCY' ? (
                  <AlertTriangle className="w-8 h-8" />
                ) : (
                  <CheckCircle2 className="w-8 h-8" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-extrabold px-2.5 py-0.5 rounded-full border ${
                    result.status === 'DISCREPANCY'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {result.status === 'DISCREPANCY' ? 'DISCREPANCY DETECTED' : '3-WAY MATCH VERIFIED (CLEAR)'}
                  </span>
                  <span className="text-xs font-mono text-[#869397]">
                    Invoice: <strong className="text-white">{result.invoice_number}</strong>
                  </span>
                </div>
                <h2 className="text-xl font-headline font-extrabold text-white mt-1">
                  {result.status === 'DISCREPANCY'
                    ? `Potential Overcharge: ₹${result.potential_overcharge.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                    : 'Clean Settlement Approved: ₹0.00 Variance'}
                </h2>
                <p className="text-xs text-[#bcc9cd] mt-0.5 max-w-2xl">
                  {result.explanation}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons on Verdict */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {result.status === 'DISCREPANCY' && (
                <>
                  <button
                    onClick={() => onOpenDispute(
                      result.invoice_number,
                      result.po_number,
                      result.vendor,
                      result.potential_overcharge,
                      result.explanation
                    )}
                    className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-lg shadow-rose-500/20 flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Dispute Notice</span>
                  </button>

                  <button
                    onClick={handleShortPay}
                    className="px-4 py-2.5 rounded-xl bg-[#262a33] hover:bg-[#31353e] border border-[#3d494c] text-white text-xs font-semibold flex items-center gap-2 transition-all active:scale-95"
                  >
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Short-Pay (Pay ₹{result.expected_total.toLocaleString('en-IN')})</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {shortPaySuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
              <span className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Short-Pay Remittance Voucher Authorized: Scheduled ₹{result.expected_total.toLocaleString('en-IN')} disbursement; deducted ₹{result.potential_overcharge.toLocaleString('en-IN')} overcharge.
              </span>
            </div>
          )}

          {overrideSuccess && (
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-center justify-between">
              <span className="flex items-center gap-2 font-medium">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                Auditor Override Recorded: Invoice released for payment with executive approval tag.
              </span>
            </div>
          )}

          {/* SIDE-BY-SIDE COMPARISON TABLE */}
          <div className="bg-[#181c24] border border-[#262a33] rounded-xl overflow-hidden">
            <div className="p-5 border-b border-[#262a33] bg-[#151922] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[#4cd7f6]" />
                <h3 className="text-sm font-bold font-headline text-white tracking-wide">
                  Line-Item Deterministic Comparison (PO vs Invoice)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#869397]">
                ERP PO Reference: <strong className="text-white">{result.po_number}</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#262a33] text-[11px] font-mono uppercase text-[#869397] bg-[#121620]">
                    <th className="py-3.5 px-5">Metric / Line Attribute</th>
                    <th className="py-3.5 px-5 text-right bg-blue-950/10">ERP PO Expected ({result.po_number})</th>
                    <th className="py-3.5 px-5 text-right bg-purple-950/10">Vendor Invoice ({result.invoice_number})</th>
                    <th className="py-3.5 px-5 text-right">Variance / Delta</th>
                    <th className="py-3.5 px-5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262a33] text-xs">
                  {/* Supplier Entity */}
                  <tr className="hover:bg-[#1f242e] transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-white">Vendor Entity Name</td>
                    <td className="py-3.5 px-5 text-right font-medium text-[#bcc9cd]">{result.vendor}</td>
                    <td className="py-3.5 px-5 text-right font-medium text-white">{result.vendor}</td>
                    <td className="py-3.5 px-5 text-right text-[#869397] font-mono">0.00%</td>
                    <td className="py-3.5 px-5 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        MATCH
                      </span>
                    </td>
                  </tr>

                  {/* Product */}
                  <tr className="hover:bg-[#1f242e] transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-white">Line Item Description</td>
                    <td className="py-3.5 px-5 text-right font-medium text-[#bcc9cd]">{result.product}</td>
                    <td className="py-3.5 px-5 text-right font-medium text-white">{result.product}</td>
                    <td className="py-3.5 px-5 text-right text-[#869397] font-mono">Normalized</td>
                    <td className="py-3.5 px-5 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        MATCH
                      </span>
                    </td>
                  </tr>

                  {/* Quantity */}
                  <tr className="hover:bg-[#1f242e] transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-white">Delivered Quantity</td>
                    <td className="py-3.5 px-5 text-right font-mono font-bold text-white">
                      {result.expected_quantity} units
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono font-bold text-white">
                      {result.invoice_quantity} units
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono">
                      {result.quantity_variance === 0 ? (
                        <span className="text-emerald-400 font-bold">0 units</span>
                      ) : (
                        <span className="text-rose-400 font-bold">+{result.quantity_variance} units</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      {result.quantity_status === 'CLEAR' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          CLEAR
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          {result.quantity_status}
                        </span>
                      )}
                    </td>
                  </tr>

                  {/* Unit Price */}
                  <tr className={`transition-colors ${result.price_status === 'OVERCHARGE' ? 'bg-rose-950/20' : 'hover:bg-[#1f242e]'}`}>
                    <td className="py-3.5 px-5 font-semibold text-white">Contracted Unit Rate</td>
                    <td className="py-3.5 px-5 text-right font-mono font-bold text-emerald-400 text-sm">
                      ₹{result.expected_unit_price.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono font-bold text-rose-400 text-sm">
                      ₹{result.invoice_unit_price.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono font-bold">
                      {result.price_variance > 0 ? (
                        <span className="text-rose-400">
                          +₹{result.price_variance.toFixed(2)} / unit (+{((result.price_variance / result.expected_unit_price) * 100).toFixed(1)}%)
                        </span>
                      ) : (
                        <span className="text-emerald-400">₹0.00</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      {result.price_status === 'CLEAR' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          CLEAR
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          DISCREPANCY
                        </span>
                      )}
                    </td>
                  </tr>

                  {/* Total Line Amount */}
                  <tr className="bg-[#151922] font-semibold text-sm">
                    <td className="py-4 px-5 text-white">Total Line Settlement</td>
                    <td className="py-4 px-5 text-right font-mono text-emerald-400">
                      ₹{result.expected_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-5 text-right font-mono text-rose-400">
                      ₹{result.invoice_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-5 text-right font-mono text-rose-400 font-extrabold">
                      {result.total_variance > 0 ? `+₹${result.total_variance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00'}
                    </td>
                    <td className="py-4 px-5 text-center">
                      {result.potential_overcharge > 0 ? (
                        <span className="px-2.5 py-1 rounded text-[10px] font-mono font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          OVERCHARGE
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          MATCHED
                        </span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* "WHY WAS THIS FLAGGED?" FORENSIC AUDIT CARD */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Mathematical Calculation Proof Card */}
            <div className="lg:col-span-2 bg-[#181c24] border border-[#262a33] rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#262a33] pb-3">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold font-headline text-white">
                    Why Was This Flagged? (Deterministic Proof)
                  </h3>
                </div>
                <span className="text-[10px] font-mono bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                  {result.status === 'CLEAR' ? 'COMPLIANT §4.0' : result.discrepancy_vector === 'QUANTITY_SURPLUS' ? 'QTY_CEILING §4.1' : 'PRICE_TOLERANCE §4.2'}
                </span>
              </div>

              {result.status === 'CLEAR' ? (
                <div className="bg-[#121620] rounded-xl p-4 border border-[#262a33] space-y-2">
                  <div className="text-emerald-400 font-mono text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Zero Variance Detected — 100% Deterministic Match
                  </div>
                  <p className="text-xs text-[#bcc9cd]">
                    All line parameters match Purchase Order <strong className="text-white">{result.po_number}</strong> exactly. Delivered quantity ({result.invoice_quantity} units) and unit pricing (₹{result.invoice_unit_price.toFixed(2)}) align with agreed terms.
                  </p>
                </div>
              ) : (
                <>
                  {/* Dynamic Metric Breakdown Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-[#121620] border border-[#262a33]">
                      <div className="text-[10px] font-mono uppercase text-[#869397]">PO Unit Price</div>
                      <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">
                        ₹{result.expected_unit_price.toFixed(2)}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#121620] border border-[#262a33]">
                      <div className="text-[10px] font-mono uppercase text-[#869397]">Invoice Unit Price</div>
                      <div className="text-sm font-mono font-bold text-rose-400 mt-0.5">
                        ₹{result.invoice_unit_price.toFixed(2)}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#121620] border border-[#262a33]">
                      <div className="text-[10px] font-mono uppercase text-[#869397]">Difference</div>
                      <div className="text-sm font-mono font-bold text-amber-400 mt-0.5">
                        {result.price_variance > 0 ? `+₹${result.price_variance.toFixed(2)} / unit` : '₹0.00 / unit'}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#121620] border border-[#262a33]">
                      <div className="text-[10px] font-mono uppercase text-[#869397]">Billed Quantity</div>
                      <div className="text-sm font-mono font-bold text-white mt-0.5">
                        {result.invoice_quantity} units
                      </div>
                    </div>
                  </div>

                  {/* Exact Formula Box */}
                  <div className="bg-[#121620] rounded-xl p-4 border border-[#262a33] font-mono text-xs space-y-2">
                    <div className="text-[#869397] flex items-center justify-between">
                      <span># Mathematical Exposure Quantification:</span>
                      <span className="text-rose-400 font-bold">Overcharge: ₹{result.potential_overcharge.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>

                    {result.discrepancy_vector === 'QUANTITY_SURPLUS' ? (
                      <div className="text-white font-bold text-sm bg-[#181c24] p-3 rounded-lg border border-[#262a33] overflow-x-auto">
                        Calculation: ({result.invoice_quantity} billed - {result.expected_quantity} PO) × ₹{result.expected_unit_price.toFixed(2)}
                        <div className="text-rose-400 text-base mt-1">
                          = +{result.quantity_variance} units × ₹{result.expected_unit_price.toFixed(2)} = ₹{result.potential_overcharge.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-white font-bold text-sm bg-[#181c24] p-3 rounded-lg border border-[#262a33] overflow-x-auto">
                        Calculation: (₹{result.invoice_unit_price.toFixed(2)} - ₹{result.expected_unit_price.toFixed(2)}) × {result.invoice_quantity} units
                        <div className="text-rose-400 text-base mt-1">
                          = +₹{result.price_variance.toFixed(2)} / unit × {result.invoice_quantity} = ₹{result.potential_overcharge.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bulleted Forensic Summary */}
                  <div className="p-3.5 rounded-xl bg-[#141822] border border-[#262a33] space-y-1.5 text-xs text-[#bcc9cd]">
                    <div className="text-[11px] font-mono uppercase text-[#869397] font-semibold mb-1">
                      Audit Explanation Breakdown:
                    </div>
                    {result.price_variance > 0 && (
                      <>
                        <div className="flex items-start gap-2">
                          <span className="text-rose-400">•</span>
                          <span>Vendor charged <strong className="text-white font-mono">₹{result.invoice_unit_price.toFixed(2)}</strong> per unit instead of agreed <strong className="text-emerald-400 font-mono">₹{result.expected_unit_price.toFixed(2)}</strong>.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-amber-400">•</span>
                          <span>Difference: <strong className="text-amber-300 font-mono">+₹{result.price_variance.toFixed(2)}</strong> per unit (+{((result.price_variance / result.expected_unit_price) * 100).toFixed(1)}% variance).</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-rose-400">•</span>
                          <span>Total overcharge: <strong className="text-rose-400 font-mono font-bold">₹{result.potential_overcharge.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> for {result.invoice_quantity} units.</span>
                        </div>
                      </>
                    )}
                    {result.quantity_variance > 0 && (
                      <>
                        <div className="flex items-start gap-2">
                          <span className="text-rose-400">•</span>
                          <span>Vendor billed <strong className="text-white font-mono">{result.invoice_quantity} units</strong> instead of agreed ceiling of <strong className="text-emerald-400 font-mono">{result.expected_quantity} units</strong>.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-amber-400">•</span>
                          <span>Unauthorized extra units: <strong className="text-rose-400 font-mono">+{result.quantity_variance} units</strong>.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-rose-400">•</span>
                          <span>Unauthorized quantity exposure: <strong className="text-rose-400 font-mono font-bold">₹{result.potential_overcharge.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>.</span>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}

              {/* 5-Point Compliance Checklist */}
              <div className="pt-2 border-t border-[#262a33] space-y-2">
                <h4 className="text-xs font-mono uppercase text-[#869397]">
                  Deterministic Compliance Matrix
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {result.compliance_checks.map((check, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-[#121620] border border-[#262a33]">
                      {check.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-semibold text-white">{check.name}</div>
                        <div className="text-[11px] text-[#869397]">{check.difference}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Auditor Notes & Decision Log */}
            <div className="bg-[#181c24] border border-[#262a33] rounded-xl p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-[#4cd7f6]" />
                  <h3 className="text-xs font-bold font-headline text-white uppercase tracking-wider">
                    Forensic AP Notes
                  </h3>
                </div>

                <div className="space-y-2 mb-3">
                  <textarea
                    rows={3}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add audit note or escalation remark..."
                    className="w-full bg-[#121620] border border-[#262a33] focus:border-[#4cd7f6] rounded-lg p-2.5 text-xs text-white placeholder-[#869397] focus:outline-none"
                  />
                  <button
                    onClick={handleAddNote}
                    className="w-full py-1.5 rounded-lg bg-[#262a33] hover:bg-[#31353e] text-white text-xs font-semibold border border-[#3d494c] transition-colors"
                  >
                    Log Forensic Note to SQLite
                  </button>
                </div>

                {/* Notes List */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {notesList.map((n, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-[#121620] border border-[#262a33] text-xs">
                      <p className="text-[#dfe2ee]">{n}</p>
                      <div className="text-[10px] text-[#869397] mt-1 font-mono">
                        Elena Rostova • Just now
                      </div>
                    </div>
                  ))}
                  <div className="p-2.5 rounded-lg bg-[#121620] border border-[#262a33] text-xs">
                    <p className="text-[#dfe2ee]">
                      System initialized automatic payment freeze on {result.invoice_number}.
                    </p>
                    <div className="text-[10px] text-[#869397] mt-1 font-mono">
                      Autonomous Bot • Ingestion time
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Action: Approve Override */}
              <div className="pt-3 border-t border-[#262a33]">
                <button
                  onClick={handleApproveOverride}
                  className="w-full py-2 rounded-lg bg-transparent hover:bg-[#262a33] text-[#869397] hover:text-white text-xs font-medium border border-[#262a33] transition-colors"
                >
                  Approve Variance with Executive Override
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
