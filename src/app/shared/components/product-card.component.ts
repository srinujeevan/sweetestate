import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/models/product.model';
import { CatalogueService } from '../../core/services/catalogue.service';
import { ProductVisualComponent } from './product-visual.component';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, ProductVisualComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="pcard">
      <app-product-visual [product]="product()" />
      <div class="pcard__body">
        <div class="pcard__badges">
          @if (product().bestseller) {
            <span class="badge badge--gold">Bestseller</span>
          }
          @if (product().vegetarian) {
            <span class="badge badge--veg"><span class="veg-mark" aria-hidden="true"></span>Veg</span>
          }
        </div>
        <h3 class="pcard__title">
          <a [routerLink]="['/sweets', product().slug]" class="pcard__link">{{ product().name }}</a>
        </h3>
        @if (categoryName()) {
          <p class="pcard__cat">{{ categoryName() }}</p>
        }
        <ul class="pcard__variants" aria-label="Packs and indicative prices">
          @for (v of product().variants; track v.id) {
            <li>
              <span>{{ v.label }}</span>
              <strong>₹{{ v.price }}</strong>
            </li>
          }
        </ul>
        <span class="pcard__more" aria-hidden="true">View details →</span>
      </div>
    </article>
  `,
  styles: `
    :host { display: block; }
    .pcard { position: relative; height: 100%; display: flex; flex-direction: column; background: var(--c-ivory); border: 1px solid var(--c-border); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-sm); transition: box-shadow .2s ease, transform .2s ease, border-color .2s ease; }
    .pcard:hover { box-shadow: var(--shadow); transform: translateY(-3px); border-color: var(--c-border-strong); }
    .pcard:focus-within { box-shadow: var(--focus); }
    .pcard__body { display: flex; flex-direction: column; flex: 1; padding: 18px 18px 20px; }
    .pcard__badges { display: flex; gap: 6px; flex-wrap: wrap; min-height: 26px; margin-bottom: 10px; }
    .pcard__title { font-size: 1.25rem; margin: 0; }
    .pcard__link { color: var(--c-primary-dark); text-decoration: none; }
    .pcard__link:focus-visible { box-shadow: none; }
    .pcard__link::after { content: ''; position: absolute; inset: 0; z-index: 1; }
    .pcard__cat { margin: 4px 0 0; font-size: .875rem; color: var(--c-muted); }
    .pcard__variants { list-style: none; padding: 12px 0 0; margin: 12px 0 0; border-top: 1px dashed var(--c-border-strong); display: grid; gap: 6px; }
    .pcard__variants li { display: flex; justify-content: space-between; gap: 12px; font-size: .9688rem; }
    .pcard__variants strong { color: var(--c-primary); font-size: 1.0625rem; }
    .pcard__more { margin-top: auto; padding-top: 14px; font-weight: 600; font-size: .9375rem; color: var(--c-primary); }
  `,
})
export class ProductCardComponent {
  private readonly catalogue = inject(CatalogueService);
  readonly product = input.required<Product>();
  readonly showCategory = input(true);
  protected readonly categoryName = computed(() =>
    this.showCategory() ? this.catalogue.category(this.product().categoryId)?.name : null,
  );
}
