export type EnquiryKind = 'contact' | 'bulk';

export const CONTACT_ENQUIRY_TYPES = [
  'General question',
  'Product enquiry',
  'Bulk / event order',
  'Branch question',
  'Feedback',
  'Other',
] as const;

export const BULK_OCCASIONS = [
  'Wedding',
  'Family function',
  'Birthday',
  'Festival',
  'Corporate gifting',
  'Return gifts',
  'Other',
] as const;

export type Fulfilment = 'pickup' | 'delivery' | 'undecided';

export interface EnquiryMeta {
  /** Path of the page the form was submitted from. */
  sourcePage: string;
  /** First page of the visit, if known. */
  landingPage: string | null;
  /** utm_* parameters captured on landing. */
  utm: Record<string, string>;
  /** ISO timestamp. */
  submittedAt: string;
}

export interface ContactEnquiry {
  kind: 'contact';
  name: string;
  phone: string;
  email: string | null;
  enquiryType: string;
  preferredBranchId: string | null;
  message: string;
  consentToContact: boolean;
}

export interface BulkEnquiry {
  kind: 'bulk';
  name: string;
  phone: string;
  email: string | null;
  occasion: string;
  eventDate: string;
  estimatedQuantity: string;
  preferredProducts: string | null;
  fulfilment: Fulfilment;
  preferredBranchId: string | null;
  location: string | null;
  message: string | null;
  consentToContact: boolean;
}

export type EnquiryPayload = (ContactEnquiry | BulkEnquiry) & { meta: EnquiryMeta };

/** Outcome of a submission. 'demo' means nothing left the browser. */
export type SubmitResult = { mode: 'live'; reference: string | null } | { mode: 'demo' };

export const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'converted', 'closed'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export interface LeadNote {
  id: string;
  at: string;
  text: string;
}

export interface LeadHistoryEntry {
  at: string;
  change: string;
}

export interface Lead {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: LeadStatus;
  assignedBranchId: string | null;
  assignedTo: string | null;
  notes: LeadNote[];
  history: LeadHistoryEntry[];
  payload: EnquiryPayload;
}
