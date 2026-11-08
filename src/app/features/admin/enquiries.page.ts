import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LEAD_STATUSES, Lead } from '../../core/models/enquiry.model';
import { BranchService } from '../../core/services/branch.service';
import { DemoLeadStore } from '../../core/state/lead.store';
import { STATUS_LABELS, downloadText } from './admin-utils';

@Component({
  selector: 'app-admin-enquiries',
  imports: [RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-head">
      <div>
        <h1>Enquiries</h1>
        <p>{{ filtered().length }} of {{ leads.leads().length }} enquiries</p>
      </div>
      <button type="button" class="btn btn--sm" (click)="exportCsv()" [disabled]="!filtered().length">Export CSV</button>
    </div>

    @if (apiConfigured) {
      <div class="notice" role="note" style="margin-bottom: 16px">
        An enquiry API is configured, so new enquiries go to your backend. This prototype only lists demo enquiries
        stored in this browser; connect this screen to the backend’s authenticated lead API.
      </div>
    } @else {
      <div class="notice notice--demo" role="note" style="margin-bottom: 16px">
        Demo data: these enquiries were submitted on this browser while the site was in demo mode. They were not sent
        to the business.
      </div>
    }

    <div class="admin-filters">
      <div class="field">
        <label class="field__label" for="ae-search">Search name or phone</label>
        <input id="ae-search" class="input" #s (input)="term.set(s.value)" />
      </div>
      <div class="field">
        <label class="field__label" for="ae-status">Status</label>
        <select id="ae-status" class="select" #st (change)="statusFilter.set(st.value)">
          <option value="">All statuses</option>
          @for (s of statuses; track s) {
            <option [value]="s" [selected]="statusFilter() === s">{{ labels[s] }}</option>
          }
        </select>
      </div>
      <div class="field">
        <label class="field__label" for="ae-kind">Type</label>
        <select id="ae-kind" class="select" #k (change)="kind.set(k.value)">
          <option value="">All types</option>
          <option value="contact">Contact</option>
          <option value="bulk">Bulk order</option>
        </select>
      </div>
      <div class="field">
        <label class="field__label" for="ae-branch">Branch</label>
        <select id="ae-branch" class="select" #br (change)="branch.set(br.value)">
          <option value="">All branches</option>
          @for (b of branches.active(); track b.id) {
            <option [value]="b.id">{{ b.name }}</option>
          }
        </select>
      </div>
    </div>

    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr><th>Received</th><th>Name</th><th>Type</th><th>Branch</th><th>Status</th><th>Source</th><th><span class="visually-hidden">Actions</span></th></tr>
        </thead>
        <tbody>
          @for (l of filtered(); track l.id) {
            <tr>
              <td class="num">{{ l.createdAt | date: 'd MMM y, h:mm a' }}</td>
              <td><strong>{{ l.payload.name }}</strong><br /><span class="small muted">{{ l.payload.phone }}</span></td>
              <td>{{ l.payload.kind === 'bulk' ? 'Bulk: ' + l.payload.occasion : l.payload.enquiryType }}</td>
              <td>{{ branchName(l.assignedBranchId ?? l.payload.preferredBranchId) }}</td>
              <td><span class="status status--{{ l.status }}">{{ labels[l.status] }}</span></td>
              <td class="small">{{ l.payload.meta.utm['utm_source'] || l.payload.meta.sourcePage }}</td>
              <td><a [routerLink]="['/admin/enquiries', l.id]" class="btn btn--sm btn--outline">Open</a></td>
            </tr>
          } @empty {
            <tr>
              <td colspan="7" class="muted">
                No enquiries yet. Submit the contact or bulk-order form on the website to see the demo workflow.
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class AdminEnquiriesPage {
  protected readonly leads = inject(DemoLeadStore);
  protected readonly branches = inject(BranchService);
  protected readonly statuses = LEAD_STATUSES;
  protected readonly labels = STATUS_LABELS;
  protected readonly apiConfigured = !!environment.apiBaseUrl;

  /** Optional ?status= query param (from dashboard). */
  readonly status = input<string | undefined>();

  protected readonly term = signal('');
  protected readonly statusFilter = signal('');
  protected readonly kind = signal('');
  protected readonly branch = signal('');

  constructor() {
    effect(() => {
      const s = this.status();
      untracked(() => this.statusFilter.set(s ?? ''));
    });
  }

  protected readonly filtered = computed(() => {
    const t = this.term().trim().toLowerCase();
    return this.leads.leads().filter((l: Lead) => {
      const branchId = l.assignedBranchId ?? l.payload.preferredBranchId;
      return (
        (!this.statusFilter() || l.status === this.statusFilter()) &&
        (!this.kind() || l.payload.kind === this.kind()) &&
        (!this.branch() || branchId === this.branch()) &&
        (!t || l.payload.name.toLowerCase().includes(t) || l.payload.phone.includes(t))
      );
    });
  });

  protected branchName(id: string | null): string {
    return id ? (this.branches.byId(id)?.name ?? id) : '—';
  }

  protected exportCsv(): void {
    const stamp = new Date().toISOString().slice(0, 10);
    // BOM so Excel opens UTF-8 (₹, Telugu names) correctly.
    downloadText(`sweet-estate-enquiries-${stamp}.csv`, '﻿' + this.leads.toCsv(this.filtered()), 'text/csv;charset=utf-8');
  }
}
