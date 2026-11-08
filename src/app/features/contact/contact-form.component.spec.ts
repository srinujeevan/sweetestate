import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { API_BASE_URL } from '../../core/services/enquiry.service';
import { ContactFormComponent } from './contact-form.component';

describe('ContactFormComponent', () => {
  let fixture: ComponentFixture<ContactFormComponent>;
  let el: HTMLElement;

  function set(id: string, value: string): void {
    const input = el.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('#' + id)!;
    input.value = value;
    input.dispatchEvent(new Event(input instanceof HTMLSelectElement ? 'change' : 'input'));
  }

  function fillValid(): void {
    set('contact-name', 'Lakshmi');
    set('contact-phone', '98765 43210');
    set('contact-enquiryType', 'General question');
    set('contact-message', 'Do you take orders for Sankranti?');
    const consent = el.querySelector<HTMLInputElement>('#contact-consent')!;
    consent.click();
  }

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [ContactFormComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE_URL, useValue: null }],
    });
    fixture = TestBed.createComponent(ContactFormComponent);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => localStorage.clear());

  it('shows the demo-mode notice when no API is configured', () => {
    expect(el.textContent).toContain('Demo mode');
  });

  it('shows required-field errors and does not submit when empty', () => {
    el.querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    fixture.detectChanges();
    expect(el.querySelector('.form-summary')).toBeTruthy();
    expect(el.textContent).toContain('Please enter your name.');
    expect(el.textContent).toContain('Please enter your mobile number.');
    expect(el.textContent).toContain('Please tick this box to continue.');
    expect(el.querySelector('app-enquiry-result')).toBeNull();
  });

  it('rejects an invalid mobile number', () => {
    set('contact-phone', '12345');
    el.querySelector<HTMLInputElement>('#contact-phone')!.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(el.textContent).toContain('valid 10-digit Indian mobile number');
  });

  it('in demo mode, never claims the enquiry was sent', fakeAsync(() => {
    tick(2500); // past the minimum fill time
    fillValid();
    fixture.detectChanges();
    el.querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    tick(500);
    fixture.detectChanges();
    const text = el.textContent ?? '';
    expect(text).toContain('has NOT been sent');
    expect(text).not.toContain('has been sent.');
  }));

  it('treats a filled honeypot as spam and does not store a lead', fakeAsync(() => {
    tick(2500);
    fillValid();
    set('contact-website', 'http://spam.example');
    fixture.detectChanges();
    el.querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    tick(500);
    fixture.detectChanges();
    expect(el.textContent).toContain('couldn’t send');
    expect(localStorage.getItem('se.admin-prototype.demo-leads.v1')).toBeNull();
  }));

  it('prefills enquiry type and product from presets', () => {
    fixture.componentRef.setInput('presetType', 'Product enquiry');
    fixture.componentRef.setInput('presetProduct', 'Chandrakala (250 grams)');
    fixture.detectChanges();
    expect(el.querySelector<HTMLSelectElement>('#contact-enquiryType')!.value).toBe('Product enquiry');
    expect(el.querySelector<HTMLTextAreaElement>('#contact-message')!.value).toContain('Chandrakala (250 grams)');
  });
});
