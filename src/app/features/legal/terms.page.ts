import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE_CONFIG } from '../../core/config/site.config';
import { PageHeroComponent } from '../../shared/components/page-hero.component';
import { LegalReviewNoticeComponent } from './legal-review-notice.component';

@Component({
  selector: 'app-terms-page',
  imports: [RouterLink, PageHeroComponent, LegalReviewNoticeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-hero title="Terms of Use" [crumbs]="[{ label: 'Terms of Use' }]" />
    <section class="section">
      <div class="container">
        <div class="prose">
          <app-legal-review-notice />

          <p>By using this website you agree to the following terms.</p>

          <h2>Information on this website</h2>
          <ul>
            <li>{{ site.priceDisclaimer }}</li>
            <li>Products shown may not be available at every branch or at all times. Stock is not shown online.</li>
            <li>Images may be illustrations and are not always photographs of the actual product.</li>
            <li>
              Ingredient, allergen and dietary information is not provided online. Please ask at the branch before
              buying if you have any dietary requirement or allergy.
            </li>
          </ul>

          <h2>Enquiries are not orders</h2>
          <p>
            Submitting a contact or bulk-order enquiry does not create an order or reserve stock. An order is confirmed
            only when our team confirms the products, quantity, price and date with you directly.
          </p>

          <h2>Third-party ordering</h2>
          <p>
            Orders placed through Swiggy or Zomato are governed by those platforms’ terms, including delivery coverage,
            fees, timings, cancellations and refunds.
          </p>

          <h2>Opening hours and contact details</h2>
          <p>Branch details are provided in good faith and may change. Please call ahead if you are making a special trip.</p>

          <h2>Questions</h2>
          <p>Please <a routerLink="/contact">contact us</a> with any questions about these terms.</p>
        </div>
      </div>
    </section>
  `,
})
export class TermsPage {
  protected readonly site = SITE_CONFIG;
}
