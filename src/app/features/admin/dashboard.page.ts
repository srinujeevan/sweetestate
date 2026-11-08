import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { SITE_CONFIG } from '../../core/config/site.config';
import { verifiedDeliveryUrl } from '../../core/services/branch.service';
import { WhatsAppService } from '../../core/services/whatsapp.service';
import { ContentStore } from '../../core/state/content.store';
import { DemoLeadStore } from '../../core/state/lead.store';

interface CheckItem {
  label: string;
  done: boolean;
  where: string;
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-head">
      <div>
        <h1>Dashboard</h1>
        <p>Overview of enquiries, catalogue and launch readiness.</p>
      </div>
    </div>

    <div class="admin-stats">
      <a routerLink="/admin/enquiries" [queryParams]="{ status: 'new' }" class="admin-stat" style="text-decoration:none">
        <strong>{{ counts().new }}</strong><span>New enquiries</span>
      </a>
      <div class="admin-stat"><strong>{{ open() }}</strong><span>Open (new, contacted, qualified)</span></div>
      <div class="admin-stat"><strong>{{ counts().converted }}</strong><span>Converted</span></div>
      <div class="admin-stat"><strong>{{ activeProducts() }}</strong><span>Active products</span></div>
      <div class="admin-stat"><strong>{{ activeBranches() }} / {{ site.totalBranches }}</strong><span>Branches with details</span></div>
    </div>

    <div class="grid grid--2">
      <section class="card">
        <h2>Popular product views</h2>
        @if (gaConfigured) {
          <p class="muted">Product view data is collected in Google Analytics 4 (event <code>product_view</code>). View reports in GA4.</p>
        } @else {
          <p class="muted">
            Not available: Google Analytics 4 is not configured. Once a GA4 measurement ID is added, the site sends
            <code>product_view</code> events you can report on in GA4.
          </p>
        }
        <p class="small muted">Enquiries shown here are demo enquiries stored in this browser only.</p>
      </section>

      <section class="card">
        <h2>Launch checklist</h2>
        <ul class="checklist">
          @for (c of checklist(); track c.label) {
            <li>
              <span [class]="c.done ? 'ok' : 'todo'" aria-hidden="true">{{ c.done ? '✓' : '!' }}</span>
              <span>
                <span class="visually-hidden">{{ c.done ? 'Done:' : 'To do:' }}</span>
                {{ c.label }} <span class="muted small">— {{ c.where }}</span>
              </span>
            </li>
          }
        </ul>
      </section>
    </div>
  `,
})
export class AdminDashboardPage {
  private readonly store = inject(ContentStore);
  private readonly leads = inject(DemoLeadStore);
  private readonly whatsapp = inject(WhatsAppService);
  protected readonly site = SITE_CONFIG;
  protected readonly gaConfigured = !!environment.ga4MeasurementId;

  protected readonly counts = this.leads.countsByStatus;
  protected readonly open = computed(() => this.counts().new + this.counts().contacted + this.counts().qualified);
  protected readonly activeProducts = computed(() => this.store.products().filter((p) => p.active).length);
  protected readonly activeBranches = computed(() => this.store.branches().filter((b) => b.status === 'active').length);

  protected readonly checklist = computed<CheckItem[]>(() => {
    const branches = this.store.branches();
    const active = branches.filter((b) => b.status === 'active');
    const missingLinks = active.filter(
      (b) => !verifiedDeliveryUrl('swiggy', b.deliveryLinks.swiggy) || !verifiedDeliveryUrl('zomato', b.deliveryLinks.zomato),
    ).length;
    const missingContact = active.filter((b) => !b.phone || !b.hours).length;
    const noPhotos = this.store.products().filter((p) => !p.image || p.image.isPlaceholder).length;
    const social = Object.values(this.store.settings().social).some(Boolean);
    return [
      { label: `All ${SITE_CONFIG.totalBranches} branches have details`, done: active.length >= SITE_CONFIG.totalBranches, where: 'Branches' },
      { label: 'Every listed branch has phone and hours', done: missingContact === 0, where: `${missingContact} incomplete` },
      { label: 'Swiggy & Zomato links for each branch', done: missingLinks === 0, where: `${missingLinks} branches missing links` },
      { label: 'Central WhatsApp number configured', done: this.whatsapp.isConfigured(), where: 'Settings' },
      { label: 'Social media links', done: social, where: 'Settings' },
      { label: 'Real product photography', done: noPhotos === 0, where: `${noPhotos} products without photos` },
      { label: 'Production domain (siteUrl)', done: !!environment.siteUrl, where: 'environment.prod.ts' },
      { label: 'Enquiry API connected', done: !!environment.apiBaseUrl, where: 'environment.prod.ts + backend' },
      { label: 'Google Analytics 4 (optional)', done: !!environment.ga4MeasurementId, where: 'environment.prod.ts' },
      { label: 'Privacy Policy & Terms legally reviewed', done: false, where: 'Legal pages' },
    ];
  });
}
