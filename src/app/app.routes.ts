import { Routes } from '@angular/router';
import { environment } from '../environments/environment';
import { PageSeo } from './core/services/seo.service';

const seo = (value: PageSeo) => ({ seo: value });

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
    data: seo({
      title: 'Sweet Estate | Traditional Andhra Sweets & Bakery in Visakhapatnam',
      description:
        'Tapeswaram Vaari Sweet Estate — traditional Andhra sweets, home foods and bakery treats across Visakhapatnam (Vizag). Visit a branch, order online or enquire about bulk orders.',
    }),
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about.page').then((m) => m.AboutPage),
    data: seo({
      title: 'About Tapeswaram Vaari Sweet Estate',
      description:
        'About Tapeswaram Vaari Sweet Estate, a traditional Andhra sweets and bakery chain in Visakhapatnam.',
    }),
  },
  {
    path: 'sweets',
    loadComponent: () => import('./features/products/product-list.page').then((m) => m.ProductListPage),
    data: seo({
      title: 'Sweets & Home Foods Menu',
      description:
        'Browse Sweet Estate’s sweets and home foods — Chandrakala, Mysore Pak, Putharekulu, Sunnundalu, Ariselu and more, with indicative prices.',
    }),
  },
  {
    path: 'sweets/:slug',
    loadComponent: () => import('./features/products/product-detail.page').then((m) => m.ProductDetailPage),
  },
  {
    path: 'bakery-and-food',
    loadComponent: () => import('./features/bakery/bakery.page').then((m) => m.BakeryPage),
    data: seo({
      title: 'Bakery, Snacks & Gift Boxes',
      description:
        'Bakery treats, snacks, savouries, beverages and gift boxes at Sweet Estate branches in Visakhapatnam. Enquire for today’s selection.',
    }),
  },
  {
    path: 'branches',
    loadComponent: () => import('./features/branches/branch-list.page').then((m) => m.BranchListPage),
    data: seo({
      title: 'Branches in Visakhapatnam',
      description:
        'Find a Sweet Estate branch in Visakhapatnam — H.B. Colony, Seethammadhara, Madhavadhara and more. Addresses, timings, phone numbers and directions.',
    }),
  },
  {
    path: 'branches/:slug',
    loadComponent: () => import('./features/branches/branch-detail.page').then((m) => m.BranchDetailPage),
  },
  {
    path: 'order-online',
    loadComponent: () => import('./features/order/order-online.page').then((m) => m.OrderOnlinePage),
    data: seo({
      title: 'Order Online — Swiggy & Zomato',
      description:
        'Order Sweet Estate sweets online through Swiggy and Zomato, or call your nearest Visakhapatnam branch.',
    }),
  },
  {
    path: 'bulk-orders',
    loadComponent: () => import('./features/bulk-orders/bulk-orders.page').then((m) => m.BulkOrdersPage),
    data: seo({
      title: 'Bulk Orders, Wedding & Festival Gifting',
      description:
        'Enquire about bulk sweets for weddings, family functions, festivals, birthdays, corporate gifting and return gifts in Visakhapatnam.',
    }),
  },
  {
    path: 'offers',
    loadComponent: () => import('./features/offers/offers.page').then((m) => m.OffersPage),
    data: seo({
      title: 'Offers',
      description: 'Current offers at Sweet Estate, Visakhapatnam.',
    }),
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact.page').then((m) => m.ContactPage),
    data: seo({
      title: 'Contact Us',
      description:
        'Contact Sweet Estate in Visakhapatnam — call a branch, send an enquiry, or ask about products and bulk orders.',
    }),
  },
  {
    path: 'privacy-policy',
    loadComponent: () => import('./features/legal/privacy.page').then((m) => m.PrivacyPage),
    data: seo({
      title: 'Privacy Policy',
      description: 'How Sweet Estate uses the information you share through this website.',
    }),
  },
  {
    path: 'terms',
    loadComponent: () => import('./features/legal/terms.page').then((m) => m.TermsPage),
    data: seo({
      title: 'Terms of Use',
      description: 'Terms of use for the Sweet Estate website.',
    }),
  },
  {
    path: 'image-credits',
    loadComponent: () => import('./features/legal/image-credits.page').then((m) => m.ImageCreditsPage),
    data: seo({
      title: 'Image Credits',
      description: 'Credits and licences for the representative photos used on the Sweet Estate website.',
    }),
  },
  {
    path: 'admin',
    canMatch: [() => environment.adminPrototypeEnabled],
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
    data: seo({ title: 'Admin (prototype)', description: 'Admin prototype', noindex: true }),
  },
  {
    // Prerendered to /404/index.html; the post-build script copies it to /404.html for static hosts.
    path: '404',
    loadComponent: () => import('./features/not-found/not-found.page').then((m) => m.NotFoundPage),
    data: seo({ title: 'Page not found', description: 'The page you were looking for could not be found.', noindex: true }),
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.page').then((m) => m.NotFoundPage),
    data: seo({ title: 'Page not found', description: 'The page you were looking for could not be found.', noindex: true }),
  },
];
