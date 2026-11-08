import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE_CONFIG } from '../../core/config/site.config';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-price-note',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="notice" role="note">
      <app-icon name="info" class="notice__icon" />
      <p>{{ text }} Availability is not shown online.</p>
    </div>
  `,
})
export class PriceNoteComponent {
  protected readonly text = SITE_CONFIG.priceDisclaimer;
}
