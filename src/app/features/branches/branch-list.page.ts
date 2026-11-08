import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SITE_CONFIG } from '../../core/config/site.config';
import { BranchService } from '../../core/services/branch.service';
import { SeoService } from '../../core/services/seo.service';
import { branchJsonLd } from '../../core/services/structured-data';
import { BranchCardComponent } from '../../shared/components/branch-card.component';
import { PageHeroComponent } from '../../shared/components/page-hero.component';

@Component({
  selector: 'app-branch-list-page',
  imports: [PageHeroComponent, BranchCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero
      title="Our Branches in Visakhapatnam"
      eyebrow="Visit Sweet Estate"
      [lead]="lead"
      [crumbs]="[{ label: 'Branches' }]"
    />
    <section class="section">
      <div class="container">
        <div class="grid grid--cards">
          @for (b of branches.all(); track b.id) {
            <app-branch-card [branch]="b" />
          }
        </div>
        <p class="small muted" style="margin-top: 28px">
          Opening hours are as supplied by each branch and may change on holidays and festival days. Please call ahead
          if you are travelling specially.
        </p>
      </div>
    </section>
  `,
})
export class BranchListPage {
  protected readonly branches = inject(BranchService);
  protected readonly lead = `${SITE_CONFIG.legalName} has ${SITE_CONFIG.totalBranches} branches across ${SITE_CONFIG.city}. Walk in, take away, or call your nearest branch.`;

  constructor() {
    const seo = inject(SeoService);
    this.branches.active().forEach((b) => seo.setJsonLd(`branch-${b.id}`, branchJsonLd(b)));
  }
}
