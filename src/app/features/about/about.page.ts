import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE_CONFIG } from '../../core/config/site.config';
import { BranchService } from '../../core/services/branch.service';
import { IconComponent } from '../../shared/components/icon.component';
import { PageHeroComponent } from '../../shared/components/page-hero.component';

/*
 * Content note: no founding year, founder story, awards or production claims
 * have been supplied. Add them here only once the owner provides them.
 */
@Component({
  selector: 'app-about-page',
  imports: [RouterLink, PageHeroComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero
      [title]="'About ' + site.legalName"
      eyebrow="Our story"
      lead="A traditional Andhra sweets and bakery chain in Visakhapatnam, known to many simply as Sweet Estate."
      [crumbs]="[{ label: 'About' }]"
    />

    <section class="section">
      <div class="container about">
        <div class="prose">
          <h2>Traditional Andhra sweets, close to home</h2>
          <p>
            {{ site.legalName }} focuses on the sweets and snacks Andhra families celebrate with, from regional
            favourites such as Kakinada Kaja and Pootharekulu to ghee sweets, fresh Bobbatlu, Mysore Pak, Sunnundalu,
            Ariselu, Bellam Gavvalu and milk-based sweets, alongside bakery products.
          </p>
          <p>
            With {{ site.totalBranches }} branches across {{ site.city }}, you can walk in, pick up a takeaway, or order
            for delivery through Swiggy and Zomato. For weddings, festivals, family functions and corporate gifting, our
            team can help with bulk orders.
          </p>
        </div>

        <aside class="about__facts">
          <ul>
            <li><app-icon name="store" /> {{ site.totalBranches }} branches in {{ site.city }}</li>
            <li><app-icon name="sparkle" /> Traditional Andhra sweets &amp; home foods</li>
            <li><app-icon name="bag" /> Walk-in, takeaway &amp; delivery</li>
            <li><app-icon name="gift" /> Bulk orders &amp; gifting</li>
          </ul>
        </aside>
      </div>
    </section>

    <section class="section section--ivory">
      <div class="container">
        <div class="grid grid--cards">
          <a routerLink="/sweets" class="card about__link">
            <h3>Explore the menu</h3>
            <p class="muted">Sweets and home foods with indicative prices.</p>
            <span class="link-arrow">Browse sweets</span>
          </a>
          <a routerLink="/branches" class="card about__link">
            <h3>Visit a branch</h3>
            <p class="muted">{{ branches.active().length }} branches listed with addresses and directions.</p>
            <span class="link-arrow">Find a branch</span>
          </a>
          <a routerLink="/bulk-orders" class="card about__link">
            <h3>Plan a celebration</h3>
            <p class="muted">Bulk sweets for weddings, festivals and corporate gifting.</p>
            <span class="link-arrow">Bulk orders</span>
          </a>
        </div>
      </div>
    </section>
  `,
  styles: `
    .about { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr); gap: clamp(28px, 5vw, 64px); align-items: start; }
    @media (max-width: 860px) { .about { grid-template-columns: 1fr; } }
    .about .prose h2:first-child { margin-top: 0; }
    .about .prose p { font-size: 1.125rem; }
    .about__facts ul { list-style: none; margin: 0; padding: 24px; display: grid; gap: 16px; background: var(--c-ivory); border: 1px solid var(--c-border); border-radius: var(--radius); outline: 1px solid var(--c-gold-soft); outline-offset: -8px; }
    .about__facts li { display: flex; gap: 12px; align-items: center; font-weight: 600; color: var(--c-primary-dark); }
    .about__facts app-icon { color: var(--c-gold); }
    .about__link { text-decoration: none; color: inherit; transition: border-color .18s ease; }
    .about__link:hover { border-color: var(--c-primary); color: inherit; }
  `,
})
export class AboutPage {
  protected readonly site = SITE_CONFIG;
  protected readonly branches = inject(BranchService);
}
