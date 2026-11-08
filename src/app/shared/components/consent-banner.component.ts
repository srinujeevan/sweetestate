import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnalyticsService } from '../../core/services/analytics.service';

/** Shown only when GA4 is configured and the visitor hasn't decided yet. */
@Component({
  selector: 'app-consent-banner',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (analytics.needsConsentDecision()) {
      <section class="consent" role="region" aria-label="Analytics consent">
        <p>
          We'd like to use Google Analytics cookies to understand how the site is used. No analytics run unless you
          agree. <a routerLink="/privacy-policy">Privacy Policy</a>
        </p>
        <div class="btn-row">
          <button type="button" class="btn btn--sm" (click)="analytics.setConsent(true)">Allow analytics</button>
          <button type="button" class="btn btn--sm btn--outline" (click)="analytics.setConsent(false)">Decline</button>
        </div>
      </section>
    }
  `,
  styles: `
    .consent { position: fixed; left: 16px; bottom: 16px; z-index: 70; max-width: 440px; margin-right: 96px; background: var(--c-ivory); border: 1px solid var(--c-border); border-radius: var(--radius); box-shadow: var(--shadow); padding: 18px; font-size: .9375rem; }
    .consent p { margin-bottom: 12px; }
  `,
})
export class ConsentBannerComponent {
  protected readonly analytics = inject(AnalyticsService);
}
