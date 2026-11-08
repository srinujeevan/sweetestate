import { ChangeDetectionStrategy, Component, effect, inject, signal, untracked } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { normaliseWhatsAppNumber } from '../../core/services/whatsapp.service';
import { ContentStore } from '../../core/state/content.store';
import { DemoLeadStore } from '../../core/state/lead.store';
import { downloadText, isHttpsUrl } from './admin-utils';

const whatsappValidator = (c: AbstractControl): ValidationErrors | null =>
  !c.value || normaliseWhatsAppNumber(c.value) ? null : { whatsapp: true };
const httpsValidator = (c: AbstractControl): ValidationErrors | null =>
  !c.value || isHttpsUrl(c.value) ? null : { https: true };

@Component({
  selector: 'app-admin-settings',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-head">
      <div>
        <h1>Settings &amp; data</h1>
        <p>Contact channels, social links, and prototype data tools.</p>
      </div>
    </div>

    @if (message()) {
      <div class="notice flash" [class.notice--error]="isError()" role="status">{{ message() }}</div>
    }

    <form class="form" [formGroup]="form" (ngSubmit)="save()" novalidate>
      <fieldset class="admin-fieldset">
        <legend>WhatsApp</legend>
        <div class="field">
          <label class="field__label" for="st-wa">Central WhatsApp Business number</label>
          <input id="st-wa" class="input" formControlName="whatsappNumber" placeholder="91XXXXXXXXXX" inputmode="tel" />
          <p class="field__hint">
            Country code + number, digits only. Only use a number the owner has confirmed is on WhatsApp and should
            receive enquiries. Leave empty to show phone and contact-form options instead.
          </p>
          @if (form.controls.whatsappNumber.invalid) {
            <p class="field__error">Enter 10–15 digits including country code, e.g. 91 followed by the mobile number.</p>
          }
        </div>
      </fieldset>

      <fieldset class="admin-fieldset">
        <legend>Social media</legend>
        <div class="form-grid">
          @for (s of socials; track s.key) {
            <div class="field">
              <label class="field__label" [for]="'st-' + s.key">{{ s.label }} URL</label>
              <input [id]="'st-' + s.key" class="input" type="url" [formControlName]="s.key" placeholder="https://…" />
              @if (form.get(s.key)?.invalid) {
                <p class="field__error">Must be a full https:// link.</p>
              }
            </div>
          }
        </div>
      </fieldset>

      <div><button type="submit" class="btn" [disabled]="form.invalid">Save settings</button></div>
    </form>

    <section class="admin-fieldset" style="margin-top: 32px">
      <h2>Prototype data</h2>
      <p class="muted small">
        Export your edits as JSON to hand them to a developer (they can be copied into the data files in
        <code>src/app/core/data</code>), or import an export from another browser.
      </p>
      <div class="btn-row">
        <button type="button" class="btn btn--sm btn--outline" (click)="exportJson()">Export content JSON</button>
        <label class="btn btn--sm btn--outline">
          Import content JSON
          <input type="file" accept="application/json,.json" class="visually-hidden" (change)="importJson($event)" />
        </label>
        <button type="button" class="btn btn--sm btn--outline" (click)="reset()">Reset content to defaults</button>
        <button type="button" class="btn btn--sm btn--outline" (click)="clearLeads()">Delete demo enquiries</button>
      </div>
    </section>
  `,
})
export class AdminSettingsPage {
  private readonly store = inject(ContentStore);
  private readonly leads = inject(DemoLeadStore);
  private readonly fb = inject(FormBuilder);
  protected readonly message = signal<string | null>(null);
  protected readonly isError = signal(false);

  protected readonly socials = [
    { key: 'instagram' as const, label: 'Instagram' },
    { key: 'facebook' as const, label: 'Facebook' },
    { key: 'youtube' as const, label: 'YouTube' },
  ];

  protected readonly form = this.fb.nonNullable.group({
    whatsappNumber: ['', whatsappValidator],
    instagram: ['', httpsValidator],
    facebook: ['', httpsValidator],
    youtube: ['', httpsValidator],
  });

  constructor() {
    effect(() => {
      const s = this.store.settings();
      untracked(() =>
        this.form.setValue({
          whatsappNumber: s.whatsappNumber ?? '',
          instagram: s.social.instagram ?? '',
          facebook: s.social.facebook ?? '',
          youtube: s.social.youtube ?? '',
        }),
      );
    });
  }

  protected save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.store.saveSettings({
      whatsappNumber: normaliseWhatsAppNumber(v.whatsappNumber),
      social: {
        instagram: v.instagram.trim() || null,
        facebook: v.facebook.trim() || null,
        youtube: v.youtube.trim() || null,
      },
    });
    this.flash('Settings saved in this browser.');
  }

  protected exportJson(): void {
    const stamp = new Date().toISOString().slice(0, 10);
    downloadText(`sweet-estate-content-${stamp}.json`, JSON.stringify(this.store.snapshot(), null, 2), 'application/json');
  }

  protected importJson(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 2_000_000) {
      this.flash('That file is too large.', true);
      return;
    }
    file.text().then((text) => {
      const result = this.store.importSnapshot(text);
      this.flash(result.ok ? 'Content imported.' : result.error, !result.ok);
      input.value = '';
    });
  }

  protected reset(): void {
    if (confirm('Reset all products, branches, offers and settings to the original data? Local edits will be lost.')) {
      this.store.resetToDefaults();
      this.flash('Content reset to defaults.');
    }
  }

  protected clearLeads(): void {
    if (confirm('Delete all demo enquiries stored in this browser?')) {
      this.leads.clear();
      this.flash('Demo enquiries deleted.');
    }
  }

  private flash(text: string, error = false): void {
    this.message.set(text);
    this.isError.set(error);
  }
}
