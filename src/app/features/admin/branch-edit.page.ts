import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Branch, BranchStatus, DeliveryPlatform } from '../../core/models/branch.model';
import { verifiedDeliveryUrl } from '../../core/services/branch.service';
import { ContentStore } from '../../core/state/content.store';

function deliveryUrlValidator(platform: DeliveryPlatform) {
  return (c: AbstractControl): ValidationErrors | null =>
    !c.value || verifiedDeliveryUrl(platform, c.value) ? null : { deliveryUrl: true };
}

@Component({
  selector: 'app-admin-branch-edit',
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-head">
      <div>
        <h1>Edit branch</h1>
        <p><a routerLink="/admin/branches">← All branches</a></p>
      </div>
    </div>
    @if (!branch()) {
      <div class="notice notice--error">Branch not found.</div>
    } @else {
      <form class="form" [formGroup]="form" (ngSubmit)="save()" novalidate>
        @if (error()) {
          <div class="notice notice--error" role="alert">{{ error() }}</div>
        }
        <div class="notice" role="note">
          Only enter details confirmed by the business owner. Leave unknown fields empty; the site shows a safe fallback.
        </div>

        <fieldset class="admin-fieldset">
          <legend>Branch</legend>
          <div class="form-grid">
            <div class="field">
              <label class="field__label" for="be-status">Status</label>
              <select id="be-status" class="select" formControlName="status">
                <option value="active">Active (shown with details)</option>
                <option value="details-pending">Details pending (shown as “coming soon”)</option>
              </select>
            </div>
            <div class="field">
              <label class="field__label" for="be-name">Branch name</label>
              <input id="be-name" class="input" formControlName="name" />
            </div>
            <div class="field">
              <label class="field__label" for="be-area">Area / landmark</label>
              <input id="be-area" class="input" formControlName="area" />
            </div>
            <div class="field">
              <label class="field__label" for="be-slug">URL slug</label>
              <input id="be-slug" class="input" formControlName="slug" />
            </div>
            <div class="field">
              <label class="field__label" for="be-order">Sort order</label>
              <input id="be-order" class="input" type="number" formControlName="sortOrder" />
            </div>
          </div>
          <label class="check"><input type="checkbox" formControlName="isMain" /> Main branch</label>
        </fieldset>

        <fieldset class="admin-fieldset">
          <legend>Address</legend>
          <div class="field">
            <label class="field__label" for="be-street">Street address</label>
            <input id="be-street" class="input" formControlName="street" />
          </div>
          <div class="form-grid">
            <div class="field">
              <label class="field__label" for="be-loc">City</label>
              <input id="be-loc" class="input" formControlName="locality" />
            </div>
            <div class="field">
              <label class="field__label" for="be-reg">State</label>
              <input id="be-reg" class="input" formControlName="region" />
            </div>
            <div class="field">
              <label class="field__label" for="be-pin">PIN code</label>
              <input id="be-pin" class="input" formControlName="postalCode" inputmode="numeric" />
            </div>
          </div>
        </fieldset>

        <fieldset class="admin-fieldset">
          <legend>Hours &amp; phone</legend>
          <div class="form-grid">
            <div class="field">
              <label class="field__label" for="be-hours">Hours (as shown)</label>
              <input id="be-hours" class="input" formControlName="hoursSummary" placeholder="Daily, 9:00 AM – 9:30 PM" />
            </div>
            <div class="field">
              <label class="field__label" for="be-hours-s">Hours (schema.org)</label>
              <input id="be-hours-s" class="input" formControlName="hoursSchema" placeholder="Mo-Su 09:00-21:30" />
              <p class="field__hint">Used for Google structured data.</p>
            </div>
            <div class="field">
              <label class="field__label" for="be-phone">Phone (as shown)</label>
              <input id="be-phone" class="input" formControlName="phoneDisplay" placeholder="+91 XXXXX XXXXX" />
            </div>
            <div class="field">
              <label class="field__label" for="be-e164">Phone for calling</label>
              <input id="be-e164" class="input" formControlName="phoneE164" placeholder="+91XXXXXXXXXX" />
              @if (form.controls.phoneE164.invalid) {
                <p class="field__error">Use the format +91 followed by 10 digits.</p>
              }
            </div>
          </div>
        </fieldset>

        <fieldset class="admin-fieldset">
          <legend>Delivery links</legend>
          <div class="form-grid">
            <div class="field">
              <label class="field__label" for="be-swiggy">Swiggy store URL</label>
              <input id="be-swiggy" class="input" type="url" formControlName="swiggy" placeholder="https://www.swiggy.com/…" />
              @if (form.controls.swiggy.invalid) {
                <p class="field__error">Must be an https link on swiggy.com.</p>
              }
            </div>
            <div class="field">
              <label class="field__label" for="be-zomato">Zomato store URL</label>
              <input id="be-zomato" class="input" type="url" formControlName="zomato" placeholder="https://www.zomato.com/…" />
              @if (form.controls.zomato.invalid) {
                <p class="field__error">Must be an https link on zomato.com.</p>
              }
            </div>
          </div>
        </fieldset>

        <div class="btn-row">
          <button type="submit" class="btn">Save branch</button>
          <a routerLink="/admin/branches" class="btn btn--outline">Cancel</a>
        </div>
      </form>
    }
  `,
})
export class AdminBranchEditPage {
  private readonly store = inject(ContentStore);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly id = input.required<string>();
  protected readonly branch = computed(() => this.store.branches().find((b) => b.id === this.id()));
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    status: ['details-pending' as BranchStatus],
    name: ['', [Validators.required, Validators.maxLength(60)]],
    area: [''],
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
    sortOrder: [1],
    isMain: [false],
    street: [''],
    locality: ['Visakhapatnam'],
    region: ['Andhra Pradesh'],
    postalCode: ['', Validators.pattern(/^\d{6}$/)],
    hoursSummary: [''],
    hoursSchema: [''],
    phoneDisplay: [''],
    phoneE164: ['', Validators.pattern(/^\+91\d{10}$/)],
    swiggy: ['', deliveryUrlValidator('swiggy')],
    zomato: ['', deliveryUrlValidator('zomato')],
  });

  constructor() {
    effect(() => {
      const b = this.branch();
      untracked(() => {
        if (!b) return;
        this.form.patchValue({
          status: b.status,
          name: b.name,
          area: b.area ?? '',
          slug: b.slug,
          sortOrder: b.sortOrder,
          isMain: b.isMain,
          street: b.address?.streetAddress ?? '',
          locality: b.address?.locality ?? 'Visakhapatnam',
          region: b.address?.region ?? 'Andhra Pradesh',
          postalCode: b.address?.postalCode ?? '',
          hoursSummary: b.hours?.summary ?? '',
          hoursSchema: b.hours?.schemaOrg ?? '',
          phoneDisplay: b.phone?.display ?? '',
          phoneE164: b.phone?.e164 ?? '',
          swiggy: b.deliveryLinks.swiggy ?? '',
          zomato: b.deliveryLinks.zomato ?? '',
        });
      });
    });
  }

  protected save(): void {
    this.error.set(null);
    const b = this.branch();
    if (!b) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Please fix the highlighted fields.');
      return;
    }
    const v = this.form.getRawValue();
    if (v.status === 'active' && !v.street.trim()) {
      this.error.set('An active branch needs at least a street address.');
      return;
    }
    if (this.store.branches().some((x) => x.slug === v.slug && x.id !== b.id)) {
      this.error.set('Another branch already uses that slug.');
      return;
    }
    const updated: Branch = {
      ...b,
      status: v.status,
      name: v.name.trim(),
      area: v.area.trim() || null,
      slug: v.slug,
      sortOrder: Number(v.sortOrder) || 0,
      isMain: v.isMain,
      address: v.street.trim()
        ? {
            streetAddress: v.street.trim(),
            locality: v.locality.trim() || 'Visakhapatnam',
            region: v.region.trim() || 'Andhra Pradesh',
            postalCode: v.postalCode.trim() || null,
          }
        : null,
      hours: v.hoursSummary.trim() ? { summary: v.hoursSummary.trim(), schemaOrg: v.hoursSchema.trim() } : null,
      phone:
        v.phoneE164.trim() ? { display: v.phoneDisplay.trim() || v.phoneE164.trim(), e164: v.phoneE164.trim() } : null,
      deliveryLinks: { swiggy: v.swiggy.trim() || null, zomato: v.zomato.trim() || null },
    };
    this.store.saveBranch(updated);
    this.router.navigate(['/admin/branches']);
  }
}
