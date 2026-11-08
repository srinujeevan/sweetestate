import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Branch } from '../../core/models/branch.model';
import { verifiedDeliveryUrl } from '../../core/services/branch.service';
import { TrackClickDirective } from '../directives/track-click.directive';
import { IconComponent } from './icon.component';

/** Swiggy / Zomato buttons for one branch — only verified, configured URLs are linked. */
@Component({
  selector: 'app-delivery-links',
  imports: [IconComponent, TrackClickDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dl">
      @for (p of platforms(); track p.key) {
        @if (p.url) {
          <a
            class="btn btn--sm btn--outline"
            [href]="p.url"
            target="_blank"
            rel="noopener noreferrer"
            [appTrack]="p.event"
            [trackParams]="{ branch: branch().id }"
          >
            Order on {{ p.label }} <app-icon name="external" [size]="16" />
            <span class="visually-hidden">(opens {{ p.label }})</span>
          </a>
        } @else {
          <span class="dl__pending"><strong>{{ p.label }}:</strong> ordering link will be available soon</span>
        }
      }
    </div>
  `,
  styles: `
    .dl { display: flex; flex-wrap: wrap; gap: 8px 12px; align-items: center; }
    .dl__pending { display: inline-flex; align-items: center; min-height: 38px; padding: 6px 12px; border-radius: 999px; background: var(--c-sand); color: var(--c-muted); font-size: .875rem; }
    .dl__pending strong { color: var(--c-ink); margin-right: 4px; }
  `,
})
export class DeliveryLinksComponent {
  readonly branch = input.required<Branch>();

  protected readonly platforms = computed(() => {
    const links = this.branch().deliveryLinks;
    return [
      { key: 'swiggy', label: 'Swiggy', event: 'swiggy_click' as const, url: verifiedDeliveryUrl('swiggy', links.swiggy) },
      { key: 'zomato', label: 'Zomato', event: 'zomato_click' as const, url: verifiedDeliveryUrl('zomato', links.zomato) },
    ];
  });
}
