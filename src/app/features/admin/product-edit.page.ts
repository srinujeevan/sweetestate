import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Product } from '../../core/models/product.model';
import { ContentStore } from '../../core/state/content.store';
import { createId, slugify } from '../../core/utils/ids';
import { IconComponent } from '../../shared/components/icon.component';

type Availability = 'unknown' | 'yes' | 'no';

@Component({
  selector: 'app-admin-product-edit',
  imports: [ReactiveFormsModule, RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-head">
      <div>
        <h1>{{ isNew() ? 'Add product' : 'Edit product' }}</h1>
        <p><a routerLink="/admin/products">← All products</a></p>
      </div>
      @if (!isNew()) {
        <button type="button" class="btn btn--sm btn--outline" (click)="remove()">Delete product</button>
      }
    </div>

    @if (notFound()) {
      <div class="notice notice--error">Product not found.</div>
    } @else {
      <form class="form" [formGroup]="form" (ngSubmit)="save()" novalidate>
        @if (error()) {
          <div class="notice notice--error" role="alert">{{ error() }}</div>
        }
        <fieldset class="admin-fieldset">
          <legend>Basics</legend>
          <div class="form-grid">
            <div class="field">
              <label class="field__label" for="pe-name">Name</label>
              <input id="pe-name" class="input" formControlName="name" (blur)="suggestSlug()" />
            </div>
            <div class="field">
              <label class="field__label" for="pe-slug">URL slug</label>
              <input id="pe-slug" class="input" formControlName="slug" />
              <p class="field__hint">Lowercase letters, numbers and dashes. Changing it changes the page URL.</p>
            </div>
            <div class="field">
              <label class="field__label" for="pe-cat">Category</label>
              <select id="pe-cat" class="select" formControlName="categoryId">
                @for (c of store.categories(); track c.id) {
                  <option [value]="c.id">{{ c.name }}</option>
                }
              </select>
            </div>
            <div class="field">
              <label class="field__label" for="pe-order">Sort order</label>
              <input id="pe-order" class="input" type="number" formControlName="sortOrder" />
            </div>
          </div>
          <div class="field">
            <label class="field__label" for="pe-desc">Short description</label>
            <textarea id="pe-desc" class="textarea" formControlName="shortDescription" rows="3"></textarea>
            <p class="field__hint">Do not add ingredient, allergen or health claims unless confirmed by the business.</p>
          </div>
          <div class="choice-row">
            <label class="check"><input type="checkbox" formControlName="bestseller" /> Bestseller</label>
            <label class="check"><input type="checkbox" formControlName="featured" /> Featured on home page</label>
            <label class="check"><input type="checkbox" formControlName="vegetarian" /> Vegetarian (confirmed)</label>
            <label class="check"><input type="checkbox" formControlName="active" /> Visible on website</label>
          </div>
        </fieldset>

        <fieldset class="admin-fieldset">
          <legend>Packs &amp; prices</legend>
          <div formArrayName="variants" class="stack">
            @for (v of variants.controls; track v; let i = $index) {
              <div class="variant-row" [formGroupName]="i">
                <div class="field">
                  <label class="field__label" [for]="'pv-label-' + i">Pack / unit</label>
                  <input [id]="'pv-label-' + i" class="input" formControlName="label" placeholder="e.g. 250 grams" />
                </div>
                <div class="field">
                  <label class="field__label" [for]="'pv-price-' + i">Price (₹)</label>
                  <input [id]="'pv-price-' + i" class="input" type="number" min="0" step="1" formControlName="price" />
                </div>
                <div class="field">
                  <label class="field__label" [for]="'pv-av-' + i">Availability</label>
                  <select [id]="'pv-av-' + i" class="select" formControlName="available">
                    <option value="unknown">Not shown</option>
                    <option value="yes">Available</option>
                    <option value="no">Unavailable</option>
                  </select>
                </div>
                <button type="button" class="icon-btn" (click)="removeVariant(i)" [disabled]="variants.length === 1">
                  <app-icon name="trash" [size]="18" /><span class="visually-hidden">Remove pack {{ i + 1 }}</span>
                </button>
              </div>
            }
          </div>
          <div><button type="button" class="btn btn--sm btn--outline" (click)="addVariant()">+ Add pack</button></div>
        </fieldset>

        <fieldset class="admin-fieldset">
          <legend>Image</legend>
          <div class="form-grid">
            <div class="field">
              <label class="field__label" for="pe-img">Image path</label>
              <input id="pe-img" class="input" formControlName="imageSrc" placeholder="images/products/name.webp" />
              <p class="field__hint">File in /public. Leave empty to show the decorative pattern.</p>
            </div>
            <div class="field">
              <label class="field__label" for="pe-alt">Alt text</label>
              <input id="pe-alt" class="input" formControlName="imageAlt" />
            </div>
          </div>
          <label class="check"><input type="checkbox" formControlName="imageIsPlaceholder" /> Representative photo, not Sweet Estate’s own product (shows a “Representative photo” tag)</label>
        </fieldset>

        <div class="btn-row">
          <button type="submit" class="btn">Save product</button>
          <a routerLink="/admin/products" class="btn btn--outline">Cancel</a>
        </div>
      </form>
    }
  `,
})
export class AdminProductEditPage {
  protected readonly store = inject(ContentStore);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly id = input.required<string>();
  protected readonly isNew = computed(() => this.id() === 'new');
  protected readonly existing = computed(() => this.store.products().find((p) => p.id === this.id()));
  protected readonly notFound = computed(() => !this.isNew() && !this.existing());
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
    categoryId: ['', Validators.required],
    shortDescription: ['', Validators.maxLength(300)],
    sortOrder: [100],
    bestseller: [false],
    featured: [false],
    vegetarian: [false],
    active: [true],
    imageSrc: [''],
    imageAlt: [''],
    imageIsPlaceholder: [true],
    variants: this.fb.array<FormGroup>([]),
  });

  protected get variants(): FormArray<FormGroup> {
    return this.form.controls.variants;
  }

  constructor() {
    effect(() => {
      const p = this.existing();
      const isNew = this.isNew();
      untracked(() => {
        this.variants.clear();
        if (p) {
          this.form.patchValue({
            name: p.name,
            slug: p.slug,
            categoryId: p.categoryId,
            shortDescription: p.shortDescription,
            sortOrder: p.sortOrder,
            bestseller: p.bestseller,
            featured: p.featured,
            vegetarian: p.vegetarian,
            active: p.active,
            imageSrc: p.image?.src ?? '',
            imageAlt: p.image?.alt ?? '',
            imageIsPlaceholder: p.image?.isPlaceholder ?? true,
          });
          p.variants.forEach((v) =>
            this.addVariant(v.id, v.label, v.price, v.available === null ? 'unknown' : v.available ? 'yes' : 'no'),
          );
        } else if (isNew) {
          this.form.patchValue({ categoryId: this.store.categories()[0]?.id ?? '', sortOrder: this.store.products().length + 1 });
          this.addVariant();
        }
      });
    });
  }

  protected addVariant(id = createId('v'), label = '', price: number | null = null, available: Availability = 'unknown'): void {
    this.variants.push(
      this.fb.nonNullable.group({
        id: [id],
        label: [label, [Validators.required, Validators.maxLength(40)]],
        price: [price as number | null, [Validators.required, Validators.min(0), Validators.max(100000)]],
        available: [available],
      }),
    );
  }

  protected removeVariant(index: number): void {
    if (this.variants.length > 1) this.variants.removeAt(index);
  }

  protected suggestSlug(): void {
    if (this.isNew() && !this.form.controls.slug.value) this.form.controls.slug.setValue(slugify(this.form.controls.name.value));
  }

  protected save(): void {
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Please complete all required fields: name, a valid slug, category, and a label and price for every pack.');
      return;
    }
    const v = this.form.getRawValue();
    const id = this.existing()?.id ?? v.slug;
    const clash = this.store.products().find((p) => p.slug === v.slug && p.id !== id);
    if (clash) {
      this.error.set(`The slug “${v.slug}” is already used by ${clash.name}.`);
      return;
    }
    const product: Product = {
      id,
      slug: v.slug,
      name: v.name.trim(),
      categoryId: v.categoryId,
      shortDescription: v.shortDescription.trim(),
      image: v.imageSrc.trim()
        ? {
            src: v.imageSrc.trim(),
            alt: v.imageAlt.trim() || v.name.trim(),
            isPlaceholder: v.imageIsPlaceholder,
            // Keep the licence credit only while the same licensed file is used.
            credit: this.existing()?.image?.src === v.imageSrc.trim() ? (this.existing()?.image?.credit ?? null) : null,
          }
        : null,
      variants: (v.variants as { id: string; label: string; price: number; available: Availability }[]).map((x) => ({
        id: x.id,
        label: x.label.trim(),
        price: Number(x.price),
        available: x.available === 'unknown' ? null : x.available === 'yes',
      })),
      bestseller: v.bestseller,
      featured: v.featured,
      vegetarian: v.vegetarian,
      active: v.active,
      sortOrder: Number(v.sortOrder) || 0,
    };
    this.store.saveProduct(product);
    this.router.navigate(['/admin/products']);
  }

  protected remove(): void {
    const p = this.existing();
    if (p && confirm(`Delete “${p.name}”? This only affects this browser’s prototype data.`)) {
      this.store.deleteProduct(p.id);
      this.router.navigate(['/admin/products']);
    }
  }
}
