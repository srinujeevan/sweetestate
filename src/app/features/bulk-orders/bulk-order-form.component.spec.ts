import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { API_BASE_URL } from '../../core/services/enquiry.service';
import { BulkOrderFormComponent } from './bulk-order-form.component';

describe('BulkOrderFormComponent', () => {
  function create() {
    TestBed.configureTestingModule({
      imports: [BulkOrderFormComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE_URL, useValue: null }],
    });
    const fixture = TestBed.createComponent(BulkOrderFormComponent);
    fixture.detectChanges();
    // Access the protected form for validation checks.
    const form = (fixture.componentInstance as unknown as { form: FormGroup }).form;
    return { fixture, form };
  }

  it('requires occasion, date, quantity, name, phone and consent', () => {
    const { form } = create();
    for (const key of ['name', 'phone', 'occasion', 'eventDate', 'estimatedQuantity', 'consent']) {
      expect(form.get(key)!.invalid).withContext(key).toBeTrue();
    }
    expect(form.get('email')!.valid).toBeTrue();
    expect(form.get('preferredProducts')!.valid).toBeTrue();
  });

  it('requires a location only when delivery is chosen', () => {
    const { form } = create();
    expect(form.get('location')!.valid).toBeTrue();
    form.get('fulfilment')!.setValue('delivery');
    expect(form.get('location')!.hasError('required')).toBeTrue();
    form.get('fulfilment')!.setValue('pickup');
    expect(form.get('location')!.valid).toBeTrue();
  });

  it('rejects event dates in the past', () => {
    const { form } = create();
    form.get('eventDate')!.setValue('2001-01-01');
    expect(form.get('eventDate')!.hasError('pastDate')).toBeTrue();
  });

  it('applies the preferred branch preset only for active branches', () => {
    const { fixture, form } = create();
    fixture.componentRef.setInput('presetBranch', 'branch-4');
    fixture.detectChanges();
    expect(form.get('preferredBranchId')!.value).toBe('');
    fixture.componentRef.setInput('presetBranch', 'seethammadhara');
    fixture.detectChanges();
    expect(form.get('preferredBranchId')!.value).toBe('seethammadhara');
  });
});
