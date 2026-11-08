import { Injectable, computed, inject, signal } from '@angular/core';
import { BRANCHES } from '../data/branches.data';
import { CATEGORIES } from '../data/categories.data';
import { OFFERS } from '../data/offers.data';
import { PRODUCTS } from '../data/products.data';
import { SITE_CONFIG, SiteSettings } from '../config/site.config';
import { Branch } from '../models/branch.model';
import { Offer } from '../models/offer.model';
import { Category, Product } from '../models/product.model';
import { BrowserStorage } from '../services/browser-storage.service';
import { deepClone } from '../utils/ids';

const STORAGE_KEY = 'se.admin-prototype.content.v1';

export interface ContentSnapshot {
  version: 1;
  savedAt: string;
  products: Product[];
  categories: Category[];
  branches: Branch[];
  offers: Offer[];
  settings: SiteSettings;
}

/**
 * Single source of truth for editable site content.
 *
 * Seeded from the typed data files in core/data. The admin PROTOTYPE can edit
 * it; edits are persisted to this browser's localStorage only. A production
 * setup would replace persistence with authenticated API calls — the public
 * services read through signals, so they need no change.
 */
@Injectable({ providedIn: 'root' })
export class ContentStore {
  private readonly storage = inject(BrowserStorage);

  private readonly _products = signal<Product[]>(deepClone(PRODUCTS));
  private readonly _categories = signal<Category[]>(deepClone(CATEGORIES));
  private readonly _branches = signal<Branch[]>(deepClone(BRANCHES));
  private readonly _offers = signal<Offer[]>(deepClone(OFFERS));
  private readonly _settings = signal<SiteSettings>(deepClone(SITE_CONFIG.defaults));
  private readonly _savedAt = signal<string | null>(null);

  readonly products = this._products.asReadonly();
  readonly categories = this._categories.asReadonly();
  readonly branches = this._branches.asReadonly();
  readonly offers = this._offers.asReadonly();
  readonly settings = this._settings.asReadonly();
  /** ISO time of the last locally saved prototype edit, or null if using defaults. */
  readonly localEditsSavedAt = this._savedAt.asReadonly();
  readonly hasLocalEdits = computed(() => this._savedAt() !== null);

  /** Applies prototype edits saved in this browser. Call after hydration. */
  loadLocalEdits(): void {
    const saved = this.storage.getJson<ContentSnapshot>(STORAGE_KEY);
    if (saved && isSnapshot(saved)) this.apply(saved);
  }

  saveProduct(product: Product): void {
    this._products.update((list) => upsert(list, product));
    this.persist();
  }

  deleteProduct(id: string): void {
    this._products.update((list) => list.filter((p) => p.id !== id));
    this.persist();
  }

  saveCategory(category: Category): void {
    this._categories.update((list) => upsert(list, category));
    this.persist();
  }

  /** Refuses to delete a category that still has products. */
  deleteCategory(id: string): boolean {
    if (this._products().some((p) => p.categoryId === id)) return false;
    this._categories.update((list) => list.filter((c) => c.id !== id));
    this.persist();
    return true;
  }

  saveBranch(branch: Branch): void {
    this._branches.update((list) => upsert(list, branch));
    this.persist();
  }

  saveOffer(offer: Offer): void {
    this._offers.update((list) => upsert(list, offer));
    this.persist();
  }

  deleteOffer(id: string): void {
    this._offers.update((list) => list.filter((o) => o.id !== id));
    this.persist();
  }

  saveSettings(settings: SiteSettings): void {
    this._settings.set(deepClone(settings));
    this.persist();
  }

  snapshot(): ContentSnapshot {
    return {
      version: 1,
      savedAt: new Date().toISOString(),
      products: this._products(),
      categories: this._categories(),
      branches: this._branches(),
      offers: this._offers(),
      settings: this._settings(),
    };
  }

  /** Imports a JSON snapshot (e.g. exported from another browser). */
  importSnapshot(json: string): { ok: true } | { ok: false; error: string } {
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      return { ok: false, error: 'The file is not valid JSON.' };
    }
    if (!isSnapshot(parsed)) return { ok: false, error: 'The file is not a Sweet Estate content export.' };
    this.apply(parsed);
    this.persist();
    return { ok: true };
  }

  resetToDefaults(): void {
    this._products.set(deepClone(PRODUCTS));
    this._categories.set(deepClone(CATEGORIES));
    this._branches.set(deepClone(BRANCHES));
    this._offers.set(deepClone(OFFERS));
    this._settings.set(deepClone(SITE_CONFIG.defaults));
    this._savedAt.set(null);
    this.storage.remove(STORAGE_KEY);
  }

  private apply(s: ContentSnapshot): void {
    this._products.set(s.products);
    this._categories.set(s.categories);
    this._branches.set(s.branches);
    this._offers.set(s.offers);
    this._settings.set(s.settings);
    this._savedAt.set(s.savedAt);
  }

  private persist(): void {
    const snap = this.snapshot();
    this.storage.setJson(STORAGE_KEY, snap);
    this._savedAt.set(snap.savedAt);
  }
}

function upsert<T extends { id: string }>(list: T[], item: T): T[] {
  const copy = deepClone(item);
  const index = list.findIndex((x) => x.id === item.id);
  if (index === -1) return [...list, copy];
  const next = [...list];
  next[index] = copy;
  return next;
}

function isSnapshot(value: unknown): value is ContentSnapshot {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<ContentSnapshot>;
  return (
    v.version === 1 &&
    typeof v.savedAt === 'string' &&
    Array.isArray(v.products) &&
    Array.isArray(v.categories) &&
    Array.isArray(v.branches) &&
    Array.isArray(v.offers) &&
    !!v.settings &&
    typeof v.settings === 'object'
  );
}
