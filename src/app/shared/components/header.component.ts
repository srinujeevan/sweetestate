import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { SITE_CONFIG } from '../../core/config/site.config';
import { IconComponent } from './icon.component';

export const NAV_LINKS = [
  { path: '/sweets', label: 'Sweets' },
  { path: '/bakery-and-food', label: 'Bakery & Food' },
  { path: '/branches', label: 'Branches' },
  { path: '/bulk-orders', label: 'Bulk & Gifting' },
  { path: '/offers', label: 'Offers' },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' },
];

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'closeMenu(true)' },
  template: `
    <div class="topbar">
      <div class="container topbar__inner">
        <span>Traditional Andhra sweets &amp; bakery · {{ site.totalBranches }} branches in {{ site.city }}</span>
        <a routerLink="/branches" class="topbar__link">Find a branch</a>
      </div>
    </div>
    <header class="header">
      <div class="container header__inner">
        <a routerLink="/" class="brand" aria-label="Sweet Estate — home">
          <span class="brand__mark" aria-hidden="true"></span>
          <span class="brand__text">
            <span class="brand__pre">Tapeswaram Vaari</span>
            <span class="brand__name">Sweet Estate</span>
          </span>
        </a>

        <nav class="nav" aria-label="Main">
          <ul id="main-menu" class="nav__list" [class.is-open]="menuOpen()">
            @for (link of links; track link.path) {
              <li>
                <a
                  [routerLink]="link.path"
                  routerLinkActive="is-active"
                  ariaCurrentWhenActive="page"
                  class="nav__link"
                  >{{ link.label }}</a
                >
              </li>
            }
          </ul>
        </nav>

        <div class="header__actions">
          <a routerLink="/order-online" class="btn btn--sm">
            <app-icon name="bag" [size]="18" />
            <span class="order-long">Order Online</span><span class="order-short">Order</span>
          </a>
          <button
            #toggle
            type="button"
            class="menu-toggle"
            aria-controls="main-menu"
            [attr.aria-expanded]="menuOpen()"
            (click)="menuOpen.set(!menuOpen())"
          >
            <app-icon [name]="menuOpen() ? 'close' : 'menu'" [size]="24" />
            <span class="visually-hidden">{{ menuOpen() ? 'Close menu' : 'Open menu' }}</span>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: `
    :host { display: block; position: sticky; top: 0; z-index: 50; }
    .topbar { background: var(--c-accent); color: var(--c-on-accent); font-weight: 600; font-size: .875rem; }
    .topbar__inner { display: flex; justify-content: space-between; gap: 12px; padding-block: 7px; }
    .topbar__link { color: var(--c-on-accent); font-weight: 600; white-space: nowrap; }
    .topbar__link:hover { color: var(--c-on-accent); text-decoration-thickness: 2px; }
    @media (max-width: 560px) { .topbar span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } }
    .header { background: rgb(255 252 245 / .96); backdrop-filter: blur(8px); border-bottom: 1px solid var(--c-border); }
    .header__inner { display: flex; align-items: center; gap: 24px; min-height: var(--header-h); }
    .brand { display: flex; align-items: center; gap: 12px; text-decoration: none; flex: none; }
    .brand__mark { width: 30px; height: 30px; border: 2px solid var(--c-gold); transform: rotate(45deg); position: relative; }
    .brand__mark::after { content: ''; position: absolute; inset: 5px; background: var(--c-accent); }
    .brand__text { display: grid; line-height: 1; }
    .brand__pre { font-size: .6875rem; letter-spacing: .18em; text-transform: uppercase; color: var(--c-gold-text); font-weight: 700; }
    .brand__name { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; color: var(--c-primary-dark); margin-top: 4px; }
    .nav { margin-left: auto; }
    .nav__list { list-style: none; margin: 0; padding: 0; display: flex; gap: 4px; }
    .nav__link { display: block; padding: 8px 12px; border-radius: 999px; color: var(--c-ink); text-decoration: none; font-weight: 600; font-size: .9688rem; }
    .nav__link:hover { background: var(--c-sand); color: var(--c-primary-dark); }
    .nav__link.is-active { color: var(--c-primary); background: var(--c-primary-soft); }
    .header__actions { display: flex; align-items: center; gap: 8px; }
    .menu-toggle { display: none; width: 46px; height: 46px; border-radius: 50%; border: 1px solid var(--c-border); background: var(--c-ivory); color: var(--c-primary-dark); cursor: pointer; place-items: center; }
    @media (max-width: 1100px) {
      .header__inner { justify-content: space-between; }
      .menu-toggle { display: grid; }
      .nav { margin: 0; position: static; }
      .nav__list { display: none; position: absolute; left: 0; right: 0; top: 100%; flex-direction: column; gap: 2px; padding: 12px var(--gutter) 20px; background: var(--c-ivory); border-bottom: 1px solid var(--c-border); box-shadow: var(--shadow); max-height: calc(100vh - 110px); overflow: auto; }
      .nav__list.is-open { display: flex; }
      .nav__link { padding: 12px 14px; border-radius: var(--radius-sm); font-size: 1.0625rem; }
    }
    .order-short { display: none; }
    @media (max-width: 520px) {
      .header__inner { gap: 12px; }
      .brand { gap: 10px; }
      .brand__name { font-size: 1.25rem; }
      .header__actions .btn { padding-inline: 12px; }
      .order-long { display: none; }
      .order-short { display: inline; }
    }
    @media (max-width: 340px) { .brand__pre { display: none; } }
  `,
})
export class HeaderComponent {
  protected readonly site = SITE_CONFIG;
  protected readonly links = NAV_LINKS;
  protected readonly menuOpen = signal(false);
  private readonly toggle = viewChild<ElementRef<HTMLButtonElement>>('toggle');

  constructor() {
    inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe(() => this.menuOpen.set(false));
  }

  protected closeMenu(returnFocus: boolean): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    if (returnFocus) this.toggle()?.nativeElement.focus();
  }
}
