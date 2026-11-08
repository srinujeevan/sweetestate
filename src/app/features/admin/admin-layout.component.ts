import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ContentStore } from '../../core/state/content.store';
import { DemoLeadStore } from '../../core/state/lead.store';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Admin styles are global within the (lazy-loaded) admin area only.
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="admin">
      <div class="admin-banner" role="note">
        <div class="container">
          <strong>Admin prototype — not secure.</strong>
          There is no login. Changes are saved only in this browser (you’ll see them on the site here, but no other
          visitor will).
          A real admin needs a backend with authentication (see README).
          @if (store.localEditsSavedAt(); as saved) {
            <span class="admin-banner__saved">Local edits saved {{ saved | date: 'd MMM, h:mm a' }}.</span>
          }
        </div>
      </div>
      <div class="container admin__grid">
        <nav class="admin-nav" aria-label="Admin">
          <p class="admin-nav__title">Admin</p>
          <ul>
            <li><a routerLink="/admin" [routerLinkActiveOptions]="{ exact: true }" routerLinkActive="is-active" ariaCurrentWhenActive="page">Dashboard</a></li>
            <li>
              <a routerLink="/admin/enquiries" routerLinkActive="is-active" ariaCurrentWhenActive="page">
                Enquiries
                @if (leads.countsByStatus().new; as n) {
                  <span class="admin-count">{{ n }}</span>
                }
              </a>
            </li>
            <li><a routerLink="/admin/products" routerLinkActive="is-active" ariaCurrentWhenActive="page">Products</a></li>
            <li><a routerLink="/admin/categories" routerLinkActive="is-active" ariaCurrentWhenActive="page">Categories</a></li>
            <li><a routerLink="/admin/branches" routerLinkActive="is-active" ariaCurrentWhenActive="page">Branches</a></li>
            <li><a routerLink="/admin/offers" routerLinkActive="is-active" ariaCurrentWhenActive="page">Offers</a></li>
            <li><a routerLink="/admin/settings" routerLinkActive="is-active" ariaCurrentWhenActive="page">Settings &amp; data</a></li>
          </ul>
          <a routerLink="/" class="small">← Back to website</a>
        </nav>
        <div class="admin__content">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styles: `
    .admin { padding-bottom: 80px; }
    .admin-banner { background: var(--c-info-soft); border-bottom: 1.5px dashed var(--c-gold); color: #5c3b06; font-size: .9375rem; padding-block: 10px; }
    .admin-banner__saved { margin-left: 6px; font-weight: 600; }
    .admin__grid { display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 32px; padding-top: 32px; }
    @media (max-width: 860px) { .admin__grid { grid-template-columns: 1fr; } }
    .admin-nav ul { list-style: none; padding: 0; margin: 0 0 20px; display: grid; gap: 2px; }
    @media (max-width: 860px) { .admin-nav ul { display: flex; flex-wrap: wrap; gap: 6px; } }
    .admin-nav__title { font-size: .75rem; letter-spacing: .14em; text-transform: uppercase; font-weight: 700; color: var(--c-gold-text); margin-bottom: 8px; }
    .admin-nav a:not(.small) { display: flex; justify-content: space-between; align-items: center; padding: 9px 12px; border-radius: var(--radius-sm); text-decoration: none; color: var(--c-ink); font-weight: 600; }
    .admin-nav a:not(.small):hover { background: var(--c-sand); }
    .admin-nav a.is-active { background: var(--c-accent); color: var(--c-on-accent); }
    .admin-count { min-width: 22px; padding: 0 6px; border-radius: 999px; background: var(--c-gold-soft); color: var(--c-primary-dark); font-size: .75rem; text-align: center; }
    .admin h1 { font-size: 2rem; margin-bottom: 4px; }
    .admin h2 { font-size: 1.25rem; }
    .admin-head { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: end; gap: 16px; margin-bottom: 24px; }
    .admin-head p { margin: 0; color: var(--c-muted); }
    .admin-table-wrap { overflow-x: auto; background: var(--c-ivory); border: 1px solid var(--c-border); border-radius: var(--radius); }
    .admin-table { width: 100%; border-collapse: collapse; font-size: .9375rem; }
    .admin-table th, .admin-table td { padding: 12px 14px; text-align: left; vertical-align: top; border-bottom: 1px solid var(--c-border); }
    .admin-table th { font-size: .75rem; letter-spacing: .08em; text-transform: uppercase; color: var(--c-muted); background: var(--c-cream); white-space: nowrap; }
    .admin-table tr:last-child td { border-bottom: 0; }
    .admin-table td.num { white-space: nowrap; }
    .admin-filters { display: flex; flex-wrap: wrap; gap: 12px; align-items: end; margin-bottom: 16px; }
    .admin-filters .field { min-width: 160px; flex: 1 1 160px; }
    .admin-stats { display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); margin-bottom: 28px; }
    .admin-stat { padding: 18px; border-radius: var(--radius); background: var(--c-ivory); border: 1px solid var(--c-border); }
    .admin-stat strong { display: block; font-family: var(--font-display); font-size: 2rem; color: var(--c-primary); line-height: 1.1; }
    .admin-stat span { font-size: .875rem; color: var(--c-muted); }
    .status { display: inline-flex; align-items: center; gap: 6px; padding: 2px 10px; border-radius: 999px; font-size: .8125rem; font-weight: 700; border: 1px solid var(--c-border); background: var(--c-sand); white-space: nowrap; }
    .status::before { content: ''; width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
    .status--new { color: #8a3b12; background: #fbe8d8; border-color: #f0c9a8; }
    .status--contacted { color: #6b4b0e; background: var(--c-info-soft); }
    .status--qualified { color: #1f4f7a; background: #e3eef8; border-color: #bcd3ea; }
    .status--converted { color: var(--c-leaf); background: var(--c-leaf-soft); }
    .status--closed { color: var(--c-muted); }
    .admin-fieldset { border: 1px solid var(--c-border); border-radius: var(--radius); padding: 20px; margin: 0; display: grid; gap: 16px; background: var(--c-ivory); }
    .admin-fieldset legend { padding: 0 8px; font-weight: 700; color: var(--c-primary-dark); }
    .variant-row { display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 10px; align-items: end; }
    @media (max-width: 640px) { .variant-row { grid-template-columns: 1fr 1fr; } }
    .icon-btn { display: inline-grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--c-border); background: var(--c-ivory); color: var(--c-danger); cursor: pointer; }
    .icon-btn:hover { background: var(--c-danger-soft); }
    .checklist { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
    .checklist li { display: flex; gap: 10px; align-items: flex-start; font-size: .9688rem; }
    .checklist .ok { color: var(--c-leaf); font-weight: 700; }
    .checklist .todo { color: #8a3b12; font-weight: 700; }
    .flash { margin-bottom: 20px; }
  `,
})
export class AdminLayoutComponent {
  protected readonly store = inject(ContentStore);
  protected readonly leads = inject(DemoLeadStore);

  constructor() {
    this.leads.load();
  }
}
