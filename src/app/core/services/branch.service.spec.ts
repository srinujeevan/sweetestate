import { TestBed } from '@angular/core/testing';
import { BRANCHES } from '../data/branches.data';
import { BranchService, directionsUrl, formatAddress, verifiedDeliveryUrl } from './branch.service';

describe('Branch helpers', () => {
  const hb = BRANCHES.find((b) => b.id === 'hb-colony')!;
  const pending = BRANCHES.find((b) => b.status === 'details-pending')!;

  it('formats the full supplied address', () => {
    expect(formatAddress(hb.address!)).toBe(
      '181-3-4, H.B. Colony Rd, MIG-27, Durga Nagar, H.B. Colony, Visakhapatnam, Andhra Pradesh 530022',
    );
  });

  it('builds a Google Maps search URL from the address', () => {
    const url = directionsUrl(hb)!;
    expect(url.startsWith('https://www.google.com/maps/search/?api=1&query=')).toBeTrue();
    expect(decodeURIComponent(url)).toContain('530022');
  });

  it('gives no directions for branches without an address', () => {
    expect(directionsUrl(pending)).toBeNull();
  });

  it('only accepts https links on the matching platform domain', () => {
    expect(verifiedDeliveryUrl('swiggy', 'https://www.swiggy.com/restaurants/x')).toContain('swiggy.com');
    expect(verifiedDeliveryUrl('zomato', 'https://www.zomato.com/visakhapatnam/x')).toContain('zomato.com');
    expect(verifiedDeliveryUrl('swiggy', 'http://www.swiggy.com/x')).toBeNull();
    expect(verifiedDeliveryUrl('swiggy', 'https://www.zomato.com/x')).toBeNull();
    expect(verifiedDeliveryUrl('zomato', 'https://zomato.com.evil.example/x')).toBeNull();
    expect(verifiedDeliveryUrl('zomato', 'not a url')).toBeNull();
    expect(verifiedDeliveryUrl('zomato', null)).toBeNull();
  });
});

describe('BranchService', () => {
  it('separates active and pending branches', () => {
    const service = TestBed.inject(BranchService);
    expect(service.all().length).toBe(5);
    expect(service.active().map((b) => b.slug)).toEqual(['hb-colony', 'seethammadhara', 'madhavadhara']);
    expect(service.withPhone().length).toBe(2);
    expect(service.bySlug('branch-4')).toBeUndefined();
  });
});
