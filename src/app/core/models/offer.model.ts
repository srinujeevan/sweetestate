export interface Offer {
  id: string;
  title: string;
  description: string;
  /** ISO date (YYYY-MM-DD) or null for "from now". */
  validFrom: string | null;
  /** ISO date (YYYY-MM-DD) or null for "until further notice". */
  validUntil: string | null;
  /** Branch ids the offer applies to; empty = all branches. */
  branchIds: string[];
  terms: string | null;
  active: boolean;
}
