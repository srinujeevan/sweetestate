import { Injectable, computed, inject, signal } from '@angular/core';
import { EnquiryPayload, LEAD_STATUSES, Lead, LeadStatus } from '../models/enquiry.model';
import { BrowserStorage } from '../services/browser-storage.service';
import { toCsv } from '../utils/csv';
import { createId } from '../utils/ids';

const STORAGE_KEY = 'se.admin-prototype.demo-leads.v1';

/**
 * DEMO lead storage for the admin prototype. Enquiries submitted while no API
 * is configured are kept in this browser only so the lead-management workflow
 * can be demonstrated. They never reach the business.
 */
@Injectable({ providedIn: 'root' })
export class DemoLeadStore {
  private readonly storage = inject(BrowserStorage);
  private readonly _leads = signal<Lead[]>([]);
  private loaded = false;

  readonly leads = computed(() => [...this._leads()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));

  readonly countsByStatus = computed(() => {
    const counts = Object.fromEntries(LEAD_STATUSES.map((s) => [s, 0])) as Record<LeadStatus, number>;
    for (const lead of this._leads()) counts[lead.status]++;
    return counts;
  });

  load(): void {
    if (this.loaded) return;
    this.loaded = true;
    const saved = this.storage.getJson<Lead[]>(STORAGE_KEY);
    if (Array.isArray(saved)) this._leads.set(saved);
  }

  add(payload: EnquiryPayload): Lead {
    this.load();
    const now = new Date().toISOString();
    const lead: Lead = {
      id: createId('lead'),
      createdAt: now,
      updatedAt: now,
      status: 'new',
      assignedBranchId: payload.preferredBranchId,
      assignedTo: null,
      notes: [],
      history: [{ at: now, change: 'Enquiry received (demo mode)' }],
      payload,
    };
    this._leads.update((list) => [lead, ...list]);
    this.persist();
    return lead;
  }

  byId(id: string): Lead | undefined {
    return this._leads().find((l) => l.id === id);
  }

  setStatus(id: string, status: LeadStatus): void {
    this.mutate(id, (lead, now) => {
      if (lead.status === status) return;
      lead.history.push({ at: now, change: `Status: ${lead.status} → ${status}` });
      lead.status = status;
    });
  }

  assign(id: string, branchId: string | null, assignedTo: string | null): void {
    this.mutate(id, (lead, now) => {
      lead.assignedBranchId = branchId;
      lead.assignedTo = assignedTo?.trim() || null;
      lead.history.push({
        at: now,
        change: `Assigned to ${lead.assignedTo ?? 'nobody'} (branch: ${branchId ?? 'none'})`,
      });
    });
  }

  addNote(id: string, text: string): void {
    const clean = text.trim().slice(0, 2000);
    if (!clean) return;
    this.mutate(id, (lead, now) => {
      lead.notes.push({ id: createId('note'), at: now, text: clean });
      lead.history.push({ at: now, change: 'Note added' });
    });
  }

  remove(id: string): void {
    this._leads.update((list) => list.filter((l) => l.id !== id));
    this.persist();
  }

  clear(): void {
    this._leads.set([]);
    this.persist();
  }

  toCsv(leads: Lead[] = this.leads()): string {
    const headers = [
      'id', 'created_at', 'updated_at', 'status', 'type', 'name', 'phone', 'email',
      'enquiry_type_or_occasion', 'event_date', 'quantity', 'preferred_products', 'fulfilment',
      'preferred_branch', 'location', 'message', 'assigned_branch', 'assigned_to', 'consent',
      'source_page', 'landing_page', 'utm', 'notes',
    ];
    const rows = leads.map((l) => {
      const p = l.payload;
      return [
        l.id, l.createdAt, l.updatedAt, l.status, p.kind, p.name, p.phone, p.email,
        p.kind === 'contact' ? p.enquiryType : p.occasion,
        p.kind === 'bulk' ? p.eventDate : '',
        p.kind === 'bulk' ? p.estimatedQuantity : '',
        p.kind === 'bulk' ? p.preferredProducts : '',
        p.kind === 'bulk' ? p.fulfilment : '',
        p.preferredBranchId,
        p.kind === 'bulk' ? p.location : '',
        p.message,
        l.assignedBranchId, l.assignedTo, p.consentToContact,
        p.meta.sourcePage, p.meta.landingPage,
        Object.entries(p.meta.utm).map(([k, v]) => `${k}=${v}`).join('; '),
        l.notes.map((n) => `[${n.at}] ${n.text}`).join(' | '),
      ];
    });
    return toCsv(headers, rows);
  }

  private mutate(id: string, fn: (lead: Lead, now: string) => void): void {
    const now = new Date().toISOString();
    this._leads.update((list) =>
      list.map((l) => {
        if (l.id !== id) return l;
        const copy: Lead = structuredClone(l);
        fn(copy, now);
        copy.updatedAt = now;
        return copy;
      }),
    );
    this.persist();
  }

  private persist(): void {
    this.storage.setJson(STORAGE_KEY, this._leads());
  }
}
