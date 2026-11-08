import { Injectable, computed, inject } from '@angular/core';
import { SITE_CONFIG } from '../config/site.config';
import { Branch, BranchAddress, DeliveryPlatform } from '../models/branch.model';
import { ContentStore } from '../state/content.store';

const PLATFORM_HOSTS: Record<DeliveryPlatform, string> = {
  swiggy: 'swiggy.com',
  zomato: 'zomato.com',
};

export function formatAddress(address: BranchAddress): string {
  const tail = `${address.locality}, ${address.region}${address.postalCode ? ' ' + address.postalCode : ''}`;
  return `${address.streetAddress}, ${tail}`;
}

/** Google Maps search URL built only from the supplied address. */
export function directionsUrl(branch: Branch): string | null {
  if (!branch.address) return null;
  const query = `${SITE_CONFIG.legalName}, ${formatAddress(branch.address)}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/**
 * Returns the URL only if it is an https link on the expected platform domain.
 * Guards against typos or non-platform links being shown as ordering links.
 */
export function verifiedDeliveryUrl(platform: DeliveryPlatform, url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = PLATFORM_HOSTS[platform];
    const okHost = parsed.hostname === host || parsed.hostname.endsWith('.' + host);
    return parsed.protocol === 'https:' && okHost ? parsed.toString() : null;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class BranchService {
  private readonly store = inject(ContentStore);

  /** All five slots, including those awaiting details. */
  readonly all = computed(() => [...this.store.branches()].sort((a, b) => a.sortOrder - b.sortOrder));
  readonly active = computed(() => this.all().filter((b) => b.status === 'active'));
  readonly pending = computed(() => this.all().filter((b) => b.status !== 'active'));
  readonly withPhone = computed(() => this.active().filter((b) => !!b.phone));

  bySlug(slug: string): Branch | undefined {
    return this.active().find((b) => b.slug === slug);
  }

  byId(id: string | null | undefined): Branch | undefined {
    return id ? this.all().find((b) => b.id === id) : undefined;
  }
}
