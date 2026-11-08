import { Offer } from '../../core/models/offer.model';
import { isOfferCurrent } from './offers.page';

describe('isOfferCurrent', () => {
  const base: Offer = {
    id: 'o1',
    title: 'Test',
    description: 'Test',
    validFrom: null,
    validUntil: null,
    branchIds: [],
    terms: null,
    active: true,
  };

  it('respects the active flag', () => {
    expect(isOfferCurrent(base, '2026-06-01')).toBeTrue();
    expect(isOfferCurrent({ ...base, active: false }, '2026-06-01')).toBeFalse();
  });

  it('respects start and end dates (inclusive)', () => {
    const o = { ...base, validFrom: '2026-06-01', validUntil: '2026-06-30' };
    expect(isOfferCurrent(o, '2026-05-31')).toBeFalse();
    expect(isOfferCurrent(o, '2026-06-01')).toBeTrue();
    expect(isOfferCurrent(o, '2026-06-30')).toBeTrue();
    expect(isOfferCurrent(o, '2026-07-01')).toBeFalse();
  });
});
