import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LEAD_STATUSES, LeadStatus } from '../../core/models/enquiry.model';
import { BranchService } from '../../core/services/branch.service';
import { DemoLeadStore } from '../../core/state/lead.store';
import { STATUS_LABELS } from './admin-utils';

@Component({
  selector: 'app-admin-enquiry-detail',
  imports: [RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-head">
      <div>
        <h1>Enquiry</h1>
        <p><a routerLink="/admin/enquiries">← All enquiries</a></p>
      </div>
      @if (lead()) {
        <button type="button" class="btn btn--sm btn--outline" (click)="remove()">Delete</button>
      }
    </div>

    @if (lead(); as l) {
      <div class="grid grid--2">
        <section class="card">
          <h2>{{ l.payload.name }}</h2>
          <dl class="kv">
            <dt>Phone</dt><dd><a [href]="'tel:' + l.payload.phone">{{ l.payload.phone }}</a></dd>
            <dt>Email</dt><dd>{{ l.payload.email ?? '—' }}</dd>
            <dt>Type</dt><dd>{{ l.payload.kind === 'bulk' ? 'Bulk order' : 'Contact' }}</dd>
            @if (l.payload.kind === 'contact') {
              <dt>Enquiry</dt><dd>{{ l.payload.enquiryType }}</dd>
            } @else {
              <dt>Occasion</dt><dd>{{ l.payload.occasion }}</dd>
              <dt>Event date</dt><dd>{{ l.payload.eventDate | date: 'd MMM y' }}</dd>
              <dt>Quantity</dt><dd>{{ l.payload.estimatedQuantity }}</dd>
              <dt>Products</dt><dd>{{ l.payload.preferredProducts ?? '—' }}</dd>
              <dt>Fulfilment</dt><dd>{{ l.payload.fulfilment }}</dd>
              <dt>Location</dt><dd>{{ l.payload.location ?? '—' }}</dd>
            }
            <dt>Preferred branch</dt><dd>{{ branchName(l.payload.preferredBranchId) }}</dd>
            <dt>Message</dt><dd class="pre">{{ l.payload.message ?? '—' }}</dd>
            <dt>Consent to contact</dt><dd>{{ l.payload.consentToContact ? 'Yes' : 'No' }}</dd>
            <dt>Received</dt><dd>{{ l.createdAt | date: 'd MMM y, h:mm:ss a' }}</dd>
            <dt>Last updated</dt><dd>{{ l.updatedAt | date: 'd MMM y, h:mm:ss a' }}</dd>
            <dt>Source page</dt><dd>{{ l.payload.meta.sourcePage }}</dd>
            <dt>Landing page</dt><dd>{{ l.payload.meta.landingPage ?? '—' }}</dd>
            <dt>Campaign</dt><dd>{{ utm() || '—' }}</dd>
          </dl>
        </section>

        <div class="stack">
          <section class="card">
            <h2>Status &amp; assignment</h2>
            <div class="form">
              <div class="field">
                <label class="field__label" for="ed-status">Status</label>
                <select id="ed-status" class="select" #st (change)="setStatus(st.value)">
                  @for (s of statuses; track s) {
                    <option [value]="s" [selected]="l.status === s">{{ labels[s] }}</option>
                  }
                </select>
              </div>
              <div class="field">
                <label class="field__label" for="ed-branch">Assigned branch</label>
                <select id="ed-branch" class="select" #br>
                  <option value="">None</option>
                  @for (b of branches.active(); track b.id) {
                    <option [value]="b.id" [selected]="l.assignedBranchId === b.id">{{ b.name }}</option>
                  }
                </select>
              </div>
              <div class="field">
                <label class="field__label" for="ed-staff">Assigned staff member</label>
                <input id="ed-staff" class="input" #staff [value]="l.assignedTo ?? ''" maxlength="60" />
              </div>
              <div><button type="button" class="btn btn--sm" (click)="assign(br.value, staff.value)">Save assignment</button></div>
            </div>
          </section>

          <section class="card">
            <h2>Internal notes</h2>
            @for (n of l.notes; track n.id) {
              <div class="note">
                <p class="small muted">{{ n.at | date: 'd MMM y, h:mm a' }}</p>
                <p class="pre">{{ n.text }}</p>
              </div>
            } @empty {
              <p class="muted small">No notes yet.</p>
            }
            <div class="field">
              <label class="field__label" for="ed-note">Add note</label>
              <textarea id="ed-note" class="textarea" rows="3" #note maxlength="2000"></textarea>
            </div>
            <button type="button" class="btn btn--sm" style="margin-top: 10px" (click)="addNote(note)">Add note</button>
          </section>

          <section class="card card--flat">
            <h2>History</h2>
            <ul class="checklist">
              @for (h of l.history; track $index) {
                <li><span class="muted small">{{ h.at | date: 'd MMM, h:mm a' }}</span> {{ h.change }}</li>
              }
            </ul>
          </section>
        </div>
      </div>
    } @else {
      <div class="notice notice--error">Enquiry not found.</div>
    }
  `,
  styles: `
    .kv { display: grid; grid-template-columns: max-content 1fr; gap: 8px 16px; margin: 0; font-size: .9688rem; }
    .kv dt { color: var(--c-muted); font-weight: 600; }
    .kv dd { margin: 0; overflow-wrap: anywhere; }
    .pre { white-space: pre-wrap; }
    .note { border-bottom: 1px dashed var(--c-border); padding-bottom: 8px; margin-bottom: 12px; }
    .note p { margin: 0; }
  `,
})
export class AdminEnquiryDetailPage {
  private readonly leads = inject(DemoLeadStore);
  private readonly router = inject(Router);
  protected readonly branches = inject(BranchService);
  protected readonly statuses = LEAD_STATUSES;
  protected readonly labels = STATUS_LABELS;

  readonly id = input.required<string>();
  protected readonly lead = computed(() => this.leads.leads().find((l) => l.id === this.id()));
  protected readonly utm = computed(() =>
    Object.entries(this.lead()?.payload.meta.utm ?? {})
      .map(([k, v]) => `${k}=${v}`)
      .join(', '),
  );

  protected branchName(id: string | null): string {
    return id ? (this.branches.byId(id)?.name ?? id) : 'No preference';
  }

  protected setStatus(status: string): void {
    if ((LEAD_STATUSES as readonly string[]).includes(status)) this.leads.setStatus(this.id(), status as LeadStatus);
  }

  protected assign(branchId: string, staff: string): void {
    this.leads.assign(this.id(), branchId || null, staff);
  }

  protected addNote(el: HTMLTextAreaElement): void {
    this.leads.addNote(this.id(), el.value);
    el.value = '';
  }

  protected remove(): void {
    if (confirm('Delete this enquiry from the demo data?')) {
      this.leads.remove(this.id());
      this.router.navigate(['/admin/enquiries']);
    }
  }
}
