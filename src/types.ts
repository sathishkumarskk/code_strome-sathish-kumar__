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

export interface ComplianceCheck {
  name: string;
  description: string;
  passed: boolean;
  difference?: string;
}

export interface AuditComparisonResult {
  invoice_number: string;
  po_number: string;
  vendor: string;
  product: string;
  expected_quantity: number;
  expected_unit_price: number;
  expected_total: number;
  invoice_quantity: number;
  invoice_unit_price: number;
  invoice_total: number;
  quantity_status: 'CLEAR' | 'DISCREPANCY' | 'SHORT_DELIVERY' | 'SURPLUS';
  quantity_reason?: 'NONE' | 'SHORT DELIVERY' | 'QUANTITY SURPLUS';
  quantity_variance: number;
  quantity_difference?: number;
  price_status: 'CLEAR' | 'DISCREPANCY' | 'OVERCHARGE' | 'DISCOUNT';
  price_variance: number;
  total_variance: number;
  potential_overcharge: number;
  status: 'CLEAR' | 'DISCREPANCY' | 'NEEDS REVIEW';
  discrepancy_vector: string;
  explanation: string;
  confidence: number;
  compliance_checks: ComplianceCheck[];
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

export interface DashboardMetrics {
  totalInvoices: number;
  flaggedCount: number;
  clearCount: number;
  totalOvercharge: number;
  totalSpendAudited: number;
  accuracyRate: string;
  activeVendors: number;
  avgAuditLatencyMs: number;
}
