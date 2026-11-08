export type CategoryGroup = 'sweets' | 'bakery-food';

export interface Category {
  id: string;
  name: string;
  description: string;
  group: CategoryGroup;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  /** Pack / unit exactly as supplied, e.g. '250 grams' or '1 piece'. */
  label: string;
  /** Indicative price in INR. */
  price: number;
  /** null = unknown. The site never claims stock availability. */
  available: boolean | null;
}

export interface ProductImage {
  /** Path under /public, e.g. 'images/products/chandrakala.webp'. */
  src: string;
  alt: string;
  /**
   * true while the image is a representative stand-in rather than the shop's own
   * product photography. Shown on the site as "Representative photo".
   */
  isPlaceholder: boolean;
  /** Attribution for licensed third-party photos; null for the shop's own photos. */
  credit?: ImageCredit | null;
}

export interface ImageCredit {
  title: string;
  author: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  shortDescription: string;
  /** null → a decorative pattern is shown instead of a photo. */
  image: ProductImage | null;
  variants: ProductVariant[];
  bestseller: boolean;
  featured: boolean;
  /** Only true where the supplied listing marks the item vegetarian. */
  vegetarian: boolean;
  active: boolean;
  sortOrder: number;
}
