/**
 * Business-level configuration — the single place for brand and contact settings.
 *
 * DATA INTEGRITY: only enter details the business owner has confirmed.
 * Anything left null is shown with a safe fallback on the site, never invented.
 *
 * Branches   → src/app/core/data/branches.data.ts
 * Products   → src/app/core/data/products.data.ts
 * Categories → src/app/core/data/categories.data.ts
 * Offers     → src/app/core/data/offers.data.ts
 * Domain / API / analytics → src/environments/
 */
export interface SocialLinks {
  instagram: string | null;
  facebook: string | null;
  youtube: string | null;
}

export interface SiteSettings {
  /**
   * Central WhatsApp Business number: digits only, with country code, no '+'.
   * Example format: '91XXXXXXXXXX'. Do NOT reuse a branch phone number unless
   * the owner confirms that number is on WhatsApp and should receive enquiries.
   */
  whatsappNumber: string | null;
  social: SocialLinks;
}

export const SITE_CONFIG = {
  brandName: 'Sweet Estate',
  legalName: 'Tapeswaram Vaari Sweet Estate',
  city: 'Visakhapatnam',
  cityShort: 'Vizag',
  region: 'Andhra Pradesh',
  country: 'India',
  /** Total branches the business operates; the branch data may hold fewer confirmed entries. */
  totalBranches: 5,
  /** Absolute path (under /public) of a 1200×630 social sharing image, once supplied. */
  ogImagePath: null as string | null,
  priceDisclaimer:
    'Prices shown are indicative and may vary by branch or ordering platform. Please confirm before placing an order.',
  defaults: {
    whatsappNumber: null,
    social: { instagram: null, facebook: null, youtube: null },
  } satisfies SiteSettings,
} as const;
