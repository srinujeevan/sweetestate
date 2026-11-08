import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Branch } from '../../core/models/branch.model';
import { verifiedDeliveryUrl } from '../../core/services/branch.service';
import { ContentStore } from '../../core/state/content.store';

@Component({
  selector: 'app-admin-branches',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-head">
      <div>
        <h1>Branches</h1>
        <p>Five branch slots. Fill in a pending slot and set it to “Active” once the owner confirms its details.</p>
      </div>
    </div>
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>Branch</th><th>Status</th><th>Missing information</th><th><span class="visually-hidden">Actions</span></th></tr></thead>
        <tbody>
          @for (b of branches(); track b.id) {
            <tr>
              <td><strong>{{ b.name }}</strong><br /><span class="small muted">{{ b.area }}</span></td>
              <td>
                <span class="status" [class.status--converted]="b.status === 'active'" [class.status--new]="b.status !== 'active'">
                  {{ b.status === 'active' ? 'Active' : 'Details pending' }}
                </span>
              </td>
              <td class="small">{{ missing(b) || '—' }}</td>
              <td><a [routerLink]="['/admin/branches', b.id]" class="btn btn--sm btn--outline">Edit</a></td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class AdminBranchesPage {
  private readonly store = inject(ContentStore);
  protected readonly branches = computed(() => [...this.store.branches()].sort((a, b) => a.sortOrder - b.sortOrder));

  protected missing(b: Branch): string {
    const gaps: string[] = [];
    if (!b.address) gaps.push('address');
    if (!b.hours) gaps.push('hours');
    if (!b.phone) gaps.push('phone');
    if (!verifiedDeliveryUrl('swiggy', b.deliveryLinks.swiggy)) gaps.push('Swiggy link');
    if (!verifiedDeliveryUrl('zomato', b.deliveryLinks.zomato)) gaps.push('Zomato link');
    return gaps.join(', ');
  }
}
