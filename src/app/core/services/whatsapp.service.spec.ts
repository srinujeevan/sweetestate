import { TestBed } from '@angular/core/testing';
import { PRODUCTS } from '../data/products.data';
import { ContentStore } from '../state/content.store';
import { WhatsAppMessages, WhatsAppService, buildWhatsAppUrl, normaliseWhatsAppNumber } from './whatsapp.service';

describe('WhatsApp helpers', () => {
  it('accepts numbers with country code and strips formatting', () => {
    expect(normaliseWhatsAppNumber('+91 98765-43210')).toBe('919876543210');
  });

  it('rejects empty, too short, or leading-zero numbers', () => {
    expect(normaliseWhatsAppNumber(null)).toBeNull();
    expect(normaliseWhatsAppNumber('')).toBeNull();
    expect(normaliseWhatsAppNumber('12345')).toBeNull();
    expect(normaliseWhatsAppNumber('09876543210')).toBeNull();
    expect(normaliseWhatsAppNumber('91abc')).toBeNull();
  });

  it('returns no link when the number is missing or invalid', () => {
    expect(buildWhatsAppUrl(null, 'hi')).toBeNull();
    expect(buildWhatsAppUrl('123', 'hi')).toBeNull();
  });

  it('builds a wa.me link with an encoded message', () => {
    const url = buildWhatsAppUrl('919876543210', 'Hello & ₹30?');
    expect(url).toBe('https://wa.me/919876543210?text=' + encodeURIComponent('Hello & ₹30?'));
  });

  it('prefills product and variant details', () => {
    const p = PRODUCTS.find((x) => x.id === 'chandrakala')!;
    const msg = WhatsAppMessages.product(p, p.variants[0]);
    expect(msg).toContain('Chandrakala');
    expect(msg).toContain('250 grams');
    expect(msg).toContain('₹380');
  });
});

describe('WhatsAppService', () => {
  it('is not configured by default (no number has been supplied)', () => {
    const service = TestBed.inject(WhatsAppService);
    expect(service.isConfigured()).toBeFalse();
    expect(service.link('hi')).toBeNull();
  });

  it('produces links once a valid number is configured', () => {
    const store = TestBed.inject(ContentStore);
    const service = TestBed.inject(WhatsAppService);
    store.saveSettings({ whatsappNumber: '919876543210', social: { instagram: null, facebook: null, youtube: null } });
    expect(service.link('hi')).toBe('https://wa.me/919876543210?text=hi');
    store.resetToDefaults();
  });
});
