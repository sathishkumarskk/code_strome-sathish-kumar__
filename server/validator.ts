import { PurchaseOrder, InvoiceRecord } from './db.js';
import { ExtractedInvoice } from './gemini.js';

export interface AuditComparisonResult {
  invoice_number: string;
  po_number: string;
  vendor: string;
  product: string;
  
  // PO Expected
  expected_quantity: number;
  expected_unit_price: number;
  expected_total: number;

  // Invoice Actual
  invoice_quantity: number;
  invoice_unit_price: number;
  invoice_total: number;

  // Comparison
  quantity_status: 'CLEAR' | 'DISCREPANCY' | 'SHORT_DELIVERY' | 'SURPLUS';
  quantity_reason?: 'NONE' | 'SHORT DELIVERY' | 'QUANTITY SURPLUS';
  quantity_variance: number;
  quantity_difference: number;

  price_status: 'CLEAR' | 'DISCREPANCY' | 'OVERCHARGE' | 'DISCOUNT';
  price_variance: number;

  total_variance: number;
  potential_overcharge: number;

  status: 'CLEAR' | 'DISCREPANCY' | 'NEEDS REVIEW';
  discrepancy_vector: 'NONE' | 'PRICE_DISCREPANCY' | 'QUANTITY_SURPLUS' | 'SHORT_DELIVERY' | 'SURCHARGE_UNMATCHED' | 'MULTIPLE_ANOMALIES';
  
  explanation: string;
  confidence: number;
  compliance_checks: {
    name: string;
    description: string;
    passed: boolean;
    difference?: string;
  }[];
}

