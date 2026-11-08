/**
 * Build-time environment settings. Never put secrets here — everything in an
 * Angular environment file is shipped to the browser.
 */
export interface AppEnvironment {
  production: boolean;
  /**
   * Public production origin, e.g. 'https://www.example.com' (no trailing slash).
   * Used for canonical URLs, Open Graph URLs, structured data and sitemap.xml.
   * Leave null until the real domain is confirmed — canonical tags are then omitted.
   */
  siteUrl: string | null;
  /**
   * Base URL of the enquiry/admin API, e.g. 'https://api.example.com/v1'.
   * When null, forms run in clearly labelled DEMO MODE and nothing is sent.
   */
  apiBaseUrl: string | null;
  /** Google Analytics 4 measurement ID (G-XXXXXXX). Null disables analytics entirely. */
  ga4MeasurementId: string | null;
  /**
   * Enables the browser-only admin PROTOTYPE at /admin. It has no authentication
   * and stores edits only in the current browser. Disable before public launch
   * unless a real backend with server-side auth has replaced it.
   */
  adminPrototypeEnabled: boolean;
}
