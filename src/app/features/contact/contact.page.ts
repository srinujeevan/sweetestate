import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { BranchService, directionsUrl, formatAddress } from '../../core/services/branch.service';
import { WhatsAppMessages } from '../../core/services/whatsapp.service';
import { Branch } from '../../core/models/branch.model';
import { IconComponent } from '../../shared/components/icon.component';
import { PageHeroComponent } from '../../shared/components/page-hero.component';
import { WhatsAppCtaComponent } from '../../shared/components/whatsapp-cta.component';
import { TrackClickDirective } from '../../shared/directives/track-click.directive';
import { ContactFormComponent } from './contact-form.component';

@Component({
  selector: 'app-contact-page',
  imports: [PageHeroComponent, ContactFormComponent, WhatsAppCtaComponent, IconComponent, TrackClickDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero
      title="Contact Us"
      eyebrow="We’re here to help"
      lead="Questions about sweets, branches or bulk orders? Call your nearest branch or send us an enquiry."
      [crumbs]="[{ label: 'Contact' }]"
    />

    <section class="section">
      <div class="container contact">
        <div class="card">
          <h2 id="contact-form-title">Send an enquiry</h2>
          <app-contact-form [presetType]="type()" [presetBranch]="branch()" [presetProduct]="product()" />
        </div>

        <aside class="contact__aside">
          <app-whatsapp-cta
            [message]="msg"
            label="Chat on WhatsApp"
            extraClass="btn--block"
            [params]="{ location: 'contact_page' }"
            [showFallback]="false"
          />
          @for (b of branches.active(); track b.id) {
            <div class="card card--flat contact__branch">
              <h3>{{ b.name }}</h3>
              <p class="small muted">{{ address(b) }}</p>
              <p class="small"><app-icon name="clock" [size]="16" /> {{ b.hours?.summary ?? 'Please contact the branch for timings' }}</p>
              <div class="btn-row">
                @if (b.phone; as phone) {
                  <a
                    class="btn btn--sm"
                    [href]="'tel:' + phone.e164"
                    appTrack="phone_click"
                    [trackParams]="{ branch: b.id, location: 'contact_page' }"
                  >
                    <app-icon name="phone" [size]="16" /> {{ phone.display }}
                  </a>
                }
                @if (directions(b); as url) {
                  <a
                    class="btn btn--sm btn--outline"
                    [href]="url"
                    target="_blank"
                    rel="noopener noreferrer"
                    appTrack="directions_click"
                    [trackParams]="{ branch: b.id, location: 'contact_page' }"
                  >
                    Directions <span class="visually-hidden">to {{ b.name }} (opens Google Maps)</span>
                  </a>
                }
              </div>
            </div>
          }
        </aside>
      </div>
    </section>
  `,
  styles: `
    .contact { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: clamp(24px, 4vw, 40px); align-items: start; }
    @media (max-width: 900px) { .contact { grid-template-columns: 1fr; } }
    .contact h2 { font-size: 1.5rem; }
    .contact__aside { display: grid; gap: 16px; }
    .contact__branch h3 { font-size: 1.1875rem; margin-bottom: 4px; }
    .contact__branch p { display: flex; gap: 6px; align-items: center; margin-bottom: 10px; }
  `,
})
export class ContactPage {
  protected readonly branches = inject(BranchService);
  protected readonly msg = WhatsAppMessages.general();

  /** Query params: ?type=…&branch=…&product=… */
  readonly type = input<string | undefined>();
  readonly branch = input<string | undefined>();
  readonly product = input<string | undefined>();

  protected address(b: Branch): string {
    return b.address ? formatAddress(b.address) : '';
  }

  protected directions(b: Branch): string | null {
    return directionsUrl(b);
  }
}
