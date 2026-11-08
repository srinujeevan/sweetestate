import { Injectable, computed, inject } from '@angular/core';
import { Category, Product } from '../models/product.model';
import { ContentStore } from '../state/content.store';

export type ProductSort = 'recommended' | 'name' | 'price-asc' | 'price-desc';

export const PRODUCT_SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
];

export interface ProductQuery {
  search?: string | null;
  categoryId?: string | null;
  sort?: ProductSort | null;
}

export function minPrice(product: Product): number {
  return product.variants.length ? Math.min(...product.variants.map((v) => v.price)) : 0;
}

/** Pure filter/sort used by the catalogue page (and unit tests). */
export function queryProducts(products: Product[], query: ProductQuery): Product[] {
  const term = (query.search ?? '').trim().toLowerCase();
  const filtered = products.filter(
    (p) =>
      (!query.categoryId || p.categoryId === query.categoryId) &&
      (!term || p.name.toLowerCase().includes(term) || p.shortDescription.toLowerCase().includes(term)),
  );
  const sorted = [...filtered];
  switch (query.sort ?? 'recommended') {
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'price-asc':
      sorted.sort((a, b) => minPrice(a) - minPrice(b) || a.name.localeCompare(b.name));
      break;
    case 'price-desc':
      sorted.sort((a, b) => minPrice(b) - minPrice(a) || a.name.localeCompare(b.name));
      break;
    default:
      sorted.sort((a, b) => Number(b.bestseller) - Number(a.bestseller) || a.sortOrder - b.sortOrder);
  }
  return sorted;
}

/** Read-only catalogue access for public pages. */
@Injectable({ providedIn: 'root' })
export class CatalogueService {
  private readonly store = inject(ContentStore);

  readonly products = computed(() =>
    this.store
      .products()
      .filter((p) => p.active)
      .sort((a, b) => a.sortOrder - b.sortOrder),
  );

  readonly categories = computed(() => [...this.store.categories()].sort((a, b) => a.sortOrder - b.sortOrder));

  readonly featured = computed(() => this.products().filter((p) => p.featured || p.bestseller));

  /** Number of active products per category id. */
  readonly countsByCategory = computed(() => {
    const counts: Record<string, number> = {};
    for (const p of this.products()) counts[p.categoryId] = (counts[p.categoryId] ?? 0) + 1;
    return counts;
  });

  bySlug(slug: string): Product | undefined {
    return this.products().find((p) => p.slug === slug);
  }

  category(id: string | null | undefined): Category | undefined {
    return id ? this.store.categories().find((c) => c.id === id) : undefined;
  }

  inCategory(categoryId: string): Product[] {
    return this.products().filter((p) => p.categoryId === categoryId);
  }

  related(product: Product, limit = 4): Product[] {
    const same = this.products().filter((p) => p.id !== product.id && p.categoryId === product.categoryId);
    const others = this.products().filter((p) => p.id !== product.id && p.categoryId !== product.categoryId);
    return [...same, ...others].slice(0, limit);
  }
}
