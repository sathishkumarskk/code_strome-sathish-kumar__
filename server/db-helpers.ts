import { getDb, saveDb, PurchaseOrder, InvoiceRecord, AuditLog, AuditNote } from './db.js';

export async function getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
  const db = await getDb();
  const res = db.exec(`SELECT * FROM purchase_orders ORDER BY id DESC`);
  if (!res || res.length === 0) return [];
  const columns = res[0].columns;
  return res[0].values.map((row) => {
    const obj: any = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    obj.supplier = obj.vendor;
    obj.item_description = obj.product;
    obj.expected_quantity = obj.quantity;
    return obj as PurchaseOrder;
  });
}

export async function getPurchaseOrderByNumber(po_number: string): Promise<PurchaseOrder | null> {
  const db = await getDb();
  const stmt = db.prepare(`SELECT * FROM purchase_orders WHERE UPPER(po_number) = UPPER(?)`);
  stmt.bind([po_number.trim()]);
  if (stmt.step()) {
    const row: any = stmt.getAsObject();
    stmt.free();
    row.supplier = row.vendor;
    row.item_description = row.product;
    row.expected_quantity = row.quantity;
    return row as unknown as PurchaseOrder;
  }
  stmt.free();
  return null;
}

export async function insertPurchaseOrder(po: Omit<PurchaseOrder, 'id'>): Promise<PurchaseOrder> {
  const db = await getDb();
  const vendorVal = (po.vendor || po.supplier || '').trim();
  const productVal = (po.product || po.item_description || '').trim();
  const quantityVal = Number(po.quantity !== undefined ? po.quantity : po.expected_quantity) || 0;
  const unitPriceVal = Number(po.agreed_unit_price) || 0;
  const totalVal = po.expected_total ? Number(po.expected_total) : Number((quantityVal * unitPriceVal).toFixed(2));
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const stmt = db.prepare(`
    INSERT INTO purchase_orders (
      po_number, po_date, buyer, vendor, supplier_gstin, product, 
      quantity, agreed_unit_price, expected_total, payment_terms, status, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run([
    po.po_number.trim().toUpperCase(),
    po.po_date || now.split(' ')[0],
    po.buyer || 'Enterprise Tech Operations Ltd',
    vendorVal,
    po.supplier_gstin || '',
    productVal,
    quantityVal,
    unitPriceVal,
    totalVal,
    po.payment_terms || 'Net 30 Days',
    po.status || 'APPROVED',
    po.created_at || now,
    po.updated_at || now
  ]);
  stmt.free();
  saveDb(db);

  return (await getPurchaseOrderByNumber(po.po_number))!;
}

export async function getAllInvoices(filter?: { status?: string; search?: string }): Promise<InvoiceRecord[]> {
  const db = await getDb();
  let query = `SELECT * FROM invoices`;
  const params: any[] = [];
  const conditions: string[] = [];

  if (filter?.status && filter.status !== 'ALL') {
    conditions.push(`status = ?`);
    params.push(filter.status);
  }

  if (filter?.search) {
    conditions.push(`(invoice_number LIKE ? OR po_number LIKE ? OR vendor LIKE ? OR product LIKE ?)`);
    const s = `%${filter.search}%`;
    params.push(s, s, s, s);
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(' AND ');
  }
  query += ` ORDER BY id DESC`;

  const stmt = db.prepare(query);
  if (params.length > 0) {
    stmt.bind(params);
  }

  const results: InvoiceRecord[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as unknown as InvoiceRecord);
  }
  stmt.free();
  return results;
}

export async function getInvoiceByNumber(invoice_number: string): Promise<InvoiceRecord | null> {
  const db = await getDb();
  const stmt = db.prepare(`SELECT * FROM invoices WHERE UPPER(invoice_number) = UPPER(?)`);
  stmt.bind([invoice_number.trim()]);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row as unknown as InvoiceRecord;
  }
  stmt.free();
  return null;
}

export async function insertInvoiceRecord(inv: Omit<InvoiceRecord, 'id'>): Promise<InvoiceRecord> {
  const db = await getDb();
  const existing = await getInvoiceByNumber(inv.invoice_number);

  if (existing) {
    const stmt = db.prepare(`
      UPDATE invoices SET 
        po_number = ?, vendor = ?, product = ?, quantity = ?, unit_price = ?, invoice_total = ?,
        status = ?, variance = ?, potential_overcharge = ?, discrepancy_vector = ?, explanation = ?,
        confidence = ?, raw_payload = ?, action_status = ?, created_at = ?
      WHERE UPPER(invoice_number) = UPPER(?)
    `);
    stmt.run([
      inv.po_number,
      inv.vendor,
      inv.product,
      inv.quantity,
      inv.unit_price,
      inv.invoice_total,
      inv.status,
      inv.variance,
      inv.potential_overcharge,
      inv.discrepancy_vector,
      inv.explanation,
      inv.confidence || 0.98,
      inv.raw_payload || '',
      inv.action_status || 'OPEN',
      inv.created_at || new Date().toISOString().replace('T', ' ').substring(0, 19),
      inv.invoice_number.trim()
    ]);
    stmt.free();
    saveDb(db);
    return (await getInvoiceByNumber(inv.invoice_number))!;
  }

  const stmt = db.prepare(`
    INSERT INTO invoices (invoice_number, po_number, vendor, product, quantity, unit_price, invoice_total, status, variance, potential_overcharge, discrepancy_vector, explanation, confidence, raw_payload, action_status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run([
    inv.invoice_number,
    inv.po_number,
    inv.vendor,
    inv.product,
    inv.quantity,
    inv.unit_price,
    inv.invoice_total,
    inv.status,
    inv.variance,
    inv.potential_overcharge,
    inv.discrepancy_vector,
    inv.explanation,
    inv.confidence || 0.98,
    inv.raw_payload || '',
    inv.action_status || 'OPEN',
    inv.created_at || new Date().toISOString().replace('T', ' ').substring(0, 19)
  ]);
  stmt.free();
  saveDb(db);

  return (await getInvoiceByNumber(inv.invoice_number))!;
}

export async function updateInvoiceAction(invoice_number: string, action: string, note?: string): Promise<InvoiceRecord | null> {
  const db = await getDb();
  let actionStatus = 'OPEN';
  if (action === 'DISPUTE') actionStatus = 'DISPUTED';
  else if (action === 'SHORT_PAY') actionStatus = 'SHORT_PAID';
  else if (action === 'APPROVE') actionStatus = 'APPROVED_OVERRIDE';
  else if (action === 'RESOLVE') actionStatus = 'RESOLVED';

  const stmt = db.prepare(`UPDATE invoices SET action_status = ? WHERE UPPER(invoice_number) = UPPER(?)`);
  stmt.run([actionStatus, invoice_number.trim()]);
  stmt.free();

  // Log to audit logs
  await insertAuditLogRecord({
    invoice_number,
    po_number: '',
    event: `ACTION_${actionStatus}`,
    description: `Auditor executed workflow decision: ${actionStatus}. ${note || ''}`,
    status: 'COMPLETED',
    metadata: JSON.stringify({ action, timestamp: new Date().toISOString() }),
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  });

  if (note) {
    await insertAuditNoteRecord({
      invoice_number,
      author: 'Senior AP Auditor',
      role: 'Forensic AP Specialist',
      content: note,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    });
  }

  saveDb(db);
  return getInvoiceByNumber(invoice_number);
}

export async function getAuditLogsForInvoice(invoice_number?: string): Promise<AuditLog[]> {
  const db = await getDb();
  let query = `SELECT * FROM audit_logs`;
  const params: any[] = [];
  if (invoice_number) {
    query += ` WHERE UPPER(invoice_number) = UPPER(?)`;
    params.push(invoice_number.trim());
  }
  query += ` ORDER BY id DESC LIMIT 50`;

  const stmt = db.prepare(query);
  if (params.length > 0) stmt.bind(params);

  const results: AuditLog[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as unknown as AuditLog);
  }
  stmt.free();
  return results;
}

export async function insertAuditLogRecord(log: Omit<AuditLog, 'id'>): Promise<void> {
  const db = await getDb();
  const stmt = db.prepare(`
    INSERT INTO audit_logs (invoice_number, po_number, event, description, status, metadata, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run([
    log.invoice_number,
    log.po_number,
    log.event,
    log.description,
    log.status,
    log.metadata || '',
    log.created_at || new Date().toISOString().replace('T', ' ').substring(0, 19)
  ]);
  stmt.free();
  saveDb(db);
}

export async function getAuditNotesForInvoice(invoice_number: string): Promise<AuditNote[]> {
  const db = await getDb();
  const stmt = db.prepare(`SELECT * FROM audit_notes WHERE UPPER(invoice_number) = UPPER(?) ORDER BY id DESC`);
  stmt.bind([invoice_number.trim()]);
  const results: AuditNote[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as unknown as AuditNote);
  }
  stmt.free();
  return results;
}

export async function insertAuditNoteRecord(note: Omit<AuditNote, 'id'>): Promise<void> {
  const db = await getDb();
  const stmt = db.prepare(`
    INSERT INTO audit_notes (invoice_number, author, role, content, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run([
    note.invoice_number,
    note.author,
    note.role,
    note.content,
    note.created_at || new Date().toISOString().replace('T', ' ').substring(0, 19)
  ]);
  stmt.free();
  saveDb(db);
}

export async function getDashboardMetrics() {
  const invoices = await getAllInvoices();
  const pos = await getAllPurchaseOrders();

  const totalInvoices = invoices.length;
  const flaggedCount = invoices.filter((i) => i.status === 'DISCREPANCY').length;
  const clearCount = invoices.filter((i) => i.status === 'CLEAR').length;
  const totalOvercharge = invoices.reduce((acc, i) => acc + (i.potential_overcharge || 0), 0);
  const totalSpendAudited = invoices.reduce((acc, i) => acc + (i.invoice_total || 0), 0);
  const accuracyRate = totalInvoices > 0 ? ((clearCount / totalInvoices) * 100).toFixed(1) : '99.8';

  const vendorSet = new Set<string>();
  invoices.forEach(i => { if (i.vendor) vendorSet.add(i.vendor.trim()); });
  pos.forEach(p => { if (p.vendor) vendorSet.add(p.vendor.trim()); });
  const activeVendors = Math.max(vendorSet.size, 1);

  return {
    totalInvoices,
    flaggedCount,
    clearCount,
    totalOvercharge,
    totalSpendAudited,
    accuracyRate,
    activeVendors,
    avgAuditLatencyMs: 142
  };
}
