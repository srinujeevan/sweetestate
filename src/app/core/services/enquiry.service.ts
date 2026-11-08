import { HttpClient } from '@angular/common/http';
import { Injectable, InjectionToken, inject } from '@angular/core';
import { Observable, delay, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EnquiryPayload, SubmitResult } from '../models/enquiry.model';
import { DemoLeadStore } from '../state/lead.store';

export const ENQUIRY_API_PATH = '/enquiries';

/** Enquiry API base URL; defaults to the environment setting (null = demo mode). */
export const API_BASE_URL = new InjectionToken<string | null>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => environment.apiBaseUrl,
});

/**
 * Submits enquiries.
 *
 * - API configured: POSTs JSON to `${apiBaseUrl}/enquiries`; success is reported
 *   only on a 2xx response. The server must re-validate every field and apply
 *   its own spam protection (see README → Backend contract).
 * - No API: DEMO MODE. The enquiry is kept in this browser for the admin
 *   prototype and the caller is told nothing was sent.
 */
@Injectable({ providedIn: 'root' })
export class EnquiryService {
  private readonly http = inject(HttpClient);
  private readonly demoLeads = inject(DemoLeadStore);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  readonly isLive = !!this.apiBaseUrl;

  submit(payload: EnquiryPayload): Observable<SubmitResult> {
    if (!this.apiBaseUrl) {
      this.demoLeads.add(payload);
      return of<SubmitResult>({ mode: 'demo' }).pipe(delay(400));
    }
    const url = this.apiBaseUrl.replace(/\/$/, '') + ENQUIRY_API_PATH;
    return this.http
      .post<{ id?: string } | null>(url, payload)
      .pipe(map((res): SubmitResult => ({ mode: 'live', reference: res?.id ?? null })));
  }
}
