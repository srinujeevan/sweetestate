import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CONTACT_ENQUIRY_TYPES, ContactEnquiry, EnquiryPayload } from '../../core/models/enquiry.model';
import { AnalyticsService } from '../../core/services/analytics.service';
import { BranchService } from '../../core/services/branch.service';
import { EnquiryService } from '../../core/services/enquiry.service';
import { TrafficSourceService } from '../../core/services/traffic-source.service';
import { SITE_CONFIG } from '../../core/config/site.config';
import { EnquiryOutcome, EnquiryResultComponent } from '../../shared/forms/enquiry-result.component';
import {
  errorMessage,
  focusFirstInvalid,
  indianMobileValidator,
  looksLikeSpam,
  normaliseMobile,
  notBlankValidator,
  optionalText,
} from '../../shared/forms/form-utils';

type Field = 'name' | 'phone' | 'email' | 'enquiryType' | 'message' | 'consent';

const LABELS: Record<Field, string> = {
  name: 'your name',
  phone: 'your mobile number',
  email: 'your email',
  enquiryType: 'an enquiry type',
  message: 'your message',
  consent: 'consent',
};

@Component({
  selector: 'app-contact-form',
  imports: [ReactiveFormsModule, RouterLink, EnquiryResultComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact-form.component.html',
})
export class ContactFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly enquiries = inject(EnquiryService);
  private readonly traffic = inject(TrafficSourceService);
  private readonly analytics = inject(AnalyticsService);
  protected readonly branches = inject(BranchService);
  protected readonly types = CONTACT_ENQUIRY_TYPES;
  protected readonly isLive = this.enquiries.isLive;

  /** Optional presets (from query params). */
  readonly presetType = input<string | undefined>();
  readonly presetBranch = input<string | undefined>();
  readonly presetProduct = input<string | undefined>();

  private readonly formEl = viewChild<ElementRef<HTMLFormElement>>('formEl');

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, notBlankValidator, Validators.minLength(2), Validators.maxLength(80)]],
    phone: ['', [Validators.required, indianMobileValidator]],
    email: ['', [Validators.email, Validators.maxLength(120)]],
    enquiryType: ['', Validators.required],
    preferredBranchId: [''],
    message: ['', [Validators.required, notBlankValidator, Validators.minLength(10), Validators.maxLength(1000)]],
    consent: [false, Validators.requiredTrue],
    website: [''], // honeypot
  });

  protected readonly submitted = signal(false);
  protected readonly submitting = signal(false);
  protected readonly outcome = signal<EnquiryOutcome | null>(null);
  protected readonly reference = signal<string | null>(null);
  protected readonly lastMessage = signal('');
  private startedAt = Date.now();

  /** Re-evaluated on each change detection (form state is not signal-based). */
  protected errorSummary(): { id: string; text: string }[] {
    return this.submitted() ? this.collectErrors() : [];
  }

  protected focusField(id: string, event: Event): void {
    event.preventDefault();
    this.formEl()?.nativeElement.querySelector<HTMLElement>('#' + id)?.focus();
  }

  constructor() {
    effect(() => {
      const type = this.presetType();
      const branch = this.presetBranch();
      const product = this.presetProduct();
      untracked(() => {
        if (type && (CONTACT_ENQUIRY_TYPES as readonly string[]).includes(type)) {
          this.form.controls.enquiryType.setValue(type);
        }
        if (branch && this.branches.byId(branch)?.status === 'active') {
          this.form.controls.preferredBranchId.setValue(branch);
        }
        if (product && !this.form.controls.message.value) {
          this.form.controls.message.setValue(`I'd like to know more about ${product.slice(0, 80)}.`);
        }
      });
    });
  }

  protected show(field: Field): boolean {
    const c = this.form.controls[field];
    return c.invalid && (c.touched || this.submitted());
  }

  protected error(field: Field): string | null {
    return errorMessage(this.form.controls[field], LABELS[field], field === 'enquiryType' ? 'choose' : 'enter');
  }

  protected submit(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      queueMicrotask(() => focusFirstInvalid(this.formEl()?.nativeElement));
      return;
    }
    const v = this.form.getRawValue();
    const enquiry: ContactEnquiry = {
      kind: 'contact',
      name: v.name.trim(),
      phone: normaliseMobile(v.phone),
      email: optionalText(v.email, 120),
      enquiryType: v.enquiryType,
      preferredBranchId: v.preferredBranchId || null,
      message: v.message.trim().slice(0, 1000),
      consentToContact: v.consent,
    };
    this.lastMessage.set(
      `Hello ${SITE_CONFIG.brandName}, this is ${enquiry.name}. ${enquiry.enquiryType}: ${enquiry.message}`,
    );

    if (looksLikeSpam(v.website, this.startedAt)) {
      this.outcome.set('error');
      return;
    }

    const payload: EnquiryPayload = { ...enquiry, meta: this.traffic.meta('/contact') };
    this.submitting.set(true);
    this.enquiries.submit(payload).subscribe({
      next: (result) => {
        this.submitting.set(false);
        this.outcome.set(result.mode);
        this.reference.set(result.mode === 'live' ? result.reference : null);
        this.analytics.track('contact_form_submit', { mode: result.mode, enquiry_type: enquiry.enquiryType });
      },
      error: (_err: HttpErrorResponse) => {
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

  private collectErrors(): { id: string; text: string }[] {
    return (Object.keys(LABELS) as Field[])
      .filter((f) => this.form.controls[f].invalid)
      .map((f) => ({ id: `contact-${f}`, text: this.error(f) ?? '' }));
  }
}
