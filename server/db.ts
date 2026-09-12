import fs from 'fs';
import path from 'path';
import initSqlJs, { Database } from 'sql.js';

let dbInstance: Database | null = null;
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'vendora.sqlite');

export interface PurchaseOrder {
  id?: number;
  po_number: string;
  po_date?: string;
  buyer?: string;
  vendor: string;
  supplier?: string;
  supplier_gstin?: string;
  product: string;
  item_description?: string;
  quantity: number;
  expected_quantity?: number;
  agreed_unit_price: number;
  expected_total: number;
  payment_terms?: string;
  status: 'APPROVED' | 'PENDING' | 'CLOSED';
  created_at: string;
  updated_at?: string;
}

export interface InvoiceRecord {
  id?: number;
  invoice_number: string;
  po_number: string;
  vendor: string;
  product: string;
  quantity: number;
  unit_price: number;
  invoice_total: number;
  status: 'CLEAR' | 'DISCREPANCY' | 'NEEDS REVIEW';
  variance: number;
  potential_overcharge: number;
  discrepancy_vector: string;
  explanation: string;
  confidence: number;
  raw_payload?: string;
  action_status?: 'OPEN' | 'DISPUTED' | 'SHORT_PAID' | 'RESOLVED' | 'APPROVED_OVERRIDE';
  created_at: string;
}

export interface AuditLog {
  id?: number;
  invoice_number: string;
  po_number: string;
  event: string;
  description: string;
  status: string;
  metadata?: string;
  created_at: string;
}

export interface AuditNote {
  id?: number;
  invoice_number: string;
  author: string;
  role: string;
  content: string;
  created_at: string;
}

export async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs();
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      dbInstance = new SQL.Database(fileBuffer);
      migrateSchema(dbInstance);
      return dbInstance;
    } catch (e) {
      console.warn('Failed to load existing SQLite database, creating a new one', e);
    }
  }

  dbInstance = new SQL.Database();
  initializeSchema(dbInstance);
  seedInitialData(dbInstance);
  saveDb(dbInstance);
  return dbInstance;
}

function migrateSchema(db: Database) {
  const safeAddColumn = (table: string, colDef: string) => {
    try {
      db.run(`ALTER TABLE ${table} ADD COLUMN ${colDef};`);
    } catch (e) {
      // Column may already exist, ignore
    }
  };

  safeAddColumn('purchase_orders', 'po_date TEXT DEFAULT ""');
  safeAddColumn('purchase_orders', 'buyer TEXT DEFAULT "Enterprise Tech Operations Ltd"');
  safeAddColumn('purchase_orders', 'supplier_gstin TEXT DEFAULT ""');
  safeAddColumn('purchase_orders', 'payment_terms TEXT DEFAULT "Net 30 Days"');
  safeAddColumn('purchase_orders', 'updated_at TEXT DEFAULT ""');
}

export function saveDb(db?: Database) {
  const currentDb = db || dbInstance;
  if (!currentDb) return;
  try {
    const data = currentDb.export();
    const buffer = Buffer.from(data);
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('Error saving SQLite database to disk:', err);
  }
}

function initializeSchema(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      po_number TEXT UNIQUE NOT NULL,
      po_date TEXT DEFAULT '',
      buyer TEXT DEFAULT 'Enterprise Tech Operations Ltd',
      vendor TEXT NOT NULL,
      supplier_gstin TEXT DEFAULT '',
      product TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      agreed_unit_price REAL NOT NULL,
      expected_total REAL NOT NULL,
      payment_terms TEXT DEFAULT 'Net 30 Days',
      status TEXT NOT NULL DEFAULT 'APPROVED',
      created_at TEXT NOT NULL,
      updated_at TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT NOT NULL,
      po_number TEXT NOT NULL,
      vendor TEXT NOT NULL,
      product TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      invoice_total REAL NOT NULL,
      status TEXT NOT NULL,
      variance REAL NOT NULL DEFAULT 0,
      potential_overcharge REAL NOT NULL DEFAULT 0,
      discrepancy_vector TEXT,
      explanation TEXT,
      confidence REAL DEFAULT 0.98,
      raw_payload TEXT,
      action_status TEXT DEFAULT 'OPEN',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT NOT NULL,
      po_number TEXT NOT NULL,
      event TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL,
      metadata TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT NOT NULL,
      author TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}

