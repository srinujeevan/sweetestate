# Sweet Estate — website

Website for **Tapeswaram Vaari Sweet Estate**, a traditional Andhra sweets and bakery chain in Visakhapatnam (Vizag).

Built with Angular 19 (standalone components, signals, lazy routes, reactive forms). Every public page is **prerendered to static HTML** at build time for SEO, so the site can be hosted on any static host.

> **Status: demo / first release.** No backend is connected. Enquiry forms run in a clearly labelled **demo mode**, and `/admin` is a **browser-only, unsecured prototype**. See [What is real vs. demo](#what-is-real-vs-demo) and [Missing business inputs](#missing-business-inputs-before-launch).

---

## Quick start

Requires Node.js 18.19+ (tested on Node 22) and npm.

```bash
npm install
npm start               # dev server at http://localhost:4200
npm test                # unit tests (watch mode, Chrome)
npm run test:ci         # unit tests once, headless Chrome
npm run build           # production build + prerender + SEO files → dist/sweetestate/browser
npm run serve:static    # preview the production build at http://localhost:4300
```

## Pages

| Route | Page |
|---|---|
| `/` | Home: hero, bestsellers, Andhra specialities, categories, branches, bulk orders, feedback CTA |
| `/about` | About the business (no invented history) |
| `/sweets` | Catalogue with search, category filter, sorting (`?q=`, `?category=`, `?sort=`) |
| `/sweets/:slug` | Product detail: variant picker, WhatsApp/enquiry CTA |
| `/bakery-and-food` | Bakery, snacks, beverages, gift boxes (enquiry CTAs, no invented menu) |
| `/branches`, `/branches/:slug` | Branch directory and detail pages (call, directions, delivery links) |
| `/order-online` | Swiggy / Zomato per branch (placeholder state until URLs are supplied) |
| `/bulk-orders` | Bulk & gifting lead form |
| `/offers` | Admin-managed offers (empty state for now) |
| `/contact` | Contact form + branch contacts (`?type=`, `?branch=`, `?product=` prefill) |
| `/privacy-policy`, `/terms` | Starter legal copy, **marked for legal review** |
| `/admin/**` | Admin prototype (client-rendered, `noindex`) |
| `**` | Custom 404 (also emitted as `404.html`) |

## Project structure

```
src/
  environments/            build-time settings (domain, API, GA4, admin flag)
  styles/                  design system: tokens, base, layout, components, forms
  app/
    core/
      config/site.config.ts   brand + contact channels (WhatsApp, social)
      data/                   branches, products, categories, offers  ← edit content here
      models/                 typed data models
      services/               catalogue, branches, WhatsApp, analytics, SEO, enquiries
      state/                  ContentStore (editable content), DemoLeadStore
      utils/                  CSV export, ids
    shared/
      components/             header, footer, product/branch cards, CTAs, icons…
      forms/                  validators, submission result component
      directives/             click tracking
    features/                 one folder per page; admin/ is the prototype
scripts/generate-seo-files.mjs  post-build: 404.html, robots.txt, sitemap.xml
```

## Configuration

All business details live in one documented layer. **Only enter details confirmed by the owner** — anything left `null` shows a safe fallback.

| What | Where | Current value |
|---|---|---|
| Production domain | `src/environments/environment.prod.ts` → `siteUrl` (or `SITE_URL` at build time) | not set: canonical tags and sitemap are omitted |
| Enquiry API | `environment.prod.ts` → `apiBaseUrl` | not set: forms in demo mode |
| Google Analytics 4 | `environment.prod.ts` → `ga4MeasurementId` | not set: no analytics loaded |
| Admin prototype | `environment.prod.ts` → `adminPrototypeEnabled` | `true` for the demo; **set `false` before public launch** |
| Central WhatsApp number | `src/app/core/config/site.config.ts` → `defaults.whatsappNumber` | not set: phone/contact-form fallbacks shown |
| Social links | `site.config.ts` → `defaults.social` | not set: "coming soon" |
| Social share image | `site.config.ts` → `ogImagePath` (1200×630 file in `/public`) | not set |
| Branches (incl. Swiggy/Zomato URLs) | `src/app/core/data/branches.data.ts` | 3 supplied, 2 pending |
| Products & prices | `src/app/core/data/products.data.ts` | the 19 supplied variants |
| Categories | `src/app/core/data/categories.data.ts` | 9 categories |
| Offers | `src/app/core/data/offers.data.ts` | empty |

`.env.example` lists the same values plus what a future backend needs. Angular environment files ship to the browser, so **never put secrets in them**.

### Adding the two remaining branches

In `branches.data.ts`, fill in `branch-4` / `branch-5`: set `status: 'active'`, a unique `slug`, `name`, `address`, and whatever of `hours`, `phone` and `deliveryLinks` is confirmed (leave the rest `null`). Rebuild; the branch gets its own prerendered page and structured data automatically.

### Swiggy / Zomato links

Set `deliveryLinks.swiggy` / `deliveryLinks.zomato` per branch to the exact store URLs. Only `https` links on `swiggy.com` / `zomato.com` are shown; anything else falls back to "ordering link will be available soon".

### Product photos

The banner, speciality cards and most products use **representative photos** from Wikimedia Commons (CC BY-SA), listed in `src/app/core/data/stock-photos.data.ts` and stored in `public/images/sweets/`. They are tagged "Representative photo" on the site and credited on `/image-credits`, which the licences require; keep that page while any of them are used. White Angure and Pongadalu had no matching photo, so they show a decorative pattern.

To switch to the shop's own photography, add the file to `public/images/products/` and set `image: { src, alt, isPlaceholder: false, credit: null }` for that product (see `PHOTO_BY_PRODUCT` in `products.data.ts`). Keep images around 1200×900, under ~200 KB.

## What is real vs. demo

| Feature | Status |
|---|---|
| Pages, catalogue, search/filter/sort, branch pages, call & directions links | Real |
| Static prerendering, meta tags, Open Graph, JSON-LD (Organization, FoodEstablishment, Breadcrumb), robots.txt, 404 | Real |
| WhatsApp click-to-chat with contextual messages | Real once a number is configured; until then shows phone/contact fallbacks |
| Swiggy / Zomato buttons | Real once verified URLs are configured |
| GA4 conversion events with consent banner | Real once an ID is configured; nothing loads without consent |
| Contact & bulk forms: client validation, honeypot, minimum fill-time check, UTM/source capture | Real |
| Form submission | **Demo** until `apiBaseUrl` is set; success is shown only after a confirmed 2xx response |
| Admin (products, variants, categories, branches, delivery links, offers, settings, enquiries with status/assignment/notes/CSV) | **Prototype**: no auth, saved in this browser's localStorage only |

## Backend contract (to build)

Recommended: Node.js (NestJS) + PostgreSQL. Entities: Branch, Product, ProductVariant, Category, Offer, Enquiry, LeadNote, AdminUser.

**`POST {apiBaseUrl}/enquiries`** receives the JSON `EnquiryPayload` (see `src/app/core/models/enquiry.model.ts`) and returns `201 { "id": "ENQ-123" }`. The server **must**:

- re-validate every field (types, lengths, Indian mobile format, future event date, `consentToContact === true`) and whitelist fields (no mass assignment)
- apply spam protection: rate limiting per IP, honeypot (reject if a `website` field is ever sent), optionally CAPTCHA (`CAPTCHA_SECRET_KEY`)
- store only the fields received, with `createdAt`/`updatedAt` timestamps and status history
- allow CORS only from the production origin
- optionally email the business (`SMTP_*`)

**Admin API** (to replace the prototype's localStorage): authenticated sessions (httpOnly, Secure, SameSite cookies + CSRF token) or short-lived tokens; role-based access (e.g. owner, branch manager, staff, with branch managers limited to their branch's leads); server-side authorisation on every route; parameterised queries; audit timestamps. Endpoints: CRUD for `/products`, `/categories`, `/branches`, `/offers`, `/settings`; `/leads` with filters, `PATCH` status/assignment, `POST /leads/:id/notes`, `GET /leads.csv`. The prototype's **Settings → Export content JSON** produces data in the same shape as the data files, ready for seeding.

Once the content API exists, `ContentStore` can load from it. Public pages read through signals, so they need no changes.

## Deployment

1. Set `siteUrl` (and optionally `apiBaseUrl`, `ga4MeasurementId`) in `environment.prod.ts`; set `adminPrototypeEnabled: false`.
2. `npm run build`
3. Upload `dist/sweetestate/browser/` to a static host (Netlify, Cloudflare Pages, Firebase Hosting, S3 + CloudFront, Nginx).
4. Configure the host to:
   - serve `/<route>/index.html` for each route (most hosts do this automatically)
   - serve `404.html` with status 404 for unknown paths
   - fall back to `index.csr.html` for `/admin/*` (client-rendered)
5. Submit `https://<domain>/sitemap.xml` in Google Search Console and verify ownership there. Create or claim a Google Business Profile for each branch, using the same name, address and phone as the site.

## Analytics events

Sent only when GA4 is configured and the visitor consents: `whatsapp_click`, `phone_click`, `directions_click`, `contact_form_submit`, `bulk_enquiry_submit`, `product_view`, `product_whatsapp_enquiry`, `swiggy_click`, `zomato_click`, `branch_view`. In development they are logged to the console.

## Missing business inputs before launch

1. Details for the **2 remaining branches** (address, hours, phone)
2. **Madhavadhara** branch phone number, opening hours and PIN code
3. **Swiggy and Zomato store URLs** for each branch
4. A **central WhatsApp Business number**, confirmed for enquiries
5. **Production domain**
6. **Social media** profile URLs
7. **Real product photography** and a logo; a 1200×630 social sharing image
8. Confirmation of **current prices** (supplied prices may be marketplace listings)
9. Menus for **bakery, snacks, beverages, gift boxes**, and ghee/milk sweets, if they should be listed online
10. Optional: founding story or other About-page facts, real customer reviews (with permission), current offers
11. **Legal review** of the Privacy Policy and Terms (including the DPDP Act, 2023)
12. A **backend** for enquiries and admin (see Backend contract), plus a GA4 property if analytics are wanted
