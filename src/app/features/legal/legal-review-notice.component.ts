import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-legal-review-notice',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="notice notice--demo" role="note" style="margin-bottom: 32px">
      <p>
        <strong>Draft for business and legal review.</strong> This starter text must be reviewed and approved
        (including against India’s Digital Personal Data Protection Act, 2023) before the website goes live.
      </p>
    </div>
  `,
})
export class LegalReviewNoticeComponent {}
