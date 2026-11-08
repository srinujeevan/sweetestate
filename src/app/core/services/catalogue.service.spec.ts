import { TestBed } from '@angular/core/testing';
import { PRODUCTS } from '../data/products.data';
import { CatalogueService, minPrice, queryProducts } from './catalogue.service';

describe('queryProducts', () => {
  it('filters by search term, case-insensitively', () => {
    const names = queryProducts(PRODUCTS, { search: 'ARISELU' }).map((p) => p.name);
    expect(names).toEqual(jasmine.arrayWithExactContents(['Ariselu Plain', 'Ariselu Nuvvu']));
  });

  it('filters by category', () => {
    const result = queryProducts(PRODUCTS, { categoryId: 'home-foods' });
    expect(result.length).toBe(10);
    expect(result.every((p) => p.categoryId === 'home-foods')).toBeTrue();
  });

  it('combines category and search', () => {
    const result = queryProducts(PRODUCTS, { categoryId: 'home-foods', search: 'putharekulu' });
    expect(result.length).toBe(3);
  });

  it('returns nothing for an unmatched search', () => {
    expect(queryProducts(PRODUCTS, { search: 'pizza' })).toEqual([]);
  });

  it('sorts by lowest price ascending and descending', () => {
    const asc = queryProducts(PRODUCTS, { sort: 'price-asc' });
    const desc = queryProducts(PRODUCTS, { sort: 'price-desc' });
    expect(asc[0].name).toBe('Mysore Pak'); // ₹15
    expect(minPrice(desc[0])).toBeGreaterThanOrEqual(minPrice(desc[desc.length - 1]));
  });

  it('sorts by name', () => {
    const names = queryProducts(PRODUCTS, { sort: 'name' }).map((p) => p.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it('puts bestsellers first in recommended order', () => {
    const result = queryProducts(PRODUCTS, { sort: 'recommended' });
    expect(result.slice(0, 5).every((p) => p.bestseller)).toBeTrue();
  });
});

describe('CatalogueService', () => {
  let service: CatalogueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CatalogueService);
  });

  it('exposes active products and finds by slug', () => {
    expect(service.products().length).toBe(15);
    expect(service.bySlug('chandrakala')?.variants.length).toBe(2);
    expect(service.bySlug('missing')).toBeUndefined();
  });

  it('counts products per category, leaving unlisted categories empty', () => {
    const counts = service.countsByCategory();
    expect(counts['home-foods']).toBe(10);
    expect(counts['bakery']).toBeUndefined();
  });

  it('features the bestsellers', () => {
    expect(service.featured().map((p) => p.id)).toContain('chandrakala');
  });
});
