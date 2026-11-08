import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnalyticsEvent, AnalyticsParams } from '../../core/services/analytics.service';
import { WhatsAppService } from '../../core/services/whatsapp.service';
import { TrackClickDirective } from '../directives/track-click.directive';
import { IconComponent } from './icon.component';

/**
 * WhatsApp button with a pre-filled message. When no valid WhatsApp number is
 * configured, renders a link to the contact form instead (never a broken link).
 */
@Component({
  selector: 'app-whatsapp-cta',
  imports: [RouterLink, IconComponent, TrackClickDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display:contents' },
  template: `
    @if (url(); as href) {
      <a
        [href]="href"
        target="_blank"
        rel="noopener noreferrer"
        [class]="'btn btn--whatsapp ' + extraClass()"
        [appTrack]="event()"
        [trackParams]="params()"
      >
        <app-icon name="chat" />
        {{ label() }}
        <span class="visually-hidden">(opens WhatsApp)</span>
      </a>
    } @else if (showFallback()) {
      <a [routerLink]="fallbackPath()" [queryParams]="fallbackQuery()" [class]="'btn btn--outline ' + extraClass()">
        <app-icon name="mail" />
        {{ fallbackLabel() }}
      </a>
    }
  `,
})
export class WhatsAppCtaComponent {
  private readonly whatsapp = inject(WhatsAppService);

  readonly message = input.required<string>();
  readonly label = input('WhatsApp us');
  readonly event = input<AnalyticsEvent>('whatsapp_click');
  readonly params = input<AnalyticsParams>({});
  readonly extraClass = input('');
  readonly showFallback = input(true);
  readonly fallbackLabel = input('Send an enquiry');
  readonly fallbackPath = input('/contact');
  readonly fallbackQuery = input<Record<string, string> | null>(null);

  protected readonly url = computed(() => this.whatsapp.link(this.message()));
}
