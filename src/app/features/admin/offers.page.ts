import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Offer } from '../../core/models/offer.model';
import { BranchService } from '../../core/services/branch.service';
import { ContentStore } from '../../core/state/content.store';
import { createId } from '../../core/utils/ids';
import { isOfferCurrent } from '../offers/offers.page';

@Component({
  selector: 'app-admin-offers',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-head">
      <div>
        <h1>Offers</h1>
        <p>Add only real, approved offers. The public Offers page shows an empty state when none are current.</p>
      </div>
    </div>

    <div class="admin-table-wrap" style="margin-bottom: 28px">
      <table class="admin-table">
        <thead><tr><th>Offer</th><th>Dates</th><th>Status</th><th><span class="visually-hidden">Actions</span></th></tr></thead>
        <tbody>
          @for (o of store.offers(); track o.id) {
            <tr>
              <td><strong>{{ o.title }}</strong><br /><span class="small muted">{{ o.description }}</span></td>
              <td class="num">{{ o.validFrom ?? 'Now' }} → {{ o.validUntil ?? 'Open-ended' }}</td>
              <td>
                <span class="status" [class.status--converted]="current(o)" [class.status--closed]="!current(o)">
                  {{ current(o) ? 'Live' : o.active ? 'Scheduled / expired' : 'Inactive' }}
                </span>
              </td>
              <td class="num">
                <button type="button" class="btn btn--sm btn--outline" (click)="edit(o)">Edit</button>
                <button type="button" class="btn btn--sm btn--outline" (click)="remove(o)">Delete</button>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="4" class="muted">No offers yet.</td></tr>
          }
        </tbody>
      </table>
    </div>

    <form class="admin-fieldset" [formGroup]="form" (ngSubmit)="save()" novalidate>
      <legend>{{ editingId() ? 'Edit offer' : 'Add offer' }}</legend>
      <div class="field">
        <label class="field__label" for="of-title">Title</label>
        <input id="of-title" class="input" formControlName="title" />
      </div>
      <div class="field">
        <label class="field__label" for="of-desc">Description</label>
        <textarea id="of-desc" class="textarea" rows="3" formControlName="description"></textarea>
      </div>
      <div class="form-grid">
        <div class="field">
          <label class="field__label" for="of-from">Valid from <span class="field__optional">(optional)</span></label>
          <input id="of-from" class="input" type="date" formControlName="validFrom" />
        </div>
        <div class="field">
          <label class="field__label" for="of-until">Valid until <span class="field__optional">(optional)</span></label>
          <input id="of-until" class="input" type="date" formControlName="validUntil" />
        </div>
      </div>
      <fieldset class="choice-group">
        <legend class="field__label">Branches (none selected = all branches)</legend>
        <div class="choice-row">
          @for (b of branches.active(); track b.id) {
            <label class="check">
              <input type="checkbox" [checked]="selectedBranches().includes(b.id)" (change)="toggleBranch(b.id)" />
              {{ b.name }}
            </label>
          }
        </div>
      </fieldset>
      <div class="field">
        <label class="field__label" for="of-terms">Terms <span class="field__optional">(optional)</span></label>
        <input id="of-terms" class="input" formControlName="terms" />
      </div>
      <label class="check"><input type="checkbox" formControlName="active" /> Active</label>
      @if (dateError()) {
        <p class="field__error">“Valid until” must be on or after “Valid from”.</p>
      }
      <div class="btn-row">
        <button type="submit" class="btn btn--sm" [disabled]="form.invalid">Save offer</button>
        @if (editingId()) {
          <button type="button" class="btn btn--sm btn--outline" (click)="cancel()">Cancel</button>
        }
      </div>
    </form>
  `,
})
export class AdminOffersPage {
  protected readonly store = inject(ContentStore);
  protected readonly branches = inject(BranchService);
  private readonly fb = inject(FormBuilder);
  protected readonly editingId = signal<string | null>(null);
  protected readonly selectedBranches = signal<string[]>([]);
  protected readonly dateError = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(80)]],
    description: ['', [Validators.required, Validators.maxLength(400)]],
    validFrom: [''],
    validUntil: [''],
    terms: ['', Validators.maxLength(300)],
    active: [true],
  });

  protected readonly currentCount = computed(() => this.store.offers().filter((o) => isOfferCurrent(o)).length);

  protected current(o: Offer): boolean {
    return isOfferCurrent(o);
  }

  protected toggleBranch(id: string): void {
    this.selectedBranches.update((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
  }

  protected edit(o: Offer): void {
    this.editingId.set(o.id);
    this.selectedBranches.set([...o.branchIds]);
    this.form.setValue({
      title: o.title,
      description: o.description,
      validFrom: o.validFrom ?? '',
      validUntil: o.validUntil ?? '',
      terms: o.terms ?? '',
      active: o.active,
    });
  }

  protected cancel(): void {
    this.editingId.set(null);
    this.selectedBranches.set([]);
    this.form.reset();
  }

  protected save(): void {
    const v = this.form.getRawValue();
    this.dateError.set(!!v.validFrom && !!v.validUntil && v.validUntil < v.validFrom);
    if (this.form.invalid || this.dateError()) return;
    this.store.saveOffer({
      id: this.editingId() ?? createId('offer'),
      title: v.title.trim(),
      description: v.description.trim(),
      validFrom: v.validFrom || null,
      validUntil: v.validUntil || null,
      branchIds: this.selectedBranches(),
      terms: v.terms.trim() || null,
      active: v.active,
    });
    this.cancel();
  }

  protected remove(o: Offer): void {
    if (confirm(`Delete offer “${o.title}”?`)) this.store.deleteOffer(o.id);
  }
}
