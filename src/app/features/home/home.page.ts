import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE_CONFIG } from '../../core/config/site.config';
import { STOCK_PHOTOS, StockPhoto } from '../../core/data/stock-photos.data';
import { BULK_OCCASIONS } from '../../core/models/enquiry.model';
import { BranchService } from '../../core/services/branch.service';
import { CatalogueService } from '../../core/services/catalogue.service';
import { WhatsAppMessages } from '../../core/services/whatsapp.service';
import { BranchCardComponent } from '../../shared/components/branch-card.component';
import { IconComponent, IconName } from '../../shared/components/icon.component';
import { PriceNoteComponent } from '../../shared/components/price-note.component';
import { ProductCardComponent } from '../../shared/components/product-card.component';
import { WhatsAppCtaComponent } from '../../shared/components/whatsapp-cta.component';

interface Speciality {
  name: string;
  text: string;
  link: { label: string; path: string; query?: Record<string, string> } | null;
  photo: StockPhoto | null;
}

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, ProductCardComponent, BranchCardComponent, PriceNoteComponent, WhatsAppCtaComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {
  protected readonly site = SITE_CONFIG;
  protected readonly catalogue = inject(CatalogueService);
  protected readonly branches = inject(BranchService);
  protected readonly occasions = BULK_OCCASIONS.filter((o) => o !== 'Other');
  protected readonly msg = WhatsAppMessages;

  /** Gift box gallery: representative photos, credited on /image-credits. */
  protected readonly giftGallery: { photo: StockPhoto; label: string }[] = [
    { photo: STOCK_PHOTOS.giftBoxGold, label: 'Festive gift box' },
    { photo: STOCK_PHOTOS.assortedBox1, label: 'Assorted mithai box' },
    { photo: STOCK_PHOTOS.assortedBox2, label: 'Burfi selection' },
    { photo: STOCK_PHOTOS.assortedBox3, label: 'Celebration box' },
  ];

  protected readonly bestsellers = computed(() => this.catalogue.featured().slice(0, 6));

  protected readonly highlights: { icon: IconName; title: string; text: string }[] = [
    { icon: 'store', title: `${SITE_CONFIG.totalBranches} branches in Vizag`, text: 'Walk in or pick up a takeaway near you.' },
    { icon: 'truck', title: 'Delivery via Swiggy & Zomato', text: 'Coverage is set by the delivery platform.' },
    { icon: 'gift', title: 'Bulk & festival orders', text: 'Weddings, functions and corporate gifting.' },
    { icon: 'sparkle', title: 'Andhra favourites', text: 'Traditional sweets, home foods and bakery.' },
  ];

  protected readonly specialities: Speciality[] = [
    {
      name: 'Kakinada Kaja',
      text: 'A celebrated Andhra classic. Ask your nearest branch about availability.',
      link: { label: 'Find a branch', path: '/branches' },
      photo: STOCK_PHOTOS.kakinadaKaja,
    },
    {
      name: 'Pootharekulu',
      text: 'Browse our Putharekulu varieties, by the piece.',
      link: { label: 'See Putharekulu', path: '/sweets', query: { q: 'putharekulu' } },
      photo: STOCK_PHOTOS.pootharekulu,
    },
    {
      name: 'Ghee sweets',
      text: 'Ask in store for the day’s ghee sweets selection.',
      link: { label: 'Find a branch', path: '/branches' },
      photo: STOCK_PHOTOS.mysorePak,
    },
    {
      name: 'Fresh Bobbatlu',
      text: 'Ask your nearest branch when fresh Bobbatlu are available.',
      link: { label: 'Contact us', path: '/contact', query: { type: 'Product enquiry' } },
      photo: null,
    },
  ];
}
