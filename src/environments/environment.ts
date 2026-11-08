import { AppEnvironment } from './environment.model';

/** Development settings (ng serve / ng test). */
export const environment: AppEnvironment = {
  production: false,
  siteUrl: null,
  apiBaseUrl: null,
  ga4MeasurementId: null,
  adminPrototypeEnabled: true,
};
