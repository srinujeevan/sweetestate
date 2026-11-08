import { Injectable, computed, inject } from '@angular/core';
import { SITE_CONFIG } from '../config/site.config';
import { Branch } from '../models/branch.model';
import { Product, ProductVariant } from '../models/product.model';
import { ContentStore } from '../state/content.store';

/**
 * Validates a WhatsApp number: digits only (spaces, dashes, '+' are stripped),
 * country code included, 10–15 digits, no leading zero.
 */
export function normaliseWhatsAppNumber(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/[\s\-()+]/g, '');
  return /^[1-9]\d{9,14}$/.test(digits) ? digits : null;
}

export function buildWhatsAppUrl(number: string | null, message: string): string | null {
  const valid = normaliseWhatsAppNumber(number);
  return valid ? `https://wa.me/${valid}?text=${encodeURIComponent(message)}` : null;
}

const GREETING = `Hello ${SITE_CONFIG.brandName},`;

/** Contextual pre-filled messages. */
export const WhatsAppMessages = {
  general: (): string => `${GREETING} I have a question.`,

  product: (product: Product, variant?: ProductVariant | null): string =>
    variant
      ? `${GREETING} I'd like to enquire about ${product.name} (${variant.label}, listed at ₹${variant.price}). Could you confirm the price and availability?`
      : `${GREETING} I'd like to enquire about ${product.name}. Could you confirm the price and availability?`,

  category: (categoryName: string): string =>
    `${GREETING} I'd like to know what is available in ${categoryName}.`,

  branch: (branch: Branch): string => `${GREETING} I have a question about your ${branch.name} branch.`,

  bulk: (occasion?: string | null): string =>
    occasion
      ? `${GREETING} I'd like to enquire about a bulk order for a ${occasion.toLowerCase()}.`
      : `${GREETING} I'd like to enquire about a bulk / gifting order.`,

  ordering: (): string => `${GREETING} I'd like to place an order. Could you help me?`,
};

@Injectable({ providedIn: 'root' })
export class WhatsAppService {
  private readonly store = inject(ContentStore);

  readonly number = computed(() => normaliseWhatsAppNumber(this.store.settings().whatsappNumber));
  readonly isConfigured = computed(() => this.number() !== null);

  /** wa.me link, or null when no valid number is configured. */
  link(message: string): string | null {
    return buildWhatsAppUrl(this.number(), message);
  }
}
