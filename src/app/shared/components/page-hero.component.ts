import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface Crumb {
  label: string;
  path?: string;
}

/** Inner-page header with breadcrumbs, title and lead text. Extra content is projected below. */
@Component({
  selector: 'app-page-hero',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page-hero">
      <div class="container">
        @if (crumbs().length) {
          <nav class="breadcrumbs" aria-label="Breadcrumb">
            <ol>
              <li><a routerLink="/">Home</a></li>
              @for (c of crumbs(); track c.label; let last = $last) {
                <li>
                  @if (c.path && !last) {
                    <a [routerLink]="c.path">{{ c.label }}</a>
                  } @else {
                    <span [attr.aria-current]="last ? 'page' : null">{{ c.label }}</span>
                  }
                </li>
              }
            </ol>
          </nav>
        }
        @if (eyebrow()) {
          <p class="eyebrow">{{ eyebrow() }}</p>
        }
        <h1>{{ title() }}</h1>
        @if (lead()) {
          <p class="lead">{{ lead() }}</p>
        }
        <ng-content />
      </div>
    </section>
  `,
})
export class PageHeroComponent {
  readonly title = input.required<string>();
  readonly lead = input<string | null>(null);
  readonly eyebrow = input<string | null>(null);
  readonly crumbs = input<Crumb[]>([]);
}
