import { ChangeDetectionStrategy, Component } from '@angular/core';
import { STOCK_PHOTOS } from '../../core/data/stock-photos.data';
import { PageHeroComponent } from '../../shared/components/page-hero.component';

/** Attribution for licensed photos, as required by their Creative Commons licences. */
@Component({
  selector: 'app-image-credits-page',
  imports: [PageHeroComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero
      title="Image Credits"
      lead="Some photos on this website are representative images of Andhra sweets from Wikimedia Commons, used under Creative Commons licences. They are not photographs of Sweet Estate’s own products."
      [crumbs]="[{ label: 'Image Credits' }]"
    />
    <section class="section">
      <div class="container">
        <ul class="credits">
          @for (p of photos; track p.src) {
            <li class="credit">
              <img [src]="p.src" [alt]="p.alt" width="1200" height="900" loading="lazy" decoding="async" />
              <div>
                <p class="credit__title">{{ p.credit.title }}</p>
                <p class="small muted">
                  By {{ p.credit.author }} ·
                  <a [href]="p.credit.licenseUrl" target="_blank" rel="noopener noreferrer license">{{ p.credit.license }}</a>
                  · <a [href]="p.credit.sourceUrl" target="_blank" rel="noopener noreferrer">Source</a>
                </p>
              </div>
            </li>
          }
        </ul>
        <p class="small muted" style="margin-top: 28px">
          Images were resized for the web. Under the ShareAlike terms, these resized copies carry the same licence as
          the originals.
        </p>
      </div>
    </section>
  `,
  styles: `
    .credits { list-style: none; margin: 0; padding: 0; display: grid; gap: 20px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr)); }
    .credit { background: var(--c-ivory); border: 1px solid var(--c-border); border-radius: var(--radius); overflow: hidden; }
    .credit img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; }
    .credit > div { padding: 14px 16px; }
    .credit p { margin: 0; }
    .credit__title { font-weight: 700; color: var(--c-primary-dark); margin-bottom: 4px !important; }
  `,
})
export class ImageCreditsPage {
  protected readonly photos = Object.values(STOCK_PHOTOS);
}
