import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { EnquiryMeta } from '../models/enquiry.model';
import { BrowserStorage } from './browser-storage.service';

const KEY = 'se.traffic-source';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

interface TrafficSource {
  landingPage: string;
  utm: Record<string, string>;
}

/** Captures landing page and UTM parameters once per browser session. */
@Injectable({ providedIn: 'root' })
export class TrafficSourceService {
  private readonly doc = inject(DOCUMENT);
  private readonly storage = inject(BrowserStorage);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  capture(): void {
    if (!this.isBrowser) return;
    const location = this.doc.defaultView?.location;
    if (!location) return;
    const params = new URLSearchParams(location.search);
    const utm: Record<string, string> = {};
    for (const key of UTM_KEYS) {
      const value = params.get(key);
      if (value) utm[key] = value.slice(0, 100);
    }
    const existing = this.storage.getJson<TrafficSource>(KEY, 'session');
    // A new campaign click replaces the stored source; otherwise keep the first landing.
    if (!existing || Object.keys(utm).length) {
      this.storage.setJson(KEY, { landingPage: location.pathname, utm } satisfies TrafficSource, 'session');
    }
  }

  meta(sourcePage: string): EnquiryMeta {
    const source = this.storage.getJson<TrafficSource>(KEY, 'session');
    return {
      sourcePage,
      landingPage: source?.landingPage ?? null,
      utm: source?.utm ?? {},
      submittedAt: new Date().toISOString(),
    };
  }
}
