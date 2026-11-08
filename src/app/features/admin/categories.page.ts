import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category, CategoryGroup } from '../../core/models/product.model';
import { ContentStore } from '../../core/state/content.store';
import { slugify } from '../../core/utils/ids';

@Component({
  selector: 'app-admin-categories',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-head">
      <div>
        <h1>Categories</h1>
        <p>“Sweets” categories appear in the sweets menu; “Bakery &amp; food” categories on the Bakery &amp; Food page.</p>
      </div>
    </div>

    @if (message()) {
      <div class="notice flash" role="status">{{ message() }}</div>
    }

    <div class="admin-table-wrap" style="margin-bottom: 28px">
      <table class="admin-table">
        <thead><tr><th>Order</th><th>Name</th><th>Group</th><th>Products</th><th><span class="visually-hidden">Actions</span></th></tr></thead>
        <tbody>
          @for (c of sorted(); track c.id) {
            <tr>
              <td>{{ c.sortOrder }}</td>
              <td><strong>{{ c.name }}</strong><br /><span class="small muted">{{ c.description }}</span></td>
              <td>{{ c.group === 'sweets' ? 'Sweets' : 'Bakery & food' }}</td>
              <td>{{ counts()[c.id] || 0 }}</td>
              <td class="num">
                <button type="button" class="btn btn--sm btn--outline" (click)="edit(c)">Edit</button>
                <button type="button" class="btn btn--sm btn--outline" (click)="remove(c)">Delete</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    <form class="admin-fieldset" [formGroup]="form" (ngSubmit)="save()" novalidate>
      <legend>{{ editingId() ? 'Edit category' : 'Add category' }}</legend>
      <div class="form-grid">
        <div class="field">
          <label class="field__label" for="cat-name">Name</label>
          <input id="cat-name" class="input" formControlName="name" />
        </div>
        <div class="field">
          <label class="field__label" for="cat-group">Group</label>
          <select id="cat-group" class="select" formControlName="group">
            <option value="sweets">Sweets</option>
            <option value="bakery-food">Bakery &amp; food</option>
          </select>
        </div>
        <div class="field">
          <label class="field__label" for="cat-order">Sort order</label>
          <input id="cat-order" class="input" type="number" formControlName="sortOrder" />
        </div>
      </div>
      <div class="field">
        <label class="field__label" for="cat-desc">Description</label>
        <input id="cat-desc" class="input" formControlName="description" />
      </div>
      <div class="btn-row">
        <button type="submit" class="btn btn--sm" [disabled]="form.invalid">Save category</button>
        @if (editingId()) {
          <button type="button" class="btn btn--sm btn--outline" (click)="cancel()">Cancel</button>
        }
      </div>
    </form>
  `,
})
export class AdminCategoriesPage {
  private readonly store = inject(ContentStore);
  private readonly fb = inject(FormBuilder);
  protected readonly editingId = signal<string | null>(null);
  protected readonly message = signal<string | null>(null);

  protected readonly sorted = computed(() => [...this.store.categories()].sort((a, b) => a.sortOrder - b.sortOrder));
  protected readonly counts = computed(() => {
    const out: Record<string, number> = {};
    for (const p of this.store.products()) out[p.categoryId] = (out[p.categoryId] ?? 0) + 1;
    return out;
  });

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(60)]],
    description: ['', Validators.maxLength(200)],
    group: ['sweets' as CategoryGroup],
    sortOrder: [99],
  });

  protected edit(c: Category): void {
    this.editingId.set(c.id);
    this.form.setValue({ name: c.name, description: c.description, group: c.group, sortOrder: c.sortOrder });
  }

  protected cancel(): void {
    this.editingId.set(null);
    this.form.reset();
  }

  protected save(): void {
    const v = this.form.getRawValue();
    const id = this.editingId() ?? slugify(v.name);
    if (!this.editingId() && this.store.categories().some((c) => c.id === id)) {
      this.message.set('A category with that name already exists.');
      return;
    }
    this.store.saveCategory({ id, name: v.name.trim(), description: v.description.trim(), group: v.group, sortOrder: Number(v.sortOrder) || 0 });
    this.message.set(`Saved “${v.name}”.`);
    this.cancel();
  }

  protected remove(c: Category): void {
    if (!confirm(`Delete category “${c.name}”?`)) return;
    const ok = this.store.deleteCategory(c.id);
    this.message.set(ok ? `Deleted “${c.name}”.` : `“${c.name}” still has products. Move or delete them first.`);
  }
}
