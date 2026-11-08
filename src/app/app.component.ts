import { DOCUMENT } from '@angular/common';
import { Component, afterNextRender, inject } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';
import { AnalyticsService } from './core/services/analytics.service';
import { PageSeo, SeoService } from './core/services/seo.service';
import { organizationJsonLd } from './core/services/structured-data';
import { TrafficSourceService } from './core/services/traffic-source.service';
import { ContentStore } from './core/state/content.store';
import { ConsentBannerComponent } from './shared/components/consent-banner.component';
import { ContactFabComponent } from './shared/components/contact-fab.component';
import { FooterComponent } from './shared/components/footer.component';
import { HeaderComponent } from './shared/components/header.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ContactFabComponent, ConsentBannerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);
  private readonly doc = inject(DOCUMENT);
  private readonly analytics = inject(AnalyticsService);
  private firstNavigation = true;

  constructor() {
    this.seo.setJsonLd('organization', organizationJsonLd());

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.seo.clearPageJsonLd();
      }
      if (event instanceof NavigationEnd) {
        const seo = deepestData(this.router.routerState.snapshot.root);
        if (seo) this.seo.update({ path: event.urlAfterRedirects.split(/[?#]/)[0], ...seo });
        this.analytics.pageView(event.urlAfterRedirects, this.doc.title);
        if (!this.firstNavigation) this.focusMain();
        this.firstNavigation = false;
      }
    });

    const store = inject(ContentStore);
    const traffic = inject(TrafficSourceService);
    // Browser-only setup, after hydration so prerendered markup stays consistent.
    afterNextRender(() => {
      if (environment.adminPrototypeEnabled) store.loadLocalEdits();
      traffic.capture();
      this.analytics.init();
    });
  }

  /** Moves focus to the main region after client-side navigation (screen reader friendly). */
  private focusMain(): void {
    const main = this.doc.getElementById('main-content');
    main?.focus({ preventScroll: true });
  }
}

function deepestData(route: ActivatedRouteSnapshot): PageSeo | null {
  let current: ActivatedRouteSnapshot | null = route;
  let seo: PageSeo | null = null;
  while (current) {
    if (current.data['seo']) seo = current.data['seo'] as PageSeo;
    current = current.firstChild;
  }
  return seo;
}
