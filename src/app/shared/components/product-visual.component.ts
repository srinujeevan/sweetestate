import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Product } from '../../core/models/product.model';

const PALETTES = [
  ['#b35300', '#ffead2'],
  ['#9a4a00', '#fff1dc'],
  ['#8a3e00', '#fed6a8'],
  ['#c25a12', '#fdf5ea'],
  ['#7a4300', '#fde8d2'],
];

/**
 * Product image, or a decorative mithai-box pattern with the product's initials
 * when no photo exists. Stock photos are always tagged "Representative photo"
 * so they are never presented as the shop's actual product.
 */
@Component({
  selector: 'app-product-visual',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (product().image; as img) {
      <img
        [src]="img.src"
        [alt]="img.alt"
        loading="lazy"
        decoding="async"
        width="600"
        height="450"
        [attr.data-placeholder]="img.isPlaceholder || null"
      />
      @if (img.isPlaceholder) {
        <span class="tag">Representative photo</span>
      }
    } @else {
      <div class="pattern" [style.--fg]="palette()[0]" [style.--bg]="palette()[1]" aria-hidden="true">
        <span class="pattern__mono"><span>{{ initials() }}</span></span>
      </div>
    }
  `,
  styles: `
    :host { position: relative; display: block; aspect-ratio: 4 / 3; overflow: hidden; background: var(--c-sand); }
    img { width: 100%; height: 100%; object-fit: cover; }
    .tag { position: absolute; left: 10px; bottom: 10px; padding: 2px 8px; border-radius: 999px; background: rgb(46 36 20 / .72); color: #fff; font-size: .6875rem; font-weight: 600; letter-spacing: .02em; }
    .pattern {
      position: relative; width: 100%; height: 100%; display: grid; place-items: center; background-color: var(--bg);
      background-image:
        radial-gradient(circle at 50% 50%, transparent 0 9px, color-mix(in srgb, var(--fg) 14%, transparent) 9px 10px, transparent 10px),
        linear-gradient(45deg, color-mix(in srgb, var(--fg) 7%, transparent) 25%, transparent 25% 75%, color-mix(in srgb, var(--fg) 7%, transparent) 75%),
        linear-gradient(45deg, color-mix(in srgb, var(--fg) 7%, transparent) 25%, transparent 25% 75%, color-mix(in srgb, var(--fg) 7%, transparent) 75%);
      background-size: 28px 28px, 28px 28px, 28px 28px;
      background-position: 0 0, 0 0, 14px 14px;
    }
    .pattern::before { content: ''; position: absolute; inset: 14px; border: 1.5px solid color-mix(in srgb, var(--fg) 35%, transparent); border-radius: 6px; }
    .pattern__mono {
      width: 84px; height: 84px; display: grid; place-items: center; transform: rotate(45deg);
      background: var(--bg); border: 2px solid var(--fg); box-shadow: 0 0 0 6px var(--bg), 0 0 0 7px color-mix(in srgb, var(--fg) 40%, transparent);
      font-family: var(--font-display); font-weight: 700; font-size: 1.6rem; color: var(--fg);
    }
    .pattern__mono span { transform: rotate(-45deg); }
  `,
  host: { '[class.has-image]': '!!product().image' },
})
export class ProductVisualComponent {
  readonly product = input.required<Product>();

  protected readonly initials = computed(() =>
    this.product()
      .name.split(/\s+/)
      .filter((w) => w.length > 2 || this.product().name.split(/\s+/).length === 1)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase(),
  );

  protected readonly palette = computed(() => {
    const id = this.product().id;
    let hash = 0;
    for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
    return PALETTES[hash % PALETTES.length];
  });
}
