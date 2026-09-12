import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { InvoiceAuditBench } from './components/InvoiceAuditBench';
import { InvoicesLedger } from './components/InvoicesLedger';
import { PurchaseOrdersList } from './components/PurchaseOrdersList';
import { DiscrepanciesForensicsView } from './components/DiscrepanciesForensicsView';
import { AuditTrailView } from './components/AuditTrailView';
import { FinancialAnalytics } from './components/FinancialAnalytics';
import { DisputeModal } from './components/DisputeModal';
import { SearchModal } from './components/SearchModal';
import { AnalyzeInvoiceModal } from './components/AnalyzeInvoiceModal';
import { CreatePoModal } from './components/CreatePoModal';
import { InvoiceRecord, PurchaseOrder, DashboardMetrics, AuditComparisonResult } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalInvoices: 6,
    flaggedCount: 3,
    clearCount: 3,
    totalOvercharge: 30950,
    totalSpendAudited: 1228450,
    accuracyRate: '99.8',
    activeVendors: 6,
    avgAuditLatencyMs: 142
  });

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedBenchPo, setSelectedBenchPo] = useState<string>('PO-9921');
  const [selectedBenchText, setSelectedBenchText] = useState<string>('');
  const [benchInitialResult, setBenchInitialResult] = useState<AuditComparisonResult | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // New Modals state
  const [isAnalyzeModalOpen, setIsAnalyzeModalOpen] = useState<boolean>(false);
  const [createPoState, setCreatePoState] = useState<{ isOpen: boolean; initialPoNumber?: string }>({
    isOpen: false,
    initialPoNumber: ''
  });

  // Dispute modal state
  const [disputeData, setDisputeData] = useState<{
    isOpen: boolean;
    invoiceNumber: string;
    poNumber: string;
    vendor: string;
    overcharge: number;
    explanation: string;
  }>({
    isOpen: false,
    invoiceNumber: '',
    poNumber: '',
    vendor: '',
    overcharge: 0,
    explanation: ''
  });

  // Fetch initial data
  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [invRes, poRes, metricsRes] = await Promise.all([
        fetch('/api/invoices'),
        fetch('/api/purchase-orders'),
        fetch('/api/dashboard/stats')
      ]);

      const invData = await invRes.json();
      const poData = await poRes.json();
      const metricsData = await metricsRes.json();

      if (invData.success) setInvoices(invData.invoices);
      if (poData.success) setPurchaseOrders(poData.purchase_orders);
      if (metricsData.success) setMetrics(metricsData.metrics);
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ⌘K hotkey listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Launch the required Hackathon Demo Case (PO-9921 vs INV-10482)
  const handleLaunchDemoCase = () => {
    setSelectedBenchPo('PO-9921');
    setBenchInitialResult(null);
    setSelectedBenchText(`TAX INVOICE
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
Remittance Account: Global Supplies Commercial Current A/C #88219401`);
    setCurrentTab('bench');
  };

  // Inspect an existing invoice in the Audit Bench
  const handleSelectInvoiceToAudit = (invNumber: string) => {
    const inv = (invoices || []).find(
      i => i?.invoice_number && invNumber && i.invoice_number.toUpperCase() === invNumber.toUpperCase()
    );
    setBenchInitialResult(null);
    if (inv) {
      setSelectedBenchPo(inv.po_number);
      setSelectedBenchText(inv.raw_payload || `INVOICE: ${inv.invoice_number}
Vendor: ${inv.vendor}
PO Reference: ${inv.po_number}
Item: ${inv.product}
Quantity: ${inv.quantity}
Unit Rate: ₹${inv.unit_price}
Total: ₹${inv.invoice_total}`);
    } else {
      setSelectedBenchPo('PO-9921');
    }
    setCurrentTab('bench');
  };

  const handleSelectPoToAudit = (poNumber: string) => {
    setSelectedBenchPo(poNumber);
    setBenchInitialResult(null);
    setCurrentTab('bench');
  };

  const handleOpenDispute = (
    invNumber: string,
    poNumber: string,
    vendor: string,
    overcharge: number,
    explanation: string
  ) => {
    setDisputeData({
      isOpen: true,
      invoiceNumber: invNumber,
      poNumber: poNumber,
      vendor: vendor,
      overcharge: overcharge,
      explanation: explanation
    });
  };

  const handleOpenCreatePoModal = (initialPo?: string) => {
    setCreatePoState({
      isOpen: true,
      initialPoNumber: initialPo || ''
    });
  };

  const handleAuditCompletedFromModal = (comparison: AuditComparisonResult) => {
    setSelectedBenchPo(comparison.po_number);
    setBenchInitialResult(comparison);
    fetchData();
    setCurrentTab('bench');
  };

  return (
    <div className="flex h-screen bg-[#0f131c] text-[#dfe2ee] font-sans antialiased overflow-hidden selection:bg-[#06b6d4]/30 selection:text-[#4cd7f6]">
      {/* Left Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        flaggedCount={metrics.flaggedCount}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <TopHeader
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenBench={() => setCurrentTab('bench')}
          onOpenAnalyzeModal={() => setIsAnalyzeModalOpen(true)}
          onLoadDemoScenario={handleLaunchDemoCase}
          flaggedCount={metrics.flaggedCount}
          isRefreshing={isRefreshing}
          onRefreshData={fetchData}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto bg-[#0f131c]">
          {currentTab === 'dashboard' && (
            <ExecutiveDashboard
              metrics={metrics}
              invoices={invoices}
              onSelectInvoice={handleSelectInvoiceToAudit}
              onOpenBenchWithDemo={handleLaunchDemoCase}
              onNavigateToTab={setCurrentTab}
            />
          )}

          {currentTab === 'bench' && (
            <InvoiceAuditBench
              initialPo={selectedBenchPo}
              initialInvoiceText={selectedBenchText}
              initialResult={benchInitialResult}
              onOpenDispute={handleOpenDispute}
              onRefreshData={fetchData}
              onOpenAnalyzeModal={() => setIsAnalyzeModalOpen(true)}
              onOpenCreatePo={handleOpenCreatePoModal}
            />
          )}

          {currentTab === 'invoices' && (
            <InvoicesLedger
              invoices={invoices}
              onSelectInvoice={handleSelectInvoiceToAudit}
              onOpenBench={() => setIsAnalyzeModalOpen(true)}
            />
          )}

          {currentTab === 'pos' && (
            <PurchaseOrdersList
              purchaseOrders={purchaseOrders}
              onAuditPo={handleSelectPoToAudit}
              onOpenCreatePo={() => handleOpenCreatePoModal()}
            />
          )}

          {currentTab === 'discrepancies' && (
            <DiscrepanciesForensicsView
              invoices={invoices}
              onSelectInvoice={handleSelectInvoiceToAudit}
              onOpenDispute={handleOpenDispute}
              onOpenBenchWithDemo={handleLaunchDemoCase}
            />
          )}

          {currentTab === 'audit-trail' && (
            <AuditTrailView
              onSelectInvoice={handleSelectInvoiceToAudit}
            />
          )}

          {currentTab === 'analytics' && (
            <FinancialAnalytics
              metrics={metrics}
              invoices={invoices}
            />
          )}
        </main>
      </div>

      {/* Global Analyze New Invoice Modal */}
      <AnalyzeInvoiceModal
        isOpen={isAnalyzeModalOpen}
        onClose={() => setIsAnalyzeModalOpen(false)}
        purchaseOrders={purchaseOrders}
        onAuditSuccess={handleAuditCompletedFromModal}
        onRequestCreatePo={(poNum) => {
          setIsAnalyzeModalOpen(false);
          handleOpenCreatePoModal(poNum);
        }}
      />

      {/* Global ERP PO Creation Modal */}
      <CreatePoModal
        isOpen={createPoState.isOpen}
        onClose={() => setCreatePoState({ isOpen: false, initialPoNumber: '' })}
        initialPoNumber={createPoState.initialPoNumber}
        onPoCreated={() => {
          fetchData();
        }}
      />

      {/* Global Vendor Dispute Notice Modal */}
      <DisputeModal
        isOpen={disputeData.isOpen}
        onClose={() => setDisputeData({ ...disputeData, isOpen: false })}
        invoiceNumber={disputeData.invoiceNumber}
        poNumber={disputeData.poNumber}
        vendor={disputeData.vendor}
        overchargeAmount={disputeData.overcharge}
        explanation={disputeData.explanation}
        onDisputeSent={fetchData}
      />

      {/* ⌘K Command Palette Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        invoices={invoices}
        purchaseOrders={purchaseOrders}
        onSelectInvoice={handleSelectInvoiceToAudit}
        onSelectPo={handleSelectPoToAudit}
        onSelectTab={setCurrentTab}
      />
    </div>
  );
}
