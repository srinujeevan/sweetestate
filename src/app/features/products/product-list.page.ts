import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  CatalogueService,
  PRODUCT_SORT_OPTIONS,
  ProductSort,
  queryProducts,
} from '../../core/services/catalogue.service';
import { WhatsAppMessages } from '../../core/services/whatsapp.service';
import { IconComponent } from '../../shared/components/icon.component';
import { PageHeroComponent } from '../../shared/components/page-hero.component';
import { PriceNoteComponent } from '../../shared/components/price-note.component';
import { ProductCardComponent } from '../../shared/components/product-card.component';
import { WhatsAppCtaComponent } from '../../shared/components/whatsapp-cta.component';

const SORTS = PRODUCT_SORT_OPTIONS.map((o) => o.value);

@Component({
  selector: 'app-product-list-page',
  imports: [RouterLink, PageHeroComponent, ProductCardComponent, PriceNoteComponent, WhatsAppCtaComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Filters come from the URL, which prerendered HTML can't know — render fresh on the client.
  host: { ngSkipHydration: 'true' },
  templateUrl: './product-list.page.html',
  styleUrl: './product-list.page.scss',
})
export class ProductListPage {
  private readonly router = inject(Router);
  protected readonly catalogue = inject(CatalogueService);
  protected readonly sortOptions = PRODUCT_SORT_OPTIONS;

  /** Bound from query params: ?category=…&q=…&sort=… */
  readonly category = input<string | undefined>();
  readonly q = input<string | undefined>();
  readonly sort = input<string | undefined>();

  protected readonly activeCategory = computed(() => this.catalogue.category(this.category()) ?? null);
  protected readonly search = computed(() => (this.q() ?? '').slice(0, 60));
  protected readonly activeSort = computed<ProductSort>(() =>
    SORTS.includes(this.sort() as ProductSort) ? (this.sort() as ProductSort) : 'recommended',
  );

  protected readonly results = computed(() =>
    queryProducts(this.catalogue.products(), {
      search: this.search(),
      categoryId: this.activeCategory()?.id ?? null,
      sort: this.activeSort(),
    }),
  );

  protected readonly categoryIsUnlisted = computed(() => {
    const c = this.activeCategory();
    return !!c && !this.catalogue.countsByCategory()[c.id];
  });

  protected readonly categoryMessage = computed(() =>
    WhatsAppMessages.category(this.activeCategory()?.name ?? 'your range'),
  );

  protected setCategory(id: string | null): void {
    this.updateQuery({ category: id });
  }

  protected setSearch(value: string): void {
    this.updateQuery({ q: value.trim() || null });
  }

  protected setSort(value: string): void {
    this.updateQuery({ sort: value === 'recommended' ? null : value });
  }

  protected clearFilters(): void {
    this.router.navigate([], { queryParams: {}, replaceUrl: true });
  }

  private updateQuery(params: Record<string, string | null>): void {
    this.router.navigate([], { queryParams: params, queryParamsHandling: 'merge', replaceUrl: true });
  }
}
