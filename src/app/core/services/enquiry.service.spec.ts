import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EnquiryPayload, SubmitResult } from '../models/enquiry.model';
import { DemoLeadStore } from '../state/lead.store';
import { API_BASE_URL, EnquiryService } from './enquiry.service';

const payload: EnquiryPayload = {
  kind: 'contact',
  name: 'Test Person',
  phone: '+919876543210',
  email: null,
  enquiryType: 'General question',
  preferredBranchId: null,
  message: 'Hello there, a question.',
  consentToContact: true,
  meta: { sourcePage: '/contact', landingPage: '/', utm: {}, submittedAt: '2026-01-01T00:00:00.000Z' },
};

describe('EnquiryService (demo mode)', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE_URL, useValue: null }],
    });
  });

  it('reports demo mode and never makes an HTTP request', fakeAsync(() => {
    const service = TestBed.inject(EnquiryService);
    const http = TestBed.inject(HttpTestingController);
    let result: SubmitResult | undefined;
    service.submit(payload).subscribe((r) => (result = r));
    tick(500);
    expect(service.isLive).toBeFalse();
    expect(result).toEqual({ mode: 'demo' });
    http.verify();
  }));

  it('keeps the enquiry as a local demo lead', fakeAsync(() => {
    TestBed.inject(EnquiryService).submit(payload).subscribe();
    tick(500);
    const leads = TestBed.inject(DemoLeadStore).leads();
    expect(leads.length).toBe(1);
    expect(leads[0].status).toBe('new');
    localStorage.clear();
  }));
});

describe('EnquiryService (live API)', () => {
  let service: EnquiryService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'https://api.example.test/v1/' },
      ],
    });
    service = TestBed.inject(EnquiryService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('POSTs to /enquiries and reports success only on a 2xx response', () => {
    let result: SubmitResult | undefined;
    service.submit(payload).subscribe((r) => (result = r));
    const req = http.expectOne('https://api.example.test/v1/enquiries');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.name).toBe('Test Person');
    expect(result).toBeUndefined();
    req.flush({ id: 'ENQ-42' });
    expect(result).toEqual({ mode: 'live', reference: 'ENQ-42' });
  });

  it('surfaces server errors instead of claiming success', () => {
    let errored = false;
    let result: SubmitResult | undefined;
    service.submit(payload).subscribe({ next: (r) => (result = r), error: () => (errored = true) });
    http.expectOne('https://api.example.test/v1/enquiries').flush('bad', { status: 422, statusText: 'Unprocessable' });
    expect(errored).toBeTrue();
    expect(result).toBeUndefined();
  });
});
