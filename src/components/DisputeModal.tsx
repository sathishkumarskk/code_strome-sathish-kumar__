import React, { useState } from 'react';
import { 
  X, 
  Send, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  Mail, 
  Building2, 
  Copy,
  Check
} from 'lucide-react';

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceNumber: string;
  poNumber: string;
  vendor: string;
  overchargeAmount: number;
  explanation: string;
  onDisputeSent?: () => void;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({
  isOpen,
  onClose,
  invoiceNumber,
  poNumber,
  vendor,
  overchargeAmount,
  explanation,
  onDisputeSent
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [sentSuccess, setSentSuccess] = useState<boolean>(false);

  const vendorEmail = `ap.invoicing@${vendor.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
  const subject = `FORMAL AP NOTICE: Discrepancy & Payment Hold on ${invoiceNumber} (PO Ref: ${poNumber})`;

  const emailBody = `ATTENTION: Accounts Receivable / Billing Department
Supplier: ${vendor}
Reference Invoice: ${invoiceNumber}
Purchase Order Reference: ${poNumber}

Dear Vendor Partner,

Our automated Enterprise Accounts Payable Auditor (Vendora AI) has identified a formal financial discrepancy on invoice ${invoiceNumber} when reconciled against verified ERP Purchase Order ${poNumber}.

DISCREPANCY SUMMARY:
- ${explanation}
- Quantified Financial Overcharge: ₹${overchargeAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}

In accordance with Master Services Procurement Agreement §4.2 (Fixed Rate Price Ceiling and Authorized Quantity Schedule), our finance operations department has engaged an automated disbursement hold on the unauthorized variance amount.

PROPOSED SETTLEMENT ACTION:
1. Revised Invoice: Please issue a revised invoice reflecting the agreed contractual rate, OR
2. Credit Note: Issue a credit note for ₹${overchargeAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}, OR
3. Remittance Authorization: We can authorize immediate settlement for the clean baseline amount under short-pay protocol.

Please confirm within 5 business days to avoid disbursement delays.

Sincerely,
Elena Rostova
Lead Forensic AP Specialist
Vendora AI Automated Finance Operations
Enterprise Tech Operations Ltd`;

  const handleSend = async () => {
    setSending(true);
    try {
      await fetch(`/api/invoices/${invoiceNumber}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DISPUTE',
          note: `Formal automated dispute notice transmitted to ${vendorEmail}. Claim amount: ₹${overchargeAmount.toFixed(2)}.`
        })
      });
      setSending(false);
      setSentSuccess(true);
      if (onDisputeSent) onDisputeSent();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setSending(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${emailBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#181c24] border border-[#262a33] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#262a33] flex items-center justify-between bg-[#151922]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-white">
                Transmit Vendor Dispute Notice
              </h3>
              <p className="text-xs text-[#869397]">
                Automated legal claim notice citing ERP PO contractual bounds.
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

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {sentSuccess ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-white">Dispute Transmitted Successfully</h4>
              <p className="text-xs text-[#bcc9cd] max-w-md mx-auto">
                Dispute record sealed in SQLite database. AP hold status updated to <strong className="text-rose-400 font-mono">DISPUTED</strong>.
              </p>
            </div>
          ) : (
            <>
              {/* Recipient & Subject Header */}
              <div className="bg-[#121620] p-3 rounded-lg border border-[#262a33] space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-[#869397]">
                  <span>To:</span>
                  <span className="text-white">{vendorEmail}</span>
                </div>
                <div className="flex justify-between text-[#869397]">
                  <span>Subject:</span>
                  <span className="text-[#4cd7f6] truncate max-w-md">{subject}</span>
                </div>
                <div className="flex justify-between text-[#869397] pt-1 border-t border-[#262a33]">
                  <span>Disputed Amount:</span>
                  <span className="text-rose-400 font-bold">₹{overchargeAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Message Preview */}
              <div>
                <label className="block text-xs font-mono uppercase text-[#869397] mb-1.5">
                  Generated Dispute Letter Draft
                </label>
                <textarea
                  readOnly
                  rows={10}
                  value={emailBody}
                  className="w-full bg-[#121620] border border-[#262a33] rounded-lg p-3 text-xs font-mono text-[#dfe2ee] leading-relaxed focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-[#262a33]">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#262a33] hover:bg-[#31353e] text-xs font-semibold text-[#bcc9cd] hover:text-white transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy Notice Text'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg bg-transparent hover:bg-[#262a33] text-xs font-medium text-[#869397] hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={sending}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-lg shadow-rose-500/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sending ? 'Transmitting...' : 'Transmit Dispute & Place Hold'}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
