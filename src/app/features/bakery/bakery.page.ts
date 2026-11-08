import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogueService } from '../../core/services/catalogue.service';
import { WhatsAppMessages } from '../../core/services/whatsapp.service';
import { IconComponent, IconName } from '../../shared/components/icon.component';
import { PageHeroComponent } from '../../shared/components/page-hero.component';
import { ProductCardComponent } from '../../shared/components/product-card.component';
import { WhatsAppCtaComponent } from '../../shared/components/whatsapp-cta.component';

const ICONS: Record<string, IconName> = {
  bakery: 'store',
  'snacks-savouries': 'sparkle',
  beverages: 'heart',
  'gift-boxes': 'gift',
};

@Component({
  selector: 'app-bakery-page',
  imports: [RouterLink, PageHeroComponent, ProductCardComponent, WhatsAppCtaComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero
      title="Bakery & Food"
      eyebrow="Beyond sweets"
      lead="Fresh bakery treats, snacks, savouries, beverages and gift boxes are available at Sweet Estate branches. The selection varies by branch and day, so ask us what’s fresh today."
      [crumbs]="[{ label: 'Bakery & Food' }]"
    />

    <section class="section">
      <div class="container">
        <div class="food-grid">
          @for (c of categories(); track c.id) {
            <article class="food card" [id]="c.id">
              <span class="food__icon"><app-icon [name]="icon(c.id)" [size]="26" /></span>
              <h2>{{ c.name }}</h2>
              <p class="muted">{{ c.description }}</p>
              @if (catalogue.countsByCategory()[c.id]) {
                <div class="grid grid--products">
                  @for (p of catalogue.inCategory(c.id); track p.id) {
                    <app-product-card [product]="p" [showCategory]="false" />
                  }
                </div>
              } @else {
                <p class="food__status"><app-icon name="info" [size]="16" /> Menu not listed online yet</p>
                <div class="btn-row">
                  <app-whatsapp-cta
                    [message]="message(c.name)"
                    label="Ask what's available"
                    extraClass="btn--sm"
                    [params]="{ location: 'bakery_page', category: c.id }"
                    [fallbackQuery]="{ type: 'Product enquiry' }"
                    fallbackLabel="Ask what's available"
                  />
                  <a routerLink="/branches" class="btn btn--sm btn--outline">Visit a branch</a>
                </div>
              }
            </article>
          }
        </div>
      </div>
    </section>

    <section class="section section--ivory">
      <div class="container container--narrow text-center">
        <div class="ornament"><span></span></div>
        <h2>Looking for home foods?</h2>
        <p class="muted">Sunnundalu, Putharekulu, Ariselu, Pongadalu and more are listed with prices in our sweets menu.</p>
        <a routerLink="/sweets" [queryParams]="{ category: 'home-foods' }" class="btn">Browse home foods</a>
      </div>
    </section>
  `,
  styles: `
    .food-grid { display: grid; gap: 20px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr)); }
    .food { display: flex; flex-direction: column; gap: 4px; }
    .food h2 { font-size: 1.5rem; margin: 12px 0 4px; }
    .food__icon { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 50%; background: var(--c-primary-soft); color: var(--c-primary); }
    .food__status { display: inline-flex; gap: 6px; align-items: center; font-size: .875rem; font-weight: 600; color: var(--c-gold-text); margin: 4px 0 16px; }
    .food .btn-row { margin-top: auto; }
  `,
})
export class BakeryPage {
  protected readonly catalogue = inject(CatalogueService);
  protected readonly categories = computed(() =>
    this.catalogue.categories().filter((c) => c.group === 'bakery-food'),
  );

  protected icon(id: string): IconName {
    return ICONS[id] ?? 'store';
  }

  protected message(name: string): string {
    return WhatsAppMessages.category(name);
  }
}
