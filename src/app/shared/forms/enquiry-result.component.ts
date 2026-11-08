import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { BranchService } from '../../core/services/branch.service';
import { IconComponent } from '../components/icon.component';
import { WhatsAppCtaComponent } from '../components/whatsapp-cta.component';
import { TrackClickDirective } from '../directives/track-click.directive';

export type EnquiryOutcome = 'live' | 'demo' | 'error';

/**
 * Post-submit message. Only 'live' (a confirmed 2xx from the API) claims the
 * enquiry was sent. 'demo' says plainly that nothing was sent and offers
 * working alternatives.
 */
@Component({
  selector: 'app-enquiry-result',
  imports: [IconComponent, WhatsAppCtaComponent, TrackClickDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (outcome()) {
      @case ('live') {
        <div class="notice notice--success" role="status">
          <app-icon name="check" class="notice__icon" />
          <div>
            <p><strong>Thank you, your enquiry has been sent.</strong></p>
            <p>
              Our team will contact you on the number you provided.
              @if (reference()) {
                Your reference is <strong>{{ reference() }}</strong>.
              }
            </p>
          </div>
        </div>
      }
      @case ('demo') {
        <div class="notice notice--demo" role="alert">
          <app-icon name="info" class="notice__icon" />
          <div>
            <p><strong>Demo mode: your enquiry has NOT been sent to Sweet Estate.</strong></p>
            <p>This website isn’t connected to an enquiry system yet. To reach the team now, please use one of these:</p>
          </div>
        </div>
      }
      @case ('error') {
        <div class="notice notice--error" role="alert">
          <app-icon name="info" class="notice__icon" />
          <div>
            <p><strong>Sorry, we couldn’t send your enquiry.</strong></p>
            <p>Please check your connection and try again, or contact a branch directly:</p>
          </div>
        </div>
      }
    }

    @if (outcome() !== 'live') {
      <div class="alt">
        <app-whatsapp-cta
          [message]="whatsappMessage()"
          label="Send on WhatsApp instead"
          [params]="{ location: 'form_fallback' }"
          [showFallback]="false"
        />
        @for (b of branches.withPhone(); track b.id) {
          <a
            class="btn btn--outline"
            [href]="'tel:' + b.phone!.e164"
            appTrack="phone_click"
            [trackParams]="{ branch: b.id, location: 'form_fallback' }"
          >
            <app-icon name="phone" /> {{ b.name }}: {{ b.phone!.display }}
          </a>
        }
      </div>
    }

    <button type="button" class="btn btn--sm btn--outline again" (click)="reset.emit()">
      {{ outcome() === 'error' ? 'Back to the form' : 'Send another enquiry' }}
    </button>
  `,
  styles: `
    :host { display: grid; gap: 16px; }
    .alt { display: flex; flex-wrap: wrap; gap: 10px; }
    .again { justify-self: start; }
  `,
})
export class EnquiryResultComponent {
  protected readonly branches = inject(BranchService);
  readonly outcome = input.required<EnquiryOutcome>();
  readonly reference = input<string | null>(null);
  readonly whatsappMessage = input.required<string>();
  readonly reset = output<void>();
}
