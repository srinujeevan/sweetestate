import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BranchService } from '../../core/services/branch.service';
import { WhatsAppMessages, WhatsAppService } from '../../core/services/whatsapp.service';
import { TrackClickDirective } from '../directives/track-click.directive';
import { IconComponent } from './icon.component';

/**
 * Floating contact button.
 * - WhatsApp configured → direct click-to-chat link.
 * - Not configured → a small panel with branch phone numbers and the contact form
 *   (never a broken WhatsApp link).
 */
@Component({
  selector: 'app-contact-fab',
  imports: [RouterLink, IconComponent, TrackClickDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'close()',
    '(document:click)': 'onDocumentClick($event)',
  },
  template: `
    @if (whatsappUrl(); as url) {
      <a
        class="fab fab--wa"
        [href]="url"
        target="_blank"
        rel="noopener noreferrer"
        appTrack="whatsapp_click"
        [trackParams]="{ location: 'floating_button' }"
      >
        <app-icon name="chat" [size]="26" />
        <span class="fab__label">WhatsApp us</span>
      </a>
    } @else {
      @if (open()) {
        <div class="panel" id="contact-panel" role="region" aria-label="Contact options">
          <p class="panel__title">Talk to us</p>
          <ul class="panel__list">
            @for (b of branches.withPhone(); track b.id) {
              <li>
                <a
                  [href]="'tel:' + b.phone!.e164"
                  appTrack="phone_click"
                  [trackParams]="{ branch: b.id, location: 'floating_panel' }"
                >
                  <app-icon name="phone" [size]="18" />
                  <span><strong>{{ b.name }}</strong><br />{{ b.phone!.display }}</span>
                </a>
              </li>
            }
            <li>
              <a routerLink="/contact" (click)="close()">
                <app-icon name="mail" [size]="18" />
                <span><strong>Send an enquiry</strong><br />Use our contact form</span>
              </a>
            </li>
          </ul>
        </div>
      }
      <button
        type="button"
        class="fab"
        aria-controls="contact-panel"
        [attr.aria-expanded]="open()"
        (click)="open.set(!open())"
      >
        <app-icon [name]="open() ? 'close' : 'phone'" [size]="24" />
        <span class="fab__label">{{ open() ? 'Close' : 'Call or enquire' }}</span>
      </button>
    }
  `,
  styles: `
    :host { position: fixed; right: max(16px, env(safe-area-inset-right)); bottom: max(16px, env(safe-area-inset-bottom)); z-index: 60; display: flex; flex-direction: column; align-items: flex-end; gap: 12px; }
    .fab { display: inline-flex; align-items: center; gap: 10px; min-height: 56px; padding: 0 20px 0 16px; border-radius: 999px; border: 0; background: var(--c-accent); color: var(--c-on-accent); font-weight: 700; box-shadow: 0 8px 24px rgb(138 62 0 / .3); cursor: pointer; text-decoration: none; transition: transform .18s ease; }
    .fab:hover { transform: translateY(-2px); color: var(--c-on-accent); }
    .fab--wa { background: #1f7a45; }
    @media (max-width: 640px) { .fab { padding: 0 16px; } .fab__label { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); } }
    .panel { width: min(300px, calc(100vw - 32px)); background: var(--c-ivory); border: 1px solid var(--c-border); border-radius: var(--radius); box-shadow: var(--shadow); padding: 16px; }
    .panel__title { font-family: var(--font-display); font-size: 1.125rem; font-weight: 600; color: var(--c-primary-dark); margin: 0 0 8px; }
    .panel__list { list-style: none; padding: 0; margin: 0; display: grid; gap: 4px; }
    .panel__list a { display: flex; gap: 12px; align-items: flex-start; padding: 10px; border-radius: var(--radius-sm); text-decoration: none; color: var(--c-ink); font-size: .9375rem; line-height: 1.35; }
    .panel__list a:hover { background: var(--c-sand); }
    .panel__list app-icon { color: var(--c-primary); margin-top: 2px; }
  `,
})
export class ContactFabComponent {
  private readonly whatsapp = inject(WhatsAppService);
  private readonly host = inject(ElementRef<HTMLElement>);
  protected readonly branches = inject(BranchService);
  protected readonly open = signal(false);
  protected readonly whatsappUrl = computed(() => this.whatsapp.link(WhatsAppMessages.general()));

  protected close(): void {
    this.open.set(false);
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) this.close();
  }
}
