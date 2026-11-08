import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section">
      <div class="container container--narrow text-center nf">
        <p class="nf__code" aria-hidden="true">404</p>
        <div class="ornament"><span></span></div>
        <h1>This page has gone the way of the last laddu</h1>
        <p class="muted">The page you were looking for doesn’t exist or may have moved.</p>
        <div class="btn-row nf__actions">
          <a routerLink="/" class="btn">Back to home</a>
          <a routerLink="/sweets" class="btn btn--outline">Browse sweets</a>
          <a routerLink="/branches" class="btn btn--outline">Find a branch</a>
        </div>
      </div>
    </section>
  `,
  styles: `
    .nf__code { font-family: var(--font-display); font-size: clamp(5rem, 16vw, 9rem); font-weight: 700; line-height: 1; color: var(--c-gold-soft); margin: 0 0 8px; }
    .nf h1 { font-size: clamp(1.75rem, 4vw, 2.5rem); }
    .nf__actions { justify-content: center; margin-top: 28px; }
  `,
})
export class NotFoundPage {}
