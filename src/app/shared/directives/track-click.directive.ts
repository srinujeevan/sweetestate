import { Directive, inject, input } from '@angular/core';
import { AnalyticsEvent, AnalyticsParams, AnalyticsService } from '../../core/services/analytics.service';

/** Sends a conversion event on click: `<a appTrack="phone_click" [trackParams]="{ branch: 'x' }">`. */
@Directive({
  selector: '[appTrack]',
  host: { '(click)': 'onClick()' },
})
export class TrackClickDirective {
  private readonly analytics = inject(AnalyticsService);
  readonly appTrack = input.required<AnalyticsEvent>();
  readonly trackParams = input<AnalyticsParams>({});

  protected onClick(): void {
    this.analytics.track(this.appTrack(), this.trackParams());
  }
}
