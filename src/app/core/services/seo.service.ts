import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { SITE_CONFIG } from '../config/site.config';

export interface PageSeo {
  title: string;
  description: string;
  /** Path for canonical URL, e.g. '/sweets'. Defaults to the current route. */
  path?: string;
  noindex?: boolean;
  type?: 'website' | 'article';
}

const TITLE_SUFFIX = `${SITE_CONFIG.brandName} Visakhapatnam`;

export function absoluteUrl(path: string): string | null {
  if (!environment.siteUrl) return null;
  return environment.siteUrl.replace(/\/$/, '') + (path.startsWith('/') ? path : '/' + path);
}

/** Title, meta description, Open Graph, canonical and JSON-LD management. */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  update(seo: PageSeo): void {
    const fullTitle = seo.title.includes(SITE_CONFIG.brandName) ? seo.title : `${seo.title} | ${TITLE_SUFFIX}`;
    this.title.setTitle(fullTitle);
    this.meta.updateTag({ name: 'description', content: seo.description });
    this.meta.updateTag({ name: 'robots', content: seo.noindex ? 'noindex, nofollow' : 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: seo.description });
    this.meta.updateTag({ property: 'og:type', content: seo.type ?? 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: SITE_CONFIG.legalName });
    this.meta.updateTag({ property: 'og:locale', content: 'en_IN' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });

    const url = seo.path !== undefined ? absoluteUrl(seo.path) : null;
    this.setCanonical(seo.noindex ? null : url);
    if (url) this.meta.updateTag({ property: 'og:url', content: url });
    else this.meta.removeTag("property='og:url'");

    const image = SITE_CONFIG.ogImagePath ? absoluteUrl(SITE_CONFIG.ogImagePath) : null;
    if (image) this.meta.updateTag({ property: 'og:image', content: image });
    else this.meta.removeTag("property='og:image'");
  }

  /** Adds/replaces a JSON-LD block. Pass null to remove it. */
  setJsonLd(id: string, data: object | null): void {
    const elementId = `jsonld-${id}`;
    this.doc.getElementById(elementId)?.remove();
    if (!data) return;
    const script = this.doc.createElement('script');
    script.type = 'application/ld+json';
    script.id = elementId;
    // JSON.stringify output is safe as text; escape '<' to prevent </script> breakouts.
    script.textContent = JSON.stringify(data).replace(/</g, '\\u003c');
    this.doc.head.appendChild(script);
  }

  /** Removes page-specific JSON-LD blocks (keeps the site-wide organisation block). */
  clearPageJsonLd(): void {
    this.doc.head
      .querySelectorAll('script[type="application/ld+json"]:not(#jsonld-organization)')
      .forEach((el) => el.remove());
  }

  private setCanonical(url: string | null): void {
    let link = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!url) {
      link?.remove();
      return;
    }
    if (!link) {
      link = this.doc.createElement('link');
      link.rel = 'canonical';
      this.doc.head.appendChild(link);
    }
    link.href = url;
  }
}
