import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  getAllPurchaseOrders,
  getPurchaseOrderByNumber,
  insertPurchaseOrder,
  getAllInvoices,
  getInvoiceByNumber,
  insertInvoiceRecord,
  updateInvoiceAction,
  getAuditLogsForInvoice,
  insertAuditLogRecord,
  getAuditNotesForInvoice,
  insertAuditNoteRecord,
  getDashboardMetrics
} from './server/db-helpers.js';
import { extractInvoiceData } from './server/gemini.js';
import { evaluateInvoiceAgainstPo } from './server/validator.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Vendora AI Enterprise Vendor Invoice Auditor',
      model: 'gemini-3.8-flash',
      database: 'SQLite (sql.js WASM)',
      timestamp: new Date().toISOString()
    });
  });

  // Get all Purchase Orders
  app.get('/api/purchase-orders', async (req, res) => {
    try {
      const pos = await getAllPurchaseOrders();
      res.json({ success: true, count: pos.length, purchase_orders: pos });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get single Purchase Order
  app.get('/api/purchase-orders/:po_number', async (req, res) => {
    try {
      const po = await getPurchaseOrderByNumber(req.params.po_number);
      if (!po) {
        return res.status(404).json({ success: false, error: `Purchase order ${req.params.po_number} not found` });
      }
      res.json({ success: true, purchase_order: po });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Create new Purchase Order
  app.post('/api/purchase-orders', async (req, res) => {
    try {
      const {
        po_number,
        po_date,
        buyer,
        vendor,
        supplier,
        supplier_gstin,
        product,
        item_description,
        quantity,
        expected_quantity,
        agreed_unit_price,
        expected_total,
        payment_terms,
        status
      } = req.body;

      const finalVendor = (vendor || supplier || '').trim();
      const finalProduct = (product || item_description || '').trim();
      const finalQty = quantity !== undefined ? Number(quantity) : (expected_quantity !== undefined ? Number(expected_quantity) : undefined);
      const finalUnitPrice = agreed_unit_price !== undefined ? Number(agreed_unit_price) : undefined;

      if (!po_number || !finalVendor || !finalProduct || finalQty === undefined || finalUnitPrice === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Missing required PO fields: PO Number, Supplier, Item Description, Quantity, and Agreed Unit Price.'
        });
      }

      if (isNaN(finalQty) || finalQty <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Expected Quantity must be a valid positive number.'
        });
      }

      if (isNaN(finalUnitPrice) || finalUnitPrice <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Agreed Unit Price must be a valid positive number.'
        });
      }

      const existing = await getPurchaseOrderByNumber(po_number);
      if (existing) {
        return res.status(409).json({
          success: false,
          error: `Purchase order ${po_number.trim().toUpperCase()} already exists in ERP registry.`
        });
      }

      const calculatedTotal = expected_total ? Number(expected_total) : Number((finalQty * finalUnitPrice).toFixed(2));

      const newPo = await insertPurchaseOrder({
        po_number: po_number.trim().toUpperCase(),
        po_date: po_date || new Date().toISOString().split('T')[0],
        buyer: buyer || 'Enterprise Tech Operations Ltd',
        vendor: finalVendor,
        supplier: finalVendor,
        supplier_gstin: supplier_gstin || '',
        product: finalProduct,
        item_description: finalProduct,
        quantity: finalQty,
        expected_quantity: finalQty,
        agreed_unit_price: finalUnitPrice,
        expected_total: calculatedTotal,
        payment_terms: payment_terms || 'Net 30 Days',
        status: status || 'APPROVED',
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });

      res.status(201).json({ success: true, purchase_order: newPo });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get all Invoices
  app.get('/api/invoices', async (req, res) => {
    try {
      const status = req.query.status as string;
      const search = req.query.search as string;
      const invoices = await getAllInvoices({ status, search });
      res.json({ success: true, count: invoices.length, invoices });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get single invoice
  app.get('/api/invoices/:invoice_number', async (req, res) => {
    try {
      const inv = await getInvoiceByNumber(req.params.invoice_number);
      if (!inv) {
        return res.status(404).json({ success: false, error: `Invoice ${req.params.invoice_number} not found` });
      }
      const po = await getPurchaseOrderByNumber(inv.po_number);
      const auditLogs = await getAuditLogsForInvoice(inv.invoice_number);
      const notes = await getAuditNotesForInvoice(inv.invoice_number);

      res.json({ success: true, invoice: inv, purchase_order: po, audit_logs: auditLogs, notes });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Execute Auditor Action (Dispute, Short Pay, Approve Override)
  app.post('/api/invoices/:invoice_number/actions', async (req, res) => {
    try {
      const { action, note } = req.body;
      const updated = await updateInvoiceAction(req.params.invoice_number, action, note);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Invoice not found' });
      }
      res.json({ success: true, invoice: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get/Add Notes
  app.get('/api/invoices/:invoice_number/notes', async (req, res) => {
    try {
      const notes = await getAuditNotesForInvoice(req.params.invoice_number);
      res.json({ success: true, notes });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/invoices/:invoice_number/notes', async (req, res) => {
    try {
      const { author, role, content } = req.body;
      await insertAuditNoteRecord({
        invoice_number: req.params.invoice_number,
        author: author || 'Senior AP Forensic Auditor',
        role: role || 'Accounts Payable Team Lead',
        content: content || '',
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });
      const notes = await getAuditNotesForInvoice(req.params.invoice_number);
      res.json({ success: true, notes });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get Audit logs
  app.get('/api/audit-logs', async (req, res) => {
    try {
      const invoice_number = req.query.invoice_number as string;
      const logs = await getAuditLogsForInvoice(invoice_number);
      res.json({ success: true, count: logs.length, logs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Dashboard Stats
  app.get('/api/dashboard/stats', async (req, res) => {
    try {
      const metrics = await getDashboardMetrics();
      res.json({ success: true, metrics });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vendors summary endpoint
  app.get('/api/vendors', async (req, res) => {
    try {
      const invoices = await getAllInvoices();
      const pos = await getAllPurchaseOrders();
      const vendorMap: Record<string, any> = {};

      pos.forEach(p => {
        const v = p.vendor.trim();
        if (!vendorMap[v]) {
          vendorMap[v] = {
            vendor: v,
            pos_count: 0,
            invoices_count: 0,
            flagged_count: 0,
            total_spend: 0,
            total_overcharge: 0,
            status: 'ACTIVE'
          };
        }
        vendorMap[v].pos_count += 1;
      });

      invoices.forEach(i => {
        const v = i.vendor.trim();
        if (!vendorMap[v]) {
          vendorMap[v] = {
            vendor: v,
            pos_count: 0,
            invoices_count: 0,
            flagged_count: 0,
            total_spend: 0,
            total_overcharge: 0,
            status: 'ACTIVE'
          };
        }
        vendorMap[v].invoices_count += 1;
        vendorMap[v].total_spend += i.invoice_total;
        vendorMap[v].total_overcharge += (i.potential_overcharge || 0);
        if (i.status === 'DISCREPANCY') {
          vendorMap[v].flagged_count += 1;
        }
      });

      res.json({ success: true, vendors: Object.values(vendorMap) });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Extract Invoice Data without validating (for interactive form autofill)
  app.post('/api/extract-invoice', async (req, res) => {
    try {
      const { invoice_text, po_number } = req.body;
      if (!invoice_text || !invoice_text.trim()) {
        return res.status(400).json({ success: false, error: 'Raw invoice document text is required.' });
      }
      const extracted = await extractInvoiceData(invoice_text, po_number);
      res.json({ success: true, extracted });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // CORE ENDPOINT: Analyze Invoice & Compare with PO
  // Implements strict separation:
  // 1. AI extracts raw parameters only
  // 2. Application code retrieves PO from SQLite (NO silent substitution)
  // 3. Application code executes deterministic comparisons and math
  // 4. Stores records in SQLite
  // 5. Returns comprehensive comparison
  app.post('/api/analyze-invoice', async (req, res) => {
    try {
      const {
        po_number,
        invoice_text,
        invoice_number,
        vendor,
        product,
        quantity,
        unit_price,
        total,
        date
      } = req.body;

      if ((!invoice_text || !invoice_text.trim()) && (!invoice_number && !vendor)) {
        return res.status(400).json({ success: false, error: 'Invoice text or structured parameters are required.' });
      }

      // Step 1: Extract or parse invoice entities
      let extracted: any;
      if (invoice_text && invoice_text.trim()) {
        extracted = await extractInvoiceData(invoice_text, po_number);
      } else {
        extracted = {
          vendor: vendor || 'Unknown Vendor',
          invoice_number: invoice_number || `INV-${Date.now().toString().slice(-6)}`,
          po_number: po_number || '',
          product: product || 'Authorized Supplies',
          quantity: Number(quantity) || 1,
          unit_price: Number(unit_price) || 0,
          total: total ? Number(total) : (Number(quantity) || 1) * (Number(unit_price) || 0),
          date: date || new Date().toISOString().split('T')[0],
          confidence: 1.0,
          method: 'DIRECT_INPUT'
        };
      }

      // Apply any direct field overrides from the form
      if (invoice_number && invoice_number.trim()) extracted.invoice_number = invoice_number.trim().toUpperCase();
      if (po_number && po_number.trim()) extracted.po_number = po_number.trim().toUpperCase();
      if (vendor && vendor.trim()) extracted.vendor = vendor.trim();
      if (product && product.trim()) extracted.product = product.trim();
      if (quantity !== undefined && quantity !== '') extracted.quantity = Number(quantity);
      if (unit_price !== undefined && unit_price !== '') extracted.unit_price = Number(unit_price);
      if (total !== undefined && total !== '') extracted.total = Number(total);
      if (date && date.trim()) extracted.date = date.trim();

      const targetPoNumber = (extracted.po_number || po_number || '').trim().toUpperCase();

      if (!targetPoNumber) {
        return res.status(400).json({
          success: false,
          error: 'No Purchase Order reference specified or detected. Please provide a PO reference (e.g. PO-9921).',
          extracted
        });
      }

      // Step 2: Retrieve Verified PO from SQLite ERP store (STRICT: NO SILENT FALLBACK)
      const po = await getPurchaseOrderByNumber(targetPoNumber);
      if (!po) {
        // Record audit attempt for traceability
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
        await insertAuditLogRecord({
          invoice_number: extracted.invoice_number,
          po_number: targetPoNumber,
          event: 'PO_LOOKUP_FAILED',
          description: `Audit halted: Purchase Order ${targetPoNumber} was not found in the ERP database.`,
          status: 'NOT_FOUND',
          metadata: JSON.stringify({ po_number: targetPoNumber, extracted }),
          created_at: now
        });

        return res.status(404).json({
          success: false,
          missing_po: true,
          po_number: targetPoNumber,
          error: `Purchase Order ${targetPoNumber} was not found.`,
          extracted
        });
      }

      // Step 3: Deterministic Financial Comparison Engine
      const comparison = evaluateInvoiceAgainstPo(extracted, po);

      // Step 4: Insert / Update Invoice in SQLite
      const existingInvoice = await getInvoiceByNumber(comparison.invoice_number);
      let savedRecord;

      if (!existingInvoice) {
        savedRecord = await insertInvoiceRecord({
          invoice_number: comparison.invoice_number,
          po_number: po.po_number,
          vendor: extracted.vendor,
          product: comparison.product,
          quantity: comparison.invoice_quantity,
          unit_price: comparison.invoice_unit_price,
          invoice_total: comparison.invoice_total,
          status: comparison.status,
          variance: comparison.total_variance,
          potential_overcharge: comparison.potential_overcharge,
          discrepancy_vector: comparison.discrepancy_vector,
          explanation: comparison.explanation,
          confidence: comparison.confidence,
          raw_payload: invoice_text ? invoice_text.substring(0, 1500) : `Direct Form Entry: ${comparison.invoice_number}`,
          action_status: 'OPEN',
          created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
        });
      } else {
        savedRecord = existingInvoice;
      }

      // Step 5: Generate Immutable Audit Logs
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      await insertAuditLogRecord({
        invoice_number: comparison.invoice_number,
        po_number: po.po_number,
        event: 'AI_INGESTION_EXTRACTION',
        description: `Ingested invoice ${comparison.invoice_number}. AI Entity Extraction completed via Gemini 3.8 Flash (${extracted.method}). Extracted item: ${extracted.product}, Qty: ${extracted.quantity}, Rate: ₹${extracted.unit_price}.`,
        status: 'SUCCESS',
        metadata: JSON.stringify({ method: extracted.method, confidence: extracted.confidence }),
        created_at: now
      });

      await insertAuditLogRecord({
        invoice_number: comparison.invoice_number,
        po_number: po.po_number,
        event: 'DETERMINISTIC_AUDIT_MATCH',
        description: comparison.status === 'CLEAR' 
          ? `3-Way Match Verified against ERP PO record ${po.po_number}. Quantity and Price zero tolerance confirmed.`
          : `Discrepancy identified: ${comparison.explanation}`,
        status: comparison.status,
        metadata: JSON.stringify({
          expected: { qty: po.quantity, unit_price: po.agreed_unit_price, total: po.expected_total },
          actual: { qty: comparison.invoice_quantity, unit_price: comparison.invoice_unit_price, total: comparison.invoice_total },
          potential_overcharge: comparison.potential_overcharge
        }),
        created_at: now
      });

      res.json({
        success: true,
        extracted,
        purchase_order: po,
        comparison,
        saved_invoice: savedRecord
      });
    } catch (err: any) {
      console.error('Invoice analysis failure:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Vendora AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