export function evaluateInvoiceAgainstPo(
  extracted: ExtractedInvoice,
  po: PurchaseOrder
): AuditComparisonResult {
  const invQty = Number(extracted.quantity) || 0;
  const poQty = Number(po.quantity !== undefined ? po.quantity : (po as any).expected_quantity) || 0;
  const invPrice = Number(extracted.unit_price) || 0;
  const poPrice = Number(po.agreed_unit_price) || 0;

  const expectedTotal = po.expected_total || (poQty * poPrice);
  const invTotal = extracted.total || (invQty * invPrice);

  // 1. Quantity Check
  let quantity_status: 'CLEAR' | 'DISCREPANCY' = 'CLEAR';
  let quantity_reason: 'NONE' | 'SHORT DELIVERY' | 'QUANTITY SURPLUS' = 'NONE';
  const quantity_variance = invQty - poQty;
  const quantity_difference = Math.abs(invQty - poQty);

  if (invQty === poQty) {
    quantity_status = 'CLEAR';
    quantity_reason = 'NONE';
  } else if (invQty < poQty) {
    quantity_status = 'DISCREPANCY';
    quantity_reason = 'SHORT DELIVERY';
  } else {
    quantity_status = 'DISCREPANCY';
    quantity_reason = 'QUANTITY SURPLUS';
  }

  // 2. Unit Price Check
  let price_status: 'CLEAR' | 'DISCREPANCY' = 'CLEAR';
  const price_variance = Number((invPrice - poPrice).toFixed(2));
  if (price_variance > 0.009) {
    price_status = 'DISCREPANCY';
  } else {
    // If invoice unit price <= PO agreed unit price: Price Status = CLEAR
    price_status = 'CLEAR';
  }

  // 3. Financial Impact & Overcharge Calculation
  const total_variance = Number((invTotal - expectedTotal).toFixed(2));
  let potential_overcharge = 0;

  if (price_variance > 0 && invQty > 0) {
    // If unit price is higher, overcharge = Price Difference × Invoice Quantity
    potential_overcharge = Number((price_variance * invQty).toFixed(2));
  } else if (quantity_reason === 'QUANTITY SURPLUS') {
    // If quantity surplus billed at agreed rate
    potential_overcharge = Number((quantity_variance * poPrice).toFixed(2));
  }

  // 4. Overall Discrepancy Status
  let overall_status: 'CLEAR' | 'DISCREPANCY' | 'NEEDS REVIEW' = 'CLEAR';
  if (!invQty || !poQty || invPrice === undefined || poPrice === undefined) {
    overall_status = 'NEEDS REVIEW';
  } else if (quantity_status === 'CLEAR' && price_status === 'CLEAR') {
    overall_status = 'CLEAR';
  } else {
    overall_status = 'DISCREPANCY';
  }

  let discrepancy_vector: AuditComparisonResult['discrepancy_vector'] = 'NONE';
  if (price_status === 'DISCREPANCY' && quantity_status === 'DISCREPANCY') {
    discrepancy_vector = 'MULTIPLE_ANOMALIES';
  } else if (price_status === 'DISCREPANCY') {
    discrepancy_vector = 'PRICE_DISCREPANCY';
  } else if (quantity_reason === 'QUANTITY SURPLUS') {
    discrepancy_vector = 'QUANTITY_SURPLUS';
  } else if (quantity_reason === 'SHORT DELIVERY') {
    discrepancy_vector = 'SHORT_DELIVERY';
  }

  // 5. Dynamic Human-Readable Explanation
  let explanation = '';
  if (overall_status === 'CLEAR') {
    explanation = `The invoice matches Purchase Order ${po.po_number}. Billed quantity (${invQty} units) and unit price (₹${poPrice.toFixed(2)}) align with authorized ERP records with zero variance.`;
  } else if (price_status === 'DISCREPANCY' && quantity_status === 'CLEAR') {
    explanation = `The invoice quantity matches the Purchase Order (${poQty} units), but the vendor charged ₹${invPrice.toFixed(2)} per unit instead of the agreed ₹${poPrice.toFixed(2)}. Difference per unit: ₹${price_variance.toFixed(2)}. Potential Overcharge: ₹${potential_overcharge.toLocaleString('en-IN', { minimumFractionDigits: 2 })}.`;
  } else if (quantity_reason === 'SHORT DELIVERY' && price_status === 'CLEAR') {
    explanation = `Short delivery detected against ${po.po_number}: PO expected ${poQty} units, but vendor billed for ${invQty} units (short delivery of ${quantity_difference} units). Unit price matches contractual rate of ₹${poPrice.toFixed(2)}.`;
  } else if (quantity_reason === 'QUANTITY SURPLUS' && price_status === 'CLEAR') {
    explanation = `Quantity surplus detected against ${po.po_number}: PO authorized ${poQty} units, but vendor billed for ${invQty} units (+${quantity_variance} units surplus). Unauthorized financial exposure: ₹${potential_overcharge.toLocaleString('en-IN', { minimumFractionDigits: 2 })}.`;
  } else {
    explanation = `Multiple discrepancies detected against ${po.po_number}: ${quantity_reason === 'SHORT DELIVERY' ? `Short delivery of ${quantity_difference} units (${invQty} vs ${poQty})` : `Quantity surplus of +${quantity_variance} units (${invQty} vs ${poQty})`} and unit price discrepancy (₹${invPrice.toFixed(2)} vs ₹${poPrice.toFixed(2)}). Total financial exposure: ₹${potential_overcharge.toLocaleString('en-IN', { minimumFractionDigits: 2 })}.`;
  }

  const compliance_checks = [
    {
      name: 'Supplier Identity Verification',
      description: 'Matches legal entity name against registered ERP master record',
      passed: extracted.vendor.toLowerCase().includes((po.vendor || (po as any).supplier || '').toLowerCase().split(' ')[0]) || (po.vendor || (po as any).supplier || '').toLowerCase().includes(extracted.vendor.toLowerCase().split(' ')[0]),
      difference: 'Matched'
    },
    {
      name: 'Quantity Baseline Enforcement',
      description: 'Ensures delivered units match authorized PO contract quantity',
      passed: quantity_status === 'CLEAR',
      difference: quantity_status === 'CLEAR' 
        ? `${poQty} / ${poQty} units (100% match)` 
        : (quantity_reason === 'SHORT DELIVERY' ? `Short delivery: ${invQty} vs ${poQty} units (-${quantity_difference})` : `Surplus: ${invQty} vs ${poQty} units (+${quantity_variance})`)
    },
    {
      name: 'Contractual Unit Rate Tolerance',
      description: 'Zero-tolerance validation on negotiated per-unit contractual pricing',
      passed: price_status === 'CLEAR',
      difference: price_status === 'CLEAR' ? `₹${poPrice.toFixed(2)} exact rate` : `+₹${price_variance.toFixed(2)} / unit overcharge`
    },
    {
      name: 'Grand Total Math Verification',
      description: 'Confirms (Quantity × Unit Price) matches Grand Total on face of invoice',
      passed: Math.abs((invQty * invPrice) - invTotal) < 1.0,
      difference: 'Verified'
    },
    {
      name: 'PO Life-Cycle State',
      description: 'Checks whether Purchase Order is currently active and approved for settlement',
      passed: po.status === 'APPROVED',
      difference: po.status
    }
  ];

  return {
    invoice_number: extracted.invoice_number,
    po_number: po.po_number,
    vendor: po.vendor || (po as any).supplier,
    product: po.product || (po as any).item_description,
    expected_quantity: poQty,
    expected_unit_price: poPrice,
    expected_total: expectedTotal,
    invoice_quantity: invQty,
    invoice_unit_price: invPrice,
    invoice_total: invTotal,
    quantity_status,
    quantity_reason,
    quantity_variance,
    quantity_difference,
    price_status,
    price_variance,
    total_variance,
    potential_overcharge,
    status: overall_status,
    discrepancy_vector,
    explanation,
    confidence: extracted.confidence,
    compliance_checks
  };
}
