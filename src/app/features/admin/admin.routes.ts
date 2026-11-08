import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout.component';

/**
 * Admin PROTOTYPE routes. Browser-only, no authentication — see README.
 * A production admin needs server-side auth and authorisation on every API call.
 */
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', loadComponent: () => import('./dashboard.page').then((m) => m.AdminDashboardPage) },
      { path: 'products', loadComponent: () => import('./products.page').then((m) => m.AdminProductsPage) },
      { path: 'products/:id', loadComponent: () => import('./product-edit.page').then((m) => m.AdminProductEditPage) },
      { path: 'categories', loadComponent: () => import('./categories.page').then((m) => m.AdminCategoriesPage) },
      { path: 'branches', loadComponent: () => import('./branches.page').then((m) => m.AdminBranchesPage) },
      { path: 'branches/:id', loadComponent: () => import('./branch-edit.page').then((m) => m.AdminBranchEditPage) },
      { path: 'offers', loadComponent: () => import('./offers.page').then((m) => m.AdminOffersPage) },
      { path: 'enquiries', loadComponent: () => import('./enquiries.page').then((m) => m.AdminEnquiriesPage) },
      { path: 'enquiries/:id', loadComponent: () => import('./enquiry-detail.page').then((m) => m.AdminEnquiryDetailPage) },
      { path: 'settings', loadComponent: () => import('./settings.page').then((m) => m.AdminSettingsPage) },
    ],
  },
];
