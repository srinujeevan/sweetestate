export type BranchStatus = 'active' | 'details-pending';

export interface BranchAddress {
  streetAddress: string;
  locality: string;
  region: string;
  postalCode: string | null;
}

export interface BranchHours {
  /** Human readable, e.g. 'Daily, 9:00 AM – 9:30 PM'. */
  summary: string;
  /** schema.org openingHours value, e.g. 'Mo-Su 09:00-21:30'. */
  schemaOrg: string;
}

export interface BranchPhone {
  /** As displayed, e.g. '+91 76740 95588'. */
  display: string;
  /** E.164, used for tel: links, e.g. '+917674095588'. */
  e164: string;
}

export interface DeliveryLinks {
  /** Verified Swiggy store URL for this branch, or null until supplied. */
  swiggy: string | null;
  /** Verified Zomato store URL for this branch, or null until supplied. */
  zomato: string | null;
}

export interface Branch {
  id: string;
  slug: string;
  status: BranchStatus;
  /** Short display name, e.g. 'H.B. Colony'. */
  name: string;
  /** Secondary area label, e.g. 'Durga Nagar'. */
  area: string | null;
  isMain: boolean;
  address: BranchAddress | null;
  /** Null → "Please contact the branch for timings". */
  hours: BranchHours | null;
  phone: BranchPhone | null;
  deliveryLinks: DeliveryLinks;
  sortOrder: number;
}

export type DeliveryPlatform = keyof DeliveryLinks;
