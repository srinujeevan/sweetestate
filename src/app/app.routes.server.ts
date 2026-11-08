import { RenderMode, ServerRoute } from '@angular/ssr';
import { BRANCHES } from './core/data/branches.data';
import { PRODUCTS } from './core/data/products.data';

/**
 * Static prerendering: every public page is rendered to HTML at build time.
 * Product and branch pages are generated from the data files.
 * The admin prototype is client-rendered only (and never indexed).
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: 'sweets/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => PRODUCTS.filter((p) => p.active).map((p) => ({ slug: p.slug })),
  },
  {
    path: 'branches/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => BRANCHES.filter((b) => b.status === 'active').map((b) => ({ slug: b.slug })),
  },
  { path: 'admin', renderMode: RenderMode.Client },
  { path: 'admin/**', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Prerender },
];
