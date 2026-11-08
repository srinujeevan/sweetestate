import { ChangeDetectionStrategy, Component, computed, effect, inject, input, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE_CONFIG } from '../../core/config/site.config';
import { AnalyticsService } from '../../core/services/analytics.service';
import { BranchService, directionsUrl, formatAddress } from '../../core/services/branch.service';
import { SeoService } from '../../core/services/seo.service';
import { branchJsonLd } from '../../core/services/structured-data';
import { WhatsAppMessages } from '../../core/services/whatsapp.service';
import { BranchCardComponent } from '../../shared/components/branch-card.component';
import { DeliveryLinksComponent } from '../../shared/components/delivery-links.component';
import { IconComponent } from '../../shared/components/icon.component';
import { PageHeroComponent } from '../../shared/components/page-hero.component';
import { WhatsAppCtaComponent } from '../../shared/components/whatsapp-cta.component';
import { TrackClickDirective } from '../../shared/directives/track-click.directive';

@Component({
  selector: 'app-branch-detail-page',
  imports: [
    RouterLink,
    PageHeroComponent,
    BranchCardComponent,
    DeliveryLinksComponent,
    WhatsAppCtaComponent,
    IconComponent,
    TrackClickDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './branch-detail.page.html',
  styles: `
    .branch { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: clamp(24px, 4vw, 48px); align-items: start; }
    @media (max-width: 860px) { .branch { grid-template-columns: 1fr; } }
    .branch__panel h2 { font-size: 1.375rem; }
    .branch__actions { display: grid; gap: 10px; }
    .branch__actions .btn { justify-content: flex-start; }
    .branch__order { margin-top: 28px; }
    .branch__order h2 { font-size: 1.25rem; }
    .hero-actions { margin-top: 24px; }
  `,
})
export class BranchDetailPage {
  private readonly branchService = inject(BranchService);
  private readonly seo = inject(SeoService);
  private readonly analytics = inject(AnalyticsService);
  protected readonly site = SITE_CONFIG;

  readonly slug = input.required<string>();

  protected readonly branch = computed(() => this.branchService.bySlug(this.slug()));
  protected readonly address = computed(() => {
    const a = this.branch()?.address;
    return a ? formatAddress(a) : null;
  });
  protected readonly directions = computed(() => {
    const b = this.branch();
    return b ? directionsUrl(b) : null;
  });
  protected readonly whatsappMessage = computed(() => {
    const b = this.branch();
    return b ? WhatsAppMessages.branch(b) : WhatsAppMessages.general();
  });
  protected readonly others = computed(() => this.branchService.active().filter((b) => b.slug !== this.slug()));

  constructor() {
    effect(() => {
      const b = this.branch();
      const slug = this.slug();
      untracked(() => {
        if (!b) {
          this.seo.update({ title: 'Branch not found', description: 'This branch could not be found.', noindex: true });
          return;
        }
        const parts = [
          `Sweet Estate ${b.name} branch, ${SITE_CONFIG.city}.`,
          b.address ? `Address: ${formatAddress(b.address)}.` : '',
          b.hours ? `Open ${b.hours.summary}.` : '',
          b.phone ? `Call ${b.phone.display}.` : '',
        ];
        this.seo.update({
          title: `${b.name} Branch — Sweets & Bakery`,
          description: parts.filter(Boolean).join(' ').slice(0, 300),
          path: `/branches/${slug}`,
        });
        this.seo.setJsonLd('branch', branchJsonLd(b));
        this.analytics.track('branch_view', { branch: b.id });
      });
    });
  }
}
