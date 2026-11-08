import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SITE_CONFIG } from '../../core/config/site.config';
import { BULK_OCCASIONS, BulkEnquiry, EnquiryPayload, Fulfilment } from '../../core/models/enquiry.model';
import { AnalyticsService } from '../../core/services/analytics.service';
import { BranchService } from '../../core/services/branch.service';
import { CatalogueService } from '../../core/services/catalogue.service';
import { EnquiryService } from '../../core/services/enquiry.service';
import { TrafficSourceService } from '../../core/services/traffic-source.service';
import { EnquiryOutcome, EnquiryResultComponent } from '../../shared/forms/enquiry-result.component';
import {
  errorMessage,
  focusFirstInvalid,
  indianMobileValidator,
  looksLikeSpam,
  normaliseMobile,
  notBlankValidator,
  notInPastValidator,
  optionalText,
  todayIso,
} from '../../shared/forms/form-utils';

type Field =
  | 'name'
  | 'phone'
  | 'email'
  | 'occasion'
  | 'eventDate'
  | 'estimatedQuantity'
  | 'preferredProducts'
  | 'location'
  | 'message'
  | 'consent';

const LABELS: Record<Field, string> = {
  name: 'your name',
  phone: 'your mobile number',
  email: 'your email',
  occasion: 'the occasion',
  eventDate: 'the event date',
  estimatedQuantity: 'an estimated quantity',
  preferredProducts: 'preferred products',
  location: 'the delivery location',
  message: 'your message',
  consent: 'consent',
};

export const FULFILMENT_OPTIONS: { value: Fulfilment; label: string }[] = [
  { value: 'pickup', label: 'Pickup from branch' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'undecided', label: 'Not sure yet' },
];

@Component({
  selector: 'app-bulk-order-form',
  imports: [ReactiveFormsModule, RouterLink, EnquiryResultComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bulk-order-form.component.html',
})
export class BulkOrderFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly enquiries = inject(EnquiryService);
  private readonly traffic = inject(TrafficSourceService);
  private readonly analytics = inject(AnalyticsService);
  protected readonly branches = inject(BranchService);
  protected readonly catalogue = inject(CatalogueService);
  protected readonly occasions = BULK_OCCASIONS;
  protected readonly fulfilmentOptions = FULFILMENT_OPTIONS;
  protected readonly isLive = this.enquiries.isLive;
  protected readonly minDate = todayIso();

  readonly presetBranch = input<string | undefined>();
  readonly presetOccasion = input<string | undefined>();

  private readonly formEl = viewChild<ElementRef<HTMLFormElement>>('formEl');

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, notBlankValidator, Validators.minLength(2), Validators.maxLength(80)]],
    phone: ['', [Validators.required, indianMobileValidator]],
    email: ['', [Validators.email, Validators.maxLength(120)]],
    occasion: ['', Validators.required],
    eventDate: ['', [Validators.required, notInPastValidator]],
    estimatedQuantity: ['', [Validators.required, notBlankValidator, Validators.maxLength(80)]],
    preferredProducts: ['', Validators.maxLength(300)],
    fulfilment: ['undecided' as Fulfilment, Validators.required],
    preferredBranchId: [''],
    location: ['', Validators.maxLength(200)],
    message: ['', Validators.maxLength(1000)],
    consent: [false, Validators.requiredTrue],
    website: [''], // honeypot
  });

  protected readonly submitted = signal(false);
  protected readonly submitting = signal(false);
  protected readonly outcome = signal<EnquiryOutcome | null>(null);
  protected readonly reference = signal<string | null>(null);
  protected readonly lastMessage = signal('');
  private startedAt = Date.now();

  constructor() {
    // Location is required only for delivery.
    this.form.controls.fulfilment.valueChanges.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe((value) => {
      const location = this.form.controls.location;
      location.setValidators(
        value === 'delivery'
          ? [Validators.required, notBlankValidator, Validators.maxLength(200)]
          : [Validators.maxLength(200)],
      );
      location.updateValueAndValidity();
    });

    effect(() => {
      const branch = this.presetBranch();
      const occasion = this.presetOccasion();
      untracked(() => {
        if (branch && this.branches.byId(branch)?.status === 'active') {
          this.form.controls.preferredBranchId.setValue(branch);
        }
        if (occasion && (BULK_OCCASIONS as readonly string[]).includes(occasion)) {
          this.form.controls.occasion.setValue(occasion);
        }
      });
    });
  }

  protected show(field: Field): boolean {
    const c = this.form.controls[field];
    return c.invalid && (c.touched || this.submitted());
  }

  protected error(field: Field): string | null {
    const verb = field === 'occasion' || field === 'eventDate' ? 'choose' : 'enter';
    return errorMessage(this.form.controls[field], LABELS[field], verb);
  }

  protected errorSummary(): { id: string; text: string }[] {
    if (!this.submitted()) return [];
    return (Object.keys(LABELS) as Field[])
      .filter((f) => this.form.controls[f].invalid)
      .map((f) => ({ id: `bulk-${f}`, text: this.error(f) ?? '' }));
  }

  protected focusField(id: string, event: Event): void {
    event.preventDefault();
    this.formEl()?.nativeElement.querySelector<HTMLElement>('#' + id)?.focus();
  }

  protected submit(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      queueMicrotask(() => focusFirstInvalid(this.formEl()?.nativeElement));
      return;
    }
    const v = this.form.getRawValue();
    const enquiry: BulkEnquiry = {
      kind: 'bulk',
      name: v.name.trim(),
      phone: normaliseMobile(v.phone),
      email: optionalText(v.email, 120),
      occasion: v.occasion,
      eventDate: v.eventDate,
      estimatedQuantity: v.estimatedQuantity.trim().slice(0, 80),
      preferredProducts: optionalText(v.preferredProducts, 300),
      fulfilment: v.fulfilment,
      preferredBranchId: v.preferredBranchId || null,
      location: optionalText(v.location, 200),
      message: optionalText(v.message, 1000),
      consentToContact: v.consent,
    };
    this.lastMessage.set(
      [
        `Hello ${SITE_CONFIG.brandName}, this is ${enquiry.name}.`,
        `I'd like to enquire about a bulk order for a ${enquiry.occasion.toLowerCase()} on ${enquiry.eventDate}.`,
        `Quantity: ${enquiry.estimatedQuantity}.`,
        enquiry.preferredProducts ? `Products: ${enquiry.preferredProducts}.` : '',
      ]
        .filter(Boolean)
        .join(' '),
    );

    if (looksLikeSpam(v.website, this.startedAt)) {
      this.outcome.set('error');
      return;
    }

    const payload: EnquiryPayload = { ...enquiry, meta: this.traffic.meta('/bulk-orders') };
    this.submitting.set(true);
    this.enquiries.submit(payload).subscribe({
      next: (result) => {
        this.submitting.set(false);
        this.outcome.set(result.mode);
        this.reference.set(result.mode === 'live' ? result.reference : null);
        this.analytics.track('bulk_enquiry_submit', { mode: result.mode, occasion: enquiry.occasion });
      },
      error: () => {
        this.submitting.set(false);
        this.outcome.set('error');
      },
    });
  }

  protected reset(): void {
    if (this.outcome() !== 'error') {
      this.form.reset();
      this.submitted.set(false);
    }
    this.outcome.set(null);
    this.startedAt = Date.now();
  }
}
