import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE_CONFIG } from '../../core/config/site.config';
import { PageHeroComponent } from '../../shared/components/page-hero.component';
import { LegalReviewNoticeComponent } from './legal-review-notice.component';

@Component({
  selector: 'app-privacy-page',
  imports: [RouterLink, PageHeroComponent, LegalReviewNoticeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero title="Privacy Policy" [crumbs]="[{ label: 'Privacy Policy' }]" />
    <section class="section">
      <div class="container">
        <div class="prose">
          <app-legal-review-notice />

          <p>
            This policy explains how {{ site.legalName }} (“Sweet Estate”, “we”) handles information you share through
            this website.
          </p>

          <h2>Information we collect</h2>
          <ul>
            <li>
              <strong>Enquiry forms</strong> (contact and bulk orders): your name, phone number, optional email address,
              the details of your enquiry, your preferred branch, and whether you agreed to be contacted.
            </li>
            <li>
              <strong>Technical context</strong> sent with a form: the page you submitted it from, the page you first
              landed on, campaign (UTM) tags in the link you followed, and the time of submission.
            </li>
            <li>
              <strong>Analytics</strong> (only if enabled and only with your consent): anonymous usage information
              through Google Analytics.
            </li>
          </ul>

          <h2>How we use it</h2>
          <ul>
            <li>To reply to your enquiry by phone, WhatsApp or email, as you requested.</li>
            <li>To prepare quotes and fulfil bulk or event orders you ask about.</li>
            <li>To understand which pages and campaigns help customers find us.</li>
          </ul>
          <p>
            Submitting an enquiry does <strong>not</strong> subscribe you to marketing messages. We will only send
            promotional messages if you separately agree to receive them.
          </p>

          <h2>Third-party services</h2>
          <p>
            Links to Swiggy, Zomato, WhatsApp and Google Maps take you to services run by those companies. Their own
            privacy policies apply when you use them.
          </p>

          <h2>Retention and your choices</h2>
          <p>
            We keep enquiry details only as long as needed to respond and for reasonable record-keeping. You can ask us
            to access, correct or delete your information by contacting a branch or using our
            <a routerLink="/contact">contact form</a>.
          </p>

          <h2>Browser storage</h2>
          <p>
            The site stores small items in your browser (for example, your analytics choice and the campaign tags of
            your visit). No advertising cookies are used.
          </p>

          <h2>Contact</h2>
          <p>For privacy questions, please reach us through the <a routerLink="/contact">contact page</a>.</p>
        </div>
      </div>
    </section>
  `,
})
export class PrivacyPage {
  protected readonly site = SITE_CONFIG;
}