function seedInitialData(db: Database) {
  // 1. Mandatory Demo PO-9921
  db.run(`
    INSERT INTO purchase_orders (po_number, vendor, product, quantity, agreed_unit_price, expected_total, status, created_at)
    VALUES 
      ('PO-9921', 'Global Supplies Pvt Ltd', 'Wireless Mouse', 50, 450.00, 22500.00, 'APPROVED', '2026-03-01 10:30:00'),
      ('PO-9884', 'NexaTech Solutions', 'Cloud Routers & Managed Switches', 100, 1200.00, 120000.00, 'APPROVED', '2026-02-28 14:15:00'),
      ('PO-9750', 'Apex Industrial Corp', 'Precision Drill Chucks (Series B)', 20, 15000.00, 300000.00, 'APPROVED', '2026-02-25 09:00:00'),
      ('PO-9642', 'Delta Logistics Services', 'Intermodal Freight Dispatch Logistics', 1, 85000.00, 85000.00, 'APPROVED', '2026-02-24 11:20:00'),
      ('PO-9610', 'Horizon Cloud Infra', 'Compute Instance Cluster - 64 Core', 12, 40000.00, 480000.00, 'APPROVED', '2026-02-20 16:45:00'),
      ('PO-9480', 'Matrix Office Supplies', 'Ergonomic Executive Mesh Task Chairs', 30, 6500.00, 195000.00, 'APPROVED', '2026-02-18 13:10:00');
  `);

  // 2. Demo Invoices matching the Stitch Executive Dashboard
  db.run(`
    INSERT INTO invoices (invoice_number, po_number, vendor, product, quantity, unit_price, invoice_total, status, variance, potential_overcharge, discrepancy_vector, explanation, confidence, raw_payload, action_status, created_at)
    VALUES
      ('INV-10482', 'PO-9921', 'Global Supplies Pvt Ltd', 'Wireless Mouse', 50, 499.00, 24950.00, 'DISCREPANCY', 2450.00, 2450.00, 'PRICE_DISCREPANCY', 'The invoice quantity (50) matches the Purchase Order, but the vendor billed ₹499.00/unit instead of the agreed ₹450.00/unit, generating an unauthorized surplus of ₹2,450.00.', 0.99, 'INVOICE: INV-10482 | Vendor: Global Supplies Pvt Ltd | PO: PO-9921 | Item: Wireless Mouse | Qty: 50 | Unit Price: 499.00 | Total: 24950.00', 'OPEN', '2026-03-02 09:14:22'),
      ('INV-10479', 'PO-9884', 'NexaTech Solutions', 'Cloud Routers & Managed Switches', 120, 1200.00, 144000.00, 'DISCREPANCY', 24000.00, 24000.00, 'QUANTITY_SURPLUS', 'Supplier delivered 120 units against PO-9884 authorized cap of 100 units. Line overage quantity of 20 units creates unapproved financial exposure of ₹24,000.00.', 0.97, 'INVOICE: INV-10479 | Vendor: NexaTech Solutions | PO: PO-9884 | Qty: 120 | Unit Price: 1200.00 | Total: 144000.00', 'OPEN', '2026-03-01 17:42:10'),
      ('INV-10470', 'PO-9750', 'Apex Industrial Corp', 'Precision Drill Chucks (Series B)', 20, 15000.00, 304500.00, 'DISCREPANCY', 4500.00, 4500.00, 'SURCHARGE_UNMATCHED', 'Uncontracted ancillary surcharge for expedited freight billed at ₹4,500.00 contrary to agreed incoterm DDP on PO-9750.', 0.96, 'INVOICE: INV-10470 | Vendor: Apex Industrial Corp | PO: PO-9750 | Qty: 20 | Subtotal: 300000.00 | Expedited Freight: 4500.00 | Total: 304500.00', 'OPEN', '2026-03-01 11:20:05'),
      ('INV-10465', 'PO-9642', 'Delta Logistics Services', 'Intermodal Freight Dispatch Logistics', 1, 85000.00, 85000.00, 'CLEAR', 0.00, 0.00, 'NONE', 'Deterministic 3-Way Match fully validated. Exact unit price, line quantity, and billing entity verified against PO-9642.', 0.99, 'INVOICE: INV-10465 | Vendor: Delta Logistics Services | PO: PO-9642 | Qty: 1 | Rate: 85000.00 | Total: 85000.00', 'RESOLVED', '2026-02-28 16:30:19'),
      ('INV-10461', 'PO-9610', 'Horizon Cloud Infra', 'Compute Instance Cluster - 64 Core', 12, 40000.00, 480000.00, 'CLEAR', 0.00, 0.00, 'NONE', 'Enterprise monthly cloud contract tier verified. SLA credit applied correctly according to master services agreement.', 0.98, 'INVOICE: INV-10461 | Vendor: Horizon Cloud Infra | PO: PO-9610 | Qty: 12 | Price: 40000.00 | Total: 480000.00', 'RESOLVED', '2026-02-28 10:05:40'),
      ('INV-10455', 'PO-9480', 'Matrix Office Supplies', 'Ergonomic Executive Mesh Task Chairs', 30, 6500.00, 195000.00, 'CLEAR', 0.00, 0.00, 'NONE', 'Complete quantity and line price match against PO-9480. Settlement approved for automated batch disbursement.', 0.99, 'INVOICE: INV-10455 | Vendor: Matrix Office Supplies | PO: PO-9480 | Qty: 30 | Price: 6500.00 | Total: 195000.00', 'RESOLVED', '2026-02-27 15:12:00');
  `);

  // 3. Seed Audit Trail for INV-10482
  db.run(`
    INSERT INTO audit_logs (invoice_number, po_number, event, description, status, metadata, created_at)
    VALUES
      ('INV-10482', 'PO-9921', 'INGESTION', 'Vendor invoice INV-10482 received via direct supplier portal. Checksum verified: sha256:d89e7a2b', 'SUCCESS', '{"source": "Supplier Portal", "channel": "HTTPS_POST"}', '2026-03-02 09:14:22'),
      ('INV-10482', 'PO-9921', 'EXTRACTION', 'AI Entity Extraction completed via Gemini 3.8 Flash with 99.2% extraction confidence.', 'SUCCESS', '{"model": "gemini-3.8-flash", "fields_extracted": 6, "confidence": 0.992}', '2026-03-02 09:14:23'),
      ('INV-10482', 'PO-9921', 'PO_LOOKUP', 'Retrieved verified ERP record PO-9921 (Global Supplies Pvt Ltd). Purchase Order active & valid.', 'SUCCESS', '{"po_number": "PO-9921", "authorized_spend": 22500.00}', '2026-03-02 09:14:23'),
      ('INV-10482', 'PO-9921', 'VALIDATION', 'Deterministic Validation Engine executed 6 compliance checks. Quantity: MATCH (50 units). Unit Price: BREACH (₹499 vs ₹450).', 'FLAGGED', '{"rule_id": "RULE_PRICE_TOLERANCE", "allowed_variance": 0.00, "actual_variance": 49.00}', '2026-03-02 09:14:24'),
      ('INV-10482', 'PO-9921', 'FINANCIAL_IMPACT', 'Financial liability quantified at ₹2,450.00 overcharge. Exposure category: High Severity (unit rate escalation).', 'CALCULATED', '{"potential_overcharge": 2450.00, "percent_variance": 10.89}', '2026-03-02 09:14:24'),
      ('INV-10482', 'PO-9921', 'DISBURSEMENT_HOLD', 'Automated AP payment lock engaged. Electronic dispute packet prepared with clause reference §4.2.', 'ACTION_REQUIRED', '{"hold_placed": true, "assigned_queue": "AP_DISPUTES_TIER1"}', '2026-03-02 09:14:25');

    INSERT INTO audit_notes (invoice_number, author, role, content, created_at)
    VALUES
      ('INV-10482', 'Elena Rostova', 'Senior AP Forensic Auditor', 'Initiated vendor communication regarding unit rate increase from ₹450 to ₹499. Pending response from Global Supplies accounts coordinator.', '2026-03-02 10:15:00');
  `);
}
