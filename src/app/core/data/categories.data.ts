import { Category } from '../models/product.model';

/**
 * Catalogue categories. Categories without products show an
 * "Explore in store / enquire" message instead of invented items.
 */
export const CATEGORIES: Category[] = [
  {
    id: 'traditional-andhra-sweets',
    name: 'Traditional Andhra Sweets',
    description: 'Regional favourites from the Sweet Estate counter.',
    group: 'sweets',
    sortOrder: 1,
  },
  {
    id: 'ghee-sweets',
    name: 'Ghee Sweets',
    description: 'Ask at your nearest branch for today’s ghee sweets.',
    group: 'sweets',
    sortOrder: 2,
  },
  {
    id: 'milk-sweets',
    name: 'Milk Sweets',
    description: 'Ask at your nearest branch for today’s milk sweets.',
    group: 'sweets',
    sortOrder: 3,
  },
  {
    id: 'dry-fruit-sweets',
    name: 'Dry Fruit Sweets',
    description: 'Dry fruit specialities from our counter.',
    group: 'sweets',
    sortOrder: 4,
  },
  {
    id: 'home-foods',
    name: 'Home Foods',
    description: 'Home-style Andhra favourites such as Sunnundalu, Putharekulu and Ariselu.',
    group: 'sweets',
    sortOrder: 5,
  },
  {
    id: 'bakery',
    name: 'Bakery',
    description: 'Fresh bakery treats — visit a branch to see today’s selection.',
    group: 'bakery-food',
    sortOrder: 6,
  },
  {
    id: 'snacks-savouries',
    name: 'Snacks & Savouries',
    description: 'Savoury snacks to go with your sweets — ask in store.',
    group: 'bakery-food',
    sortOrder: 7,
  },
  {
    id: 'beverages',
    name: 'Beverages',
    description: 'Ask at your nearest branch about beverages.',
    group: 'bakery-food',
    sortOrder: 8,
  },
  {
    id: 'gift-boxes',
    name: 'Gift Boxes & Hampers',
    description: 'Gift boxes for festivals, weddings and corporate gifting — enquire for options.',
    group: 'bakery-food',
    sortOrder: 9,
  },
];
