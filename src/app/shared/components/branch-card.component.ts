import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Branch } from '../../core/models/branch.model';
import { directionsUrl, formatAddress } from '../../core/services/branch.service';
import { TrackClickDirective } from '../directives/track-click.directive';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-branch-card',
  imports: [RouterLink, IconComponent, TrackClickDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (branch().status === 'active') {
      <article class="bcard">
        <header class="bcard__head">
          <div>
            <h3 class="bcard__name">
              <a [routerLink]="['/branches', branch().slug]">{{ branch().name }}</a>
            </h3>
            @if (branch().area) {
              <p class="bcard__area">{{ branch().area }}</p>
            }
          </div>
          @if (branch().isMain) {
            <span class="badge badge--gold">Main branch</span>
          }
        </header>

        <dl class="detail-list">
          <div>
            <app-icon name="pin" />
            <div><dt>Address</dt><dd>{{ address() }}</dd></div>
          </div>
          <div>
            <app-icon name="clock" />
            <div>
              <dt>Hours</dt>
              <dd>{{ branch().hours?.summary ?? 'Please contact the branch for timings' }}</dd>
            </div>
          </div>
          <div>
            <app-icon name="phone" />
            <div>
              <dt>Phone</dt>
              <dd>
                @if (branch().phone; as phone) {
                  {{ phone.display }}
                } @else {
                  <span class="muted">Number not yet listed</span>
                }
              </dd>
            </div>
          </div>
        </dl>

        <div class="bcard__actions">
          @if (branch().phone; as phone) {
            <a
              class="btn btn--sm"
              [href]="'tel:' + phone.e164"
              appTrack="phone_click"
              [trackParams]="{ branch: branch().id, location: 'branch_card' }"
            >
              <app-icon name="phone" [size]="16" /> Call
            </a>
          }
          @if (directions(); as url) {
            <a
              class="btn btn--sm btn--outline"
              [href]="url"
              target="_blank"
              rel="noopener noreferrer"
              appTrack="directions_click"
              [trackParams]="{ branch: branch().id, location: 'branch_card' }"
            >
              <app-icon name="directions" [size]="16" /> Get directions
              <span class="visually-hidden">(opens Google Maps)</span>
            </a>
          }
          <a [routerLink]="['/branches', branch().slug]" class="link-arrow bcard__more">Branch details</a>
        </div>
      </article>
    } @else {
      <article class="bcard bcard--pending">
        <app-icon name="store" [size]="28" />
        <h3 class="bcard__name">Another Sweet Estate branch</h3>
        <p class="muted">Details coming soon. Contact any listed branch for help in the meantime.</p>
      </article>
    }
  `,
  styles: `
    :host { display: block; }
    .bcard { height: 100%; display: flex; flex-direction: column; gap: 20px; background: var(--c-ivory); border: 1px solid var(--c-border); border-radius: var(--radius); padding: 24px; box-shadow: var(--shadow-sm); }
    .bcard__head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
    .bcard__name { margin: 0; font-size: 1.375rem; }
    .bcard__name a { color: var(--c-primary-dark); text-decoration: none; }
    .bcard__name a:hover { text-decoration: underline; }
    .bcard__area { margin: 2px 0 0; color: var(--c-muted); font-size: .9375rem; }
    .bcard__actions { margin-top: auto; display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
    .bcard__more { margin-left: auto; font-size: .9375rem; }
    .bcard--pending { align-items: flex-start; justify-content: center; gap: 8px; box-shadow: none; border-style: dashed; border-color: var(--c-border-strong); background: transparent; color: var(--c-gold-text); }
    .bcard--pending p { margin: 0; }
  `,
})
export class BranchCardComponent {
  readonly branch = input.required<Branch>();
  protected readonly address = computed(() => {
    const a = this.branch().address;
    return a ? formatAddress(a) : '';
  });
  protected readonly directions = computed(() => directionsUrl(this.branch()));
}
