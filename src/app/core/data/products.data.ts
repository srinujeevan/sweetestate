import { Product, ProductImage, ProductVariant } from '../models/product.model';
import { STOCK_PHOTOS, StockPhotoKey } from './stock-photos.data';

/**
 * Initial catalogue — exactly the supplied items, spellings and prices (INR).
 *
 * Prices are indicative listing prices, not confirmed in-store prices.
 * Availability is unknown (null) — the site never claims stock.
 * The supplied listing marks every item below as vegetarian.
 *
 * Images: products use licensed REPRESENTATIVE photos (see stock-photos.data.ts),
 * labelled as such on the site. Products without a suitable photo (White Angure,
 * Pongadalu) show a decorative pattern rather than a photo of a different sweet.
 * To use the shop's own photography, place the file in /public/images/products/
 * and set `image: { src: 'images/products/<file>.jpg', alt: '...', isPlaceholder: false, credit: null }`.
 */

/** Representative photo per product id. */
const PHOTO_BY_PRODUCT: Partial<Record<string, StockPhotoKey>> = {
  chandrakala: 'chandrakala',
  'mysore-pak': 'mysorePak',
  'bellam-gavvalu': 'gavvalu',
  'dry-fruit-halwa': 'dryFruitHalwa',
  'bellam-sunnundlu': 'sunnundalu',
  'sugar-free-sunnundalu': 'sunnundalu',
  'panchadara-sunnundalu': 'sunnundalu',
  'sugar-free-putharekulu': 'pootharekulu',
  'panchadara-putharekulu': 'pootharekulu',
  'bellam-putharekulu': 'pootharekulu',
  'ariselu-plain': 'ariselu',
  'ariselu-nuvvu': 'ariselu2',
  gulabipulu: 'roseCookies',
};

function imageFor(productId: string): ProductImage | null {
  const key = PHOTO_BY_PRODUCT[productId];
  if (!key) return null;
  const photo = STOCK_PHOTOS[key];
  return { src: photo.src, alt: photo.alt, isPlaceholder: true, credit: photo.credit };
}

const PIECE = '1 piece';
const QUARTER_KG = '250 grams';

function v(productId: string, label: string, price: number): ProductVariant {
  const suffix = label === PIECE ? 'piece' : '250g';
  return { id: `${productId}-${suffix}`, label, price, available: null };
}

interface Seed {
  id: string;
  name: string;
  categoryId: string;
  variants: [label: string, price: number][];
  bestseller?: boolean;
  description: string;
}

const SEEDS: Seed[] = [
  // Recommended / Bestseller items
  {
    id: 'chandrakala',
    name: 'Chandrakala',
    categoryId: 'traditional-andhra-sweets',
    variants: [
      [QUARTER_KG, 380],
      [PIECE, 25],
    ],
    bestseller: true,
    description: 'A Sweet Estate bestseller, available by the piece or in a 250 gram pack.',
  },
  {
    id: 'mysore-pak',
    name: 'Mysore Pak',
    categoryId: 'traditional-andhra-sweets',
    variants: [[PIECE, 15]],
    bestseller: true,
    description: 'A much-loved classic from our recommended selection, sold by the piece.',
  },
  {
    id: 'bellam-gavvalu',
    name: 'Bellam Gavvalu',
    categoryId: 'traditional-andhra-sweets',
    variants: [[QUARTER_KG, 340]],
    bestseller: true,
    description: 'A traditional Andhra favourite from our recommended selection, in a 250 gram pack.',
  },
  {
    id: 'white-angure',
    name: 'White Angure',
    categoryId: 'traditional-andhra-sweets',
    variants: [[QUARTER_KG, 450]],
    bestseller: true,
    description: 'From our recommended selection, available in a 250 gram pack.',
  },
  {
    id: 'dry-fruit-halwa',
    name: 'Dry Fruit Halwa',
    categoryId: 'dry-fruit-sweets',
    variants: [[PIECE, 30]],
    bestseller: true,
    description: 'A recommended pick from our counter, sold by the piece.',
  },
  // Home Foods
  {
    id: 'bellam-sunnundlu',
    name: 'Bellam Sunnundlu',
    categoryId: 'home-foods',
    variants: [[QUARTER_KG, 580]],
    description: 'From our Home Foods range, in a 250 gram pack.',
  },
  {
    id: 'pongadalu',
    name: 'Pongadalu',
    categoryId: 'home-foods',
    variants: [[QUARTER_KG, 340]],
    description: 'From our Home Foods range, in a 250 gram pack.',
  },
  {
    id: 'gulabipulu',
    name: 'Gulabipulu',
    categoryId: 'home-foods',
    variants: [[PIECE, 85]],
    description: 'From our Home Foods range, sold by the piece.',
  },
  {
    id: 'sugar-free-sunnundalu',
    name: 'Sugar Free Sunnundalu',
    categoryId: 'home-foods',
    variants: [
      [PIECE, 35],
      [QUARTER_KG, 750],
    ],
    description: 'From our Home Foods range, by the piece or in a 250 gram pack.',
  },
  {
    id: 'sugar-free-putharekulu',
    name: 'Sugar Free Putharekulu',
    categoryId: 'home-foods',
    variants: [[PIECE, 35]],
    description: 'From our Home Foods range, sold by the piece.',
  },
  {
    id: 'panchadara-putharekulu',
    name: 'Panchadara Putharekulu',
    categoryId: 'home-foods',
    variants: [[PIECE, 30]],
    description: 'From our Home Foods range, sold by the piece.',
  },
  {
    id: 'panchadara-sunnundalu',
    name: 'Panchadara Sunnundalu',
    categoryId: 'home-foods',
    variants: [
      [PIECE, 30],
      [QUARTER_KG, 580],
    ],
    description: 'From our Home Foods range, by the piece or in a 250 gram pack.',
  },
  {
    id: 'bellam-putharekulu',
    name: 'Bellam Putharekulu',
    categoryId: 'home-foods',
    variants: [[PIECE, 30]],
    description: 'From our Home Foods range, sold by the piece.',
  },
  {
    id: 'ariselu-plain',
    name: 'Ariselu Plain',
    categoryId: 'home-foods',
    variants: [
      [PIECE, 20],
      [QUARTER_KG, 340],
    ],
    description: 'From our Home Foods range, by the piece or in a 250 gram pack.',
  },
  {
    id: 'ariselu-nuvvu',
    name: 'Ariselu Nuvvu',
    categoryId: 'home-foods',
    variants: [[QUARTER_KG, 380]],
    description: 'From our Home Foods range, in a 250 gram pack.',
  },
];

export const PRODUCTS: Product[] = SEEDS.map((seed, index) => ({
  id: seed.id,
  slug: seed.id,
  name: seed.name,
  categoryId: seed.categoryId,
  shortDescription: seed.description,
  image: imageFor(seed.id),
  variants: seed.variants.map(([label, price]) => v(seed.id, label, price)),
  bestseller: seed.bestseller ?? false,
  featured: seed.bestseller ?? false,
  vegetarian: true,
  active: true,
  sortOrder: index + 1,
}));
