import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductVariant } from '../../core/models/product.model';
import { AnalyticsService } from '../../core/services/analytics.service';
import { CatalogueService } from '../../core/services/catalogue.service';
import { SeoService, absoluteUrl } from '../../core/services/seo.service';
import { WhatsAppMessages } from '../../core/services/whatsapp.service';
import { PageHeroComponent } from '../../shared/components/page-hero.component';
import { PriceNoteComponent } from '../../shared/components/price-note.component';
import { ProductCardComponent } from '../../shared/components/product-card.component';
import { ProductVisualComponent } from '../../shared/components/product-visual.component';
import { WhatsAppCtaComponent } from '../../shared/components/whatsapp-cta.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-product-detail-page',
  imports: [
    RouterLink,
    PageHeroComponent,
    PriceNoteComponent,
    ProductCardComponent,
    ProductVisualComponent,
    WhatsAppCtaComponent,
    IconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-detail.page.html',
  styleUrl: './product-detail.page.scss',
})
export class ProductDetailPage {
  private readonly catalogue = inject(CatalogueService);
  private readonly seo = inject(SeoService);
  private readonly analytics = inject(AnalyticsService);

  /** Route param :slug */
  readonly slug = input.required<string>();

  protected readonly product = computed(() => this.catalogue.bySlug(this.slug()));
  protected readonly category = computed(() => this.catalogue.category(this.product()?.categoryId));
  protected readonly related = computed(() => {
    const p = this.product();
    return p ? this.catalogue.related(p) : [];
  });

  private readonly selectedId = signal<string | null>(null);
  protected readonly selected = computed<ProductVariant | null>(() => {
    const variants = this.product()?.variants ?? [];
    return variants.find((v) => v.id === this.selectedId()) ?? variants[0] ?? null;
  });

  protected readonly whatsappMessage = computed(() => {
    const p = this.product();
    return p ? WhatsAppMessages.product(p, this.selected()) : WhatsAppMessages.general();
  });

  protected readonly enquiryQuery = computed(() => {
    const p = this.product();
    const v = this.selected();
    return { type: 'Product enquiry', product: p ? `${p.name}${v ? ` (${v.label})` : ''}` : '' };
  });

  constructor() {
    effect(() => {
      const slug = this.slug();
      const p = this.product();
      untracked(() => {
        this.selectedId.set(null);
        if (!p) {
          this.seo.update({ title: 'Product not found', description: 'This product could not be found.', noindex: true });
          return;
        }
        const prices = p.variants.map((v) => `${v.label} ₹${v.price}`).join(', ');
        this.seo.update({
          title: `${p.name} — ${this.category()?.name ?? 'Sweets'}`,
          description: `${p.name} at Sweet Estate, Visakhapatnam. ${prices} (indicative). ${p.shortDescription}`.slice(0, 300),
          path: `/sweets/${slug}`,
        });
        this.seo.setJsonLd('breadcrumb', breadcrumbJsonLd(p.name, slug));
        this.analytics.track('product_view', { product: p.id });
      });
    });
  }

  protected select(id: string): void {
    this.selectedId.set(id);
  }
}

function breadcrumbJsonLd(name: string, slug: string): object | null {
  const home = absoluteUrl('/');
  if (!home) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: home },
      { '@type': 'ListItem', position: 2, name: 'Sweets', item: absoluteUrl('/sweets') },
      { '@type': 'ListItem', position: 3, name, item: absoluteUrl(`/sweets/${slug}`) },
    ],
  };
}
