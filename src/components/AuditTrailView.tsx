import React, { useState, useEffect } from 'react';
import { 
  History, 
  ShieldCheck, 
  Filter, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Database,
  Lock,
  FileText
} from 'lucide-react';
import { AuditLog } from '../types';

interface AuditTrailViewProps {
  initialInvoiceNumber?: string;
  onSelectInvoice?: (invoiceNumber: string) => void;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({
  initialInvoiceNumber,
  onSelectInvoice
}) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filterInvoice, setFilterInvoice] = useState<string>(initialInvoiceNumber || '');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchLogs = async (invNumber?: string) => {
    setLoading(true);
    try {
      const url = invNumber ? `/api/audit-logs?invoice_number=${encodeURIComponent(invNumber)}` : '/api/audit-logs';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(filterInvoice);
  }, [filterInvoice]);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#262a33] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-headline font-extrabold text-white tracking-tight">
              Cryptographic Audit Logs & Compliance Proof
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#06b6d4]/15 text-[#4cd7f6] border border-[#06b6d4]/30 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              IMMUTABLE RECORD
            </span>
          </div>
          <p className="text-xs text-[#869397] mt-1">
            Complete sequential log of raw document ingestion, Gemini 3.8 entity extraction, deterministic rules execution, and AP enforcement.
          </p>
        </div>

        {/* Filter by Invoice */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={filterInvoice}
            onChange={(e) => setFilterInvoice(e.target.value)}
            placeholder="Filter by Invoice (e.g. INV-10482)..."
            className="bg-[#181c24] border border-[#262a33] focus:border-[#4cd7f6] rounded-lg px-3.5 py-2 text-xs text-white placeholder-[#869397] focus:outline-none w-64 font-mono"
          />
          {filterInvoice && (
            <button
              onClick={() => setFilterInvoice('')}
              className="px-2.5 py-2 rounded-lg bg-[#262a33] hover:bg-[#31353e] text-xs text-[#869397] hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="bg-[#181c24] border border-[#262a33] rounded-xl p-6 shadow-xl">
        {loading ? (
          <div className="py-12 text-center text-xs text-[#869397] flex items-center justify-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-[#4cd7f6] border-t-transparent animate-spin"></div>
            <span>Loading immutable audit records...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#869397]">
            No audit records found matching query. Run an audit on the Audit Bench to generate new logs.
          </div>
        ) : (
          <div className="relative border-l-2 border-[#262a33] ml-4 space-y-6">
            {logs.map((log) => {
              const isFlagged = log.status === 'FLAGGED' || log.status === 'DISCREPANCY';
              const isAction = log.event.startsWith('ACTION_');
              return (
                <div key={log.id} className="relative pl-6 group">
                  {/* Timeline node icon */}
                  <div className={`absolute -left-[17px] top-1.5 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    isFlagged
                      ? 'bg-[#181c24] border-rose-500 text-rose-400'
                      : isAction
                      ? 'bg-[#181c24] border-amber-500 text-amber-400'
                      : 'bg-[#181c24] border-[#06b6d4] text-[#4cd7f6]'
                  }`}>
                    {isFlagged ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : isAction ? (
                      <ShieldCheck className="w-4 h-4" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="bg-[#121620] border border-[#262a33] hover:border-[#3d494c] rounded-xl p-4 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#262a33]/60 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white tracking-wider">
                          {log.event}
                        </span>
                        <span className="font-mono text-[11px] text-[#4cd7f6] bg-[#06b6d4]/10 px-2 py-0.5 rounded border border-[#06b6d4]/30">
                          {log.invoice_number}
                        </span>
                        {log.po_number && (
                          <span className="font-mono text-[11px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                            {log.po_number}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] font-mono text-[#869397]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{log.created_at}</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#dfe2ee] mt-3 leading-relaxed">
                      {log.description}
                    </p>

                    {log.metadata && (
                      <div className="mt-3 p-2.5 bg-[#0f131c] rounded-lg border border-[#262a33] font-mono text-[11px] text-[#869397] overflow-x-auto">
                        <span className="text-slate-500">PAYLOAD METADATA: </span>
                        <span className="text-emerald-300">{log.metadata}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
