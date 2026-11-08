import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Offer } from '../../core/models/offer.model';
import { BranchService } from '../../core/services/branch.service';
import { ContentStore } from '../../core/state/content.store';
import { IconComponent } from '../../shared/components/icon.component';
import { PageHeroComponent } from '../../shared/components/page-hero.component';

/** True when the offer is active and today falls within its dates. */
export function isOfferCurrent(offer: Offer, today: string = new Date().toISOString().slice(0, 10)): boolean {
  return (
    offer.active && (!offer.validFrom || offer.validFrom <= today) && (!offer.validUntil || offer.validUntil >= today)
  );
}

@Component({
  selector: 'app-offers-page',
  imports: [RouterLink, PageHeroComponent, IconComponent, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { ngSkipHydration: 'true' },
  template: `
    <app-page-hero
      title="Offers"
      eyebrow="Seasonal & festive"
      lead="Current offers from Sweet Estate. Please confirm at the branch before ordering."
      [crumbs]="[{ label: 'Offers' }]"
    />
    <section class="section">
      <div class="container">
        @if (current().length) {
          <div class="grid grid--cards">
            @for (o of current(); track o.id) {
              <article class="card offer">
                <span class="badge badge--gold"><app-icon name="tag" [size]="14" /> Offer</span>
                <h2>{{ o.title }}</h2>
                <p>{{ o.description }}</p>
                <p class="small muted">
                  @if (o.validUntil) {
                    Valid until {{ o.validUntil | date: 'd MMM y' }}.
                  }
                  {{ branchLabel(o) }}
                </p>
                @if (o.terms) {
                  <p class="small muted">{{ o.terms }}</p>
                }
              </article>
            }
          </div>
        } @else {
          <div class="empty-state">
            <app-icon name="gift" [size]="36" style="color: var(--c-gold); justify-content: center; width: 100%" />
            <h2>No offers running right now</h2>
            <p>Festive and seasonal offers will appear here. In the meantime, explore our sweets or plan a bulk order.</p>
            <div class="btn-row">
              <a routerLink="/sweets" class="btn">Explore sweets</a>
              <a routerLink="/bulk-orders" class="btn btn--outline">Bulk &amp; gifting</a>
            </div>
          </div>
        }
      </div>
    </section>
  `,
  styles: `
    .offer h2 { font-size: 1.375rem; margin: 12px 0 8px; }
  `,
})
export class OffersPage {
  private readonly store = inject(ContentStore);
  private readonly branches = inject(BranchService);
  protected readonly current = computed(() => this.store.offers().filter((o) => isOfferCurrent(o)));

  protected branchLabel(offer: Offer): string {
    if (!offer.branchIds.length) return 'At all branches.';
    const names = offer.branchIds.map((id) => this.branches.byId(id)?.name).filter(Boolean);
    return names.length ? `At ${names.join(', ')}.` : '';
  }
}
