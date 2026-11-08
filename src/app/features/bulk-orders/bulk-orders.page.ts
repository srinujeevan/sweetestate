import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { WhatsAppMessages } from '../../core/services/whatsapp.service';
import { IconComponent, IconName } from '../../shared/components/icon.component';
import { PageHeroComponent } from '../../shared/components/page-hero.component';
import { WhatsAppCtaComponent } from '../../shared/components/whatsapp-cta.component';
import { BulkOrderFormComponent } from './bulk-order-form.component';

@Component({
  selector: 'app-bulk-orders-page',
  imports: [PageHeroComponent, BulkOrderFormComponent, WhatsAppCtaComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero
      title="Bulk Orders & Gifting"
      eyebrow="Celebrate with Sweet Estate"
      lead="Traditional Andhra sweets for weddings, family functions, birthdays, festivals, corporate gifting and return gifts. Tell us about your occasion and the team can help you plan."
      [crumbs]="[{ label: 'Bulk Orders & Gifting' }]"
    >
      <div class="btn-row hero-actions">
        <a href="#bulk-form-title" class="btn" (click)="jump($event)">Start an enquiry</a>
        <app-whatsapp-cta [message]="msg" label="Ask on WhatsApp" [params]="{ location: 'bulk_hero' }" [showFallback]="false" />
      </div>
    </app-page-hero>

    <section class="section section--ivory occasions">
      <div class="container">
        <ul class="occasion-list">
          @for (o of occasions; track o.title) {
            <li>
              <span class="occasion__icon"><app-icon [name]="o.icon" [size]="22" /></span>
              <strong>{{ o.title }}</strong>
              <span class="muted small">{{ o.text }}</span>
            </li>
          }
        </ul>
      </div>
    </section>

    <section class="section">
      <div class="container bulk">
        <aside class="bulk__steps">
          <h2>How it works</h2>
          <ol>
            <li><strong>Share your requirements</strong><span>Occasion, date, quantity and any products you have in mind.</span></li>
            <li><strong>We get in touch</strong><span>The team confirms options, packaging and pricing with you.</span></li>
            <li><strong>Confirm your order</strong><span>Your order is booked only once you confirm details with the team.</span></li>
          </ol>
          <p class="small muted">An enquiry is not an order. Prices and availability are confirmed directly with you.</p>
        </aside>
        <div class="card">
          <h2 id="bulk-form-title" tabindex="-1">Bulk order enquiry</h2>
          <app-bulk-order-form [presetBranch]="branch()" [presetOccasion]="occasion()" />
        </div>
      </div>
    </section>
  `,
  styles: `
    .hero-actions { margin-top: 24px; }
    .occasions { padding-block: 36px; }
    .occasion-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 20px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 140px), 1fr)); }
    .occasion-list li { display: grid; gap: 4px; justify-items: start; }
    .occasion__icon { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; background: var(--c-gold-soft); color: var(--c-primary-dark); margin-bottom: 6px; }
    .bulk { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); gap: clamp(24px, 4vw, 48px); align-items: start; }
    @media (max-width: 900px) { .bulk { grid-template-columns: 1fr; } .bulk__steps { order: 2; } }
    .bulk h2 { font-size: 1.5rem; }
    .bulk__steps ol { list-style: none; counter-reset: step; padding: 0; margin: 0 0 20px; display: grid; gap: 20px; }
    .bulk__steps li { counter-increment: step; display: grid; grid-template-columns: 40px 1fr; column-gap: 14px; }
    .bulk__steps li::before { content: counter(step); grid-row: span 2; display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; background: var(--c-accent); color: var(--c-on-accent); font-weight: 700; font-family: var(--font-display); }
    .bulk__steps li span { color: var(--c-muted); font-size: .9688rem; }
    #bulk-form-title:focus { box-shadow: none; }
  `,
})
export class BulkOrdersPage {
  protected readonly msg = WhatsAppMessages.bulk();

  /** Query params: ?branch=…&occasion=… */
  readonly branch = input<string | undefined>();
  readonly occasion = input<string | undefined>();

  protected readonly occasions: { icon: IconName; title: string; text: string }[] = [
    { icon: 'heart', title: 'Weddings', text: 'Sweets for the ceremony and guests.' },
    { icon: 'users', title: 'Family functions', text: 'Housewarmings, naming ceremonies and more.' },
    { icon: 'sparkle', title: 'Birthdays', text: 'Sweets to share with everyone.' },
    { icon: 'calendar', title: 'Festivals', text: 'Sankranti, Diwali, Ugadi and every celebration.' },
    { icon: 'store', title: 'Corporate gifting', text: 'Gifts for teams, clients and partners.' },
    { icon: 'gift', title: 'Return gifts', text: 'Thoughtful sweets for your guests.' },
  ];

  protected jump(event: Event): void {
    event.preventDefault();
    const el = document.getElementById('bulk-form-title');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    el?.focus({ preventScroll: true });
  }
}
