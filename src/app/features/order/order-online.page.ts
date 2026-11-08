import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BranchService, verifiedDeliveryUrl } from '../../core/services/branch.service';
import { WhatsAppMessages } from '../../core/services/whatsapp.service';
import { DeliveryLinksComponent } from '../../shared/components/delivery-links.component';
import { IconComponent } from '../../shared/components/icon.component';
import { PageHeroComponent } from '../../shared/components/page-hero.component';
import { WhatsAppCtaComponent } from '../../shared/components/whatsapp-cta.component';
import { TrackClickDirective } from '../../shared/directives/track-click.directive';

@Component({
  selector: 'app-order-online-page',
  imports: [RouterLink, PageHeroComponent, DeliveryLinksComponent, WhatsAppCtaComponent, IconComponent, TrackClickDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero
      title="Order Online"
      eyebrow="Delivery & takeaway"
      lead="Order Sweet Estate favourites through Swiggy or Zomato from the branch nearest you — or call ahead and pick up."
      [crumbs]="[{ label: 'Order Online' }]"
    />

    <section class="section">
      <div class="container">
        @if (!anyLinks()) {
          <div class="notice" role="note" style="margin-bottom: 28px">
            <app-icon name="info" class="notice__icon" />
            <p>
              <strong>Online ordering links will be available soon.</strong> Until then, please call a branch or visit
              us in store.
            </p>
          </div>
        }

        <ul class="order-list">
          @for (b of branches.active(); track b.id) {
            <li class="order card">
              <div class="order__info">
                <h2><a [routerLink]="['/branches', b.slug]">{{ b.name }}</a></h2>
                <p class="muted small">{{ b.area }} · {{ b.hours?.summary ?? 'Contact branch for timings' }}</p>
              </div>
              <div class="order__actions">
                <app-delivery-links [branch]="b" />
                @if (b.phone; as phone) {
                  <a
                    class="btn btn--sm"
                    [href]="'tel:' + phone.e164"
                    appTrack="phone_click"
                    [trackParams]="{ branch: b.id, location: 'order_page' }"
                  >
                    <app-icon name="phone" [size]="16" /> Call to order
                  </a>
                }
              </div>
            </li>
          }
        </ul>

        <div class="grid grid--2 order-info">
          <div class="card card--flat">
            <h2>About delivery</h2>
            <p class="muted">
              Delivery availability, coverage area, delivery fees and timings are decided by Swiggy and Zomato. Menu
              prices on those platforms may differ from in-store prices.
            </p>
          </div>
          <div class="card card--flat">
            <h2>Large or special orders?</h2>
            <p class="muted">For weddings, festivals and corporate gifting, send a bulk enquiry so the team can plan with you.</p>
            <div class="btn-row">
              <a routerLink="/bulk-orders" class="btn btn--sm">Bulk order enquiry</a>
              <app-whatsapp-cta
                [message]="msg"
                label="WhatsApp us"
                extraClass="btn--sm"
                [params]="{ location: 'order_page' }"
                [showFallback]="false"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    .order-list { list-style: none; margin: 0 0 40px; padding: 0; display: grid; gap: 16px; }
    .order { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px 32px; }
    .order h2 { font-size: 1.375rem; margin: 0; }
    .order h2 a { color: var(--c-primary-dark); text-decoration: none; }
    .order h2 a:hover { text-decoration: underline; }
    .order__info p { margin: 4px 0 0; }
    .order__actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
    .order-info h2 { font-size: 1.25rem; }
  `,
})
export class OrderOnlinePage {
  protected readonly branches = inject(BranchService);
  protected readonly msg = WhatsAppMessages.ordering();
  protected readonly anyLinks = computed(() =>
    this.branches
      .active()
      .some(
        (b) => verifiedDeliveryUrl('swiggy', b.deliveryLinks.swiggy) || verifiedDeliveryUrl('zomato', b.deliveryLinks.zomato),
      ),
  );
}
