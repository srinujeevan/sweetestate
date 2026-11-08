import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BrowserStorage } from './browser-storage.service';

export type AnalyticsEvent =
  | 'whatsapp_click'
  | 'phone_click'
  | 'directions_click'
  | 'contact_form_submit'
  | 'bulk_enquiry_submit'
  | 'product_view'
  | 'product_whatsapp_enquiry'
  | 'swiggy_click'
  | 'zomato_click'
  | 'branch_view';

export type AnalyticsParams = Record<string, string | number | boolean | null | undefined>;
type ConsentState = 'granted' | 'denied' | null;

const CONSENT_KEY = 'se.analytics-consent';

type Gtag = (...args: unknown[]) => void;
interface GtagWindow extends Window {
  dataLayer?: unknown[];
  gtag?: Gtag;
}

/**
 * GA4 wrapper. Nothing is loaded or sent unless BOTH a measurement ID is
 * configured in the environment AND the visitor has granted consent.
 * Without GA4, events are logged to the console in development only.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly doc = inject(DOCUMENT);
  private readonly storage = inject(BrowserStorage);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly measurementId = environment.ga4MeasurementId;
  private loaded = false;

  private readonly consent = signal<ConsentState>(null);
  readonly isEnabled = !!this.measurementId;
  readonly needsConsentDecision = computed(() => this.isEnabled && this.consent() === null);

  /** Restores a stored consent decision. Call once in the browser. */
  init(): void {
    if (!this.isBrowser || !this.isEnabled) return;
    const stored = this.storage.get(CONSENT_KEY);
    if (stored === 'granted' || stored === 'denied') this.consent.set(stored);
    if (stored === 'granted') this.loadGtag();
  }

  setConsent(granted: boolean): void {
    const value = granted ? 'granted' : 'denied';
    this.consent.set(value);
    this.storage.set(CONSENT_KEY, value);
    if (granted) this.loadGtag();
  }

  track(event: AnalyticsEvent, params: AnalyticsParams = {}): void {
    if (!this.isBrowser) return;
    const gtag = (this.doc.defaultView as GtagWindow | null)?.gtag;
    if (this.loaded && gtag) {
      gtag('event', event, params);
    } else if (!environment.production) {
      console.debug('[analytics:dev]', event, params);
    }
  }

  pageView(path: string, title: string): void {
    const gtag = (this.doc.defaultView as GtagWindow | null)?.gtag;
    if (this.loaded && gtag) gtag('event', 'page_view', { page_path: path, page_title: title });
  }

  private loadGtag(): void {
    if (this.loaded || !this.measurementId || !this.isBrowser) return;
    const win = this.doc.defaultView as GtagWindow;
    win.dataLayer = win.dataLayer ?? [];
    win.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      win.dataLayer!.push(arguments);
    };
    win.gtag('js', new Date());
    win.gtag('config', this.measurementId, { send_page_view: false });
    const script = this.doc.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(this.measurementId)}`;
    this.doc.head.appendChild(script);
    this.loaded = true;
  }
}
