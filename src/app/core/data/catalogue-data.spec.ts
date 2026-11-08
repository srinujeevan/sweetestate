import { BRANCHES } from './branches.data';
import { CATEGORIES } from './categories.data';
import { PRODUCTS } from './products.data';

/** Guards the supplied business data against accidental edits. */
describe('Supplied catalogue data', () => {
  const EXPECTED: [string, string, number][] = [
    // Recommended / Bestseller
    ['Chandrakala', '250 grams', 380],
    ['Chandrakala', '1 piece', 25],
    ['Mysore Pak', '1 piece', 15],
    ['Bellam Gavvalu', '250 grams', 340],
    ['White Angure', '250 grams', 450],
    ['Dry Fruit Halwa', '1 piece', 30],
    // Home Foods
    ['Bellam Sunnundlu', '250 grams', 580],
    ['Pongadalu', '250 grams', 340],
    ['Gulabipulu', '1 piece', 85],
    ['Sugar Free Sunnundalu', '1 piece', 35],
    ['Sugar Free Putharekulu', '1 piece', 35],
    ['Panchadara Putharekulu', '1 piece', 30],
    ['Panchadara Sunnundalu', '1 piece', 30],
    ['Bellam Putharekulu', '1 piece', 30],
    ['Ariselu Plain', '1 piece', 20],
    ['Ariselu Plain', '250 grams', 340],
    ['Ariselu Nuvvu', '250 grams', 380],
    ['Panchadara Sunnundalu', '250 grams', 580],
    ['Sugar Free Sunnundalu', '250 grams', 750],
  ];

  const actual = PRODUCTS.flatMap((p) => p.variants.map((v) => [p.name, v.label, v.price] as [string, string, number]));

  it('contains exactly the 19 supplied variants', () => {
    expect(actual.length).toBe(19);
  });

  it('preserves every supplied name, unit and price', () => {
    for (const row of EXPECTED) {
      expect(actual).toContain(row);
    }
  });

  it('never claims availability', () => {
    expect(PRODUCTS.every((p) => p.variants.every((v) => v.available === null))).toBeTrue();
  });

  it('has unique product slugs and variant ids', () => {
    const slugs = PRODUCTS.map((p) => p.slug);
    const variantIds = PRODUCTS.flatMap((p) => p.variants.map((v) => v.id));
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(variantIds).size).toBe(variantIds.length);
  });

  it('assigns every product to a known category', () => {
    const ids = new Set(CATEGORIES.map((c) => c.id));
    expect(PRODUCTS.every((p) => ids.has(p.categoryId))).toBeTrue();
  });

  it('labels every stock photo as representative and credits it', () => {
    for (const p of PRODUCTS.filter((x) => x.image)) {
      expect(p.image!.isPlaceholder).withContext(p.id).toBeTrue();
      expect(p.image!.credit?.license).withContext(p.id).toMatch(/^CC /);
      expect(p.image!.credit?.sourceUrl).withContext(p.id).toContain('commons.wikimedia.org');
    }
  });

  it('shows no photo for products without a matching image', () => {
    expect(PRODUCTS.find((p) => p.id === 'white-angure')!.image).toBeNull();
    expect(PRODUCTS.find((p) => p.id === 'pongadalu')!.image).toBeNull();
  });

  it('supports all nine required categories', () => {
    expect(CATEGORIES.length).toBe(9);
  });
});

describe('Supplied branch data', () => {
  it('has five slots: three active, two pending without invented details', () => {
    expect(BRANCHES.length).toBe(5);
    const active = BRANCHES.filter((b) => b.status === 'active');
    const pending = BRANCHES.filter((b) => b.status !== 'active');
    expect(active.length).toBe(3);
    expect(pending.length).toBe(2);
    for (const b of pending) {
      expect(b.address).toBeNull();
      expect(b.phone).toBeNull();
      expect(b.hours).toBeNull();
    }
  });

  it('keeps the supplied phone numbers and hours', () => {
    const hb = BRANCHES.find((b) => b.id === 'hb-colony')!;
    const sd = BRANCHES.find((b) => b.id === 'seethammadhara')!;
    expect(hb.phone?.e164).toBe('+917674095588');
    expect(hb.hours?.schemaOrg).toBe('Mo-Su 09:00-21:30');
    expect(hb.address?.postalCode).toBe('530022');
    expect(sd.phone?.e164).toBe('+917842233399');
    expect(sd.hours?.schemaOrg).toBe('Mo-Su 08:00-22:00');
    expect(sd.address?.postalCode).toBe('530013');
  });

  it('does not invent phone or hours for Madhavadhara', () => {
    const md = BRANCHES.find((b) => b.id === 'madhavadhara')!;
    expect(md.phone).toBeNull();
    expect(md.hours).toBeNull();
  });

  it('has no delivery links until verified URLs are supplied', () => {
    expect(BRANCHES.every((b) => b.deliveryLinks.swiggy === null && b.deliveryLinks.zomato === null)).toBeTrue();
  });
});
