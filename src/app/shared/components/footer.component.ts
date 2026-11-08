import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE_CONFIG } from '../../core/config/site.config';
import { BranchService } from '../../core/services/branch.service';
import { ContentStore } from '../../core/state/content.store';
import { TrackClickDirective } from '../directives/track-click.directive';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, IconComponent, TrackClickDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer__grid">
          <div class="footer__brand">
            <p class="footer__name">{{ site.brandName }}</p>
            <p class="footer__legal">{{ site.legalName }}</p>
            <p class="footer__blurb">
              Traditional Andhra sweets, home foods and bakery treats in {{ site.city }}.
            </p>
            @if (socialLinks().length) {
              <ul class="social" aria-label="Social media">
                @for (s of socialLinks(); track s.label) {
                  <li>
                    <a [href]="s.url" target="_blank" rel="noopener noreferrer">
                      <app-icon [name]="s.icon" [label]="s.label" />
                    </a>
                  </li>
                }
              </ul>
            } @else {
              <p class="footer__muted small">Social media links coming soon.</p>
            }
          </div>

          <div>
            <h2 class="footer__title">Our branches</h2>
            <ul class="footer__list">
              @for (b of branches.active(); track b.id) {
                <li>
                  <a [routerLink]="['/branches', b.slug]">{{ b.name }}</a>
                  <span class="footer__muted small">{{ b.hours?.summary ?? 'Contact branch for timings' }}</span>
                  @if (b.phone) {
                    <a
                      class="small"
                      [href]="'tel:' + b.phone.e164"
                      appTrack="phone_click"
                      [trackParams]="{ branch: b.id, location: 'footer' }"
                      >{{ b.phone.display }}</a
                    >
                  }
                </li>
              }
              @if (branches.pending().length) {
                <li class="footer__muted small">
                  {{ branches.pending().length }} more branches — details coming soon
                </li>
              }
            </ul>
          </div>

          <div>
            <h2 class="footer__title">Explore</h2>
            <ul class="footer__list">
              <li><a routerLink="/sweets">Sweets &amp; Home Foods</a></li>
              <li><a routerLink="/bakery-and-food">Bakery &amp; Food</a></li>
              <li><a routerLink="/order-online">Order Online</a></li>
              <li><a routerLink="/bulk-orders">Bulk Orders &amp; Gifting</a></li>
              <li><a routerLink="/offers">Offers</a></li>
              <li><a routerLink="/about">About Us</a></li>
              <li><a routerLink="/contact">Contact</a></li>
            </ul>
          </div>
        </div>

        <p class="footer__note small">{{ site.priceDisclaimer }}</p>

        <div class="footer__bottom small">
          <span>© {{ year }} {{ site.legalName }}</span>
          <nav aria-label="Legal">
            <a routerLink="/privacy-policy">Privacy Policy</a>
            <a routerLink="/terms">Terms of Use</a>
            <a routerLink="/image-credits">Image Credits</a>
          </nav>
        </div>
      </div>
    </footer>
  `,
  styles: `
    .footer { background: var(--c-primary-dark); color: var(--c-on-dark); padding-block: 64px 28px; margin-top: 0; }
    .footer a { color: var(--c-on-dark); text-decoration: none; }
    .footer a:hover { color: var(--c-gold-soft); text-decoration: underline; }
    .footer__grid { display: grid; gap: 40px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 230px), 1fr)); }
    .footer__name { font-family: var(--font-display); font-size: 1.75rem; color: #fff; margin: 0; font-weight: 700; }
    .footer__legal { color: var(--c-gold-soft); font-size: .8125rem; letter-spacing: .12em; text-transform: uppercase; font-weight: 700; margin: 4px 0 16px; }
    .footer__blurb { max-width: 320px; }
    .footer__title { font-family: var(--font-body); font-size: .8125rem; letter-spacing: .14em; text-transform: uppercase; color: var(--c-gold-soft); margin-bottom: 16px; }
    .footer__list { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
    .footer__list li { display: grid; gap: 2px; }
    .footer__muted { color: var(--c-on-dark-muted); }
    .social { list-style: none; display: flex; gap: 10px; padding: 0; margin: 0; }
    .social a { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; border: 1px solid rgb(255 255 255 / .25); }
    .footer__note { margin: 48px 0 0; padding-top: 24px; border-top: 1px solid rgb(255 255 255 / .12); color: var(--c-on-dark-muted); }
    .footer__bottom { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; margin-top: 16px; color: var(--c-on-dark-muted); }
    .footer__bottom nav { display: flex; gap: 20px; }
  `,
})
export class FooterComponent {
  protected readonly site = SITE_CONFIG;
  protected readonly branches = inject(BranchService);
  private readonly store = inject(ContentStore);
  protected readonly year = new Date().getFullYear();

  protected readonly socialLinks = computed(() => {
    const s = this.store.settings().social;
    return [
      { label: 'Instagram', icon: 'instagram' as const, url: s.instagram },
      { label: 'Facebook', icon: 'facebook' as const, url: s.facebook },
      { label: 'YouTube', icon: 'youtube' as const, url: s.youtube },
    ].filter((l): l is { label: string; icon: 'instagram' | 'facebook' | 'youtube'; url: string } =>
      !!l.url && /^https:\/\//.test(l.url),
    );
  });
}
