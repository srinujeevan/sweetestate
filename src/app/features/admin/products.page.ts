import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentStore } from '../../core/state/content.store';

@Component({
  selector: 'app-admin-products',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-head">
      <div>
        <h1>Products</h1>
        <p>{{ store.products().length }} products · edit names, variants, prices and flags.</p>
      </div>
      <a routerLink="/admin/products/new" class="btn btn--sm">+ Add product</a>
    </div>

    <div class="admin-filters">
      <div class="field">
        <label class="field__label" for="ap-search">Search</label>
        <input id="ap-search" class="input" #s (input)="term.set(s.value)" />
      </div>
      <div class="field">
        <label class="field__label" for="ap-cat">Category</label>
        <select id="ap-cat" class="select" #c (change)="cat.set(c.value)">
          <option value="">All categories</option>
          @for (cat of store.categories(); track cat.id) {
            <option [value]="cat.id">{{ cat.name }}</option>
          }
        </select>
      </div>
    </div>

    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr><th>Product</th><th>Category</th><th>Packs &amp; prices (₹)</th><th>Flags</th><th><span class="visually-hidden">Actions</span></th></tr>
        </thead>
        <tbody>
          @for (p of rows(); track p.id) {
            <tr>
              <td><strong>{{ p.name }}</strong><br /><span class="small muted">/sweets/{{ p.slug }}</span></td>
              <td>{{ categoryName(p.categoryId) }}</td>
              <td class="num">
                @for (v of p.variants; track v.id) {
                  <div>{{ v.label }} — ₹{{ v.price }}</div>
                }
              </td>
              <td>
                @if (p.bestseller) { <span class="badge badge--gold">Bestseller</span> }
                @if (!p.active) { <span class="badge badge--muted">Hidden</span> }
              </td>
              <td><a [routerLink]="['/admin/products', p.id]" class="btn btn--sm btn--outline">Edit</a></td>
            </tr>
          } @empty {
            <tr><td colspan="5" class="muted">No products match.</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class AdminProductsPage {
  protected readonly store = inject(ContentStore);
  protected readonly term = signal('');
  protected readonly cat = signal('');

  protected readonly rows = computed(() => {
    const t = this.term().trim().toLowerCase();
    return [...this.store.products()]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .filter((p) => (!this.cat() || p.categoryId === this.cat()) && (!t || p.name.toLowerCase().includes(t)));
  });

  protected categoryName(id: string): string {
    return this.store.categories().find((c) => c.id === id)?.name ?? id;
  }
}
