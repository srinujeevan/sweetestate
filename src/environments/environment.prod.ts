import { AppEnvironment } from './environment.model';

/**
 * Production settings (ng build). See README → "Configuration".
 * siteUrl is also read by scripts/generate-seo-files.mjs to build sitemap.xml.
 */
export const environment: AppEnvironment = {
  production: true,
  siteUrl: null,
  apiBaseUrl: null,
  ga4MeasurementId: null,
  // Prototype admin is enabled for the demo. Set to false before public launch.
  adminPrototypeEnabled: true,
};
