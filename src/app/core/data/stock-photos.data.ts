import { ImageCredit } from '../models/product.model';

/**
 * Royalty-free REPRESENTATIVE photos from Wikimedia Commons (CC BY-SA licences).
 *
 * These are NOT photographs of Sweet Estate's own products. They are labelled
 * "Representative photo" on the site and credited on /image-credits, as the
 * licences require. Replace them with the shop's own photography when available:
 * put the file in /public/images/products/ and set the product's `image` with
 * `isPlaceholder: false` and `credit: null`.
 */
export interface StockPhoto {
  src: string;
  /** Describes what is actually shown. */
  alt: string;
  credit: ImageCredit;
}

const BY_SA_4 = { license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/' };
const BY_SA_3 = { license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/' };
const BY_SA_2 = { license: 'CC BY-SA 2.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/' };
const BY_2 = { license: 'CC BY 2.0', licenseUrl: 'https://creativecommons.org/licenses/by/2.0/' };
const COMMONS = 'https://commons.wikimedia.org/wiki/File:';

export const STOCK_PHOTOS = {
  chandrakala: {
    src: 'images/sweets/chandrakala.jpg',
    alt: 'Chandrakala sweets arranged on a yellow plate',
    credit: { title: 'Chandrakala sweet', author: 'Thamizhpparithi Maari', ...BY_SA_4, sourceUrl: COMMONS + 'Chandrakala_sweet.jpg' },
  },
  mysorePak: {
    src: 'images/sweets/mysore-pak.jpg',
    alt: 'Squares of Mysore Pak on a black tray beside a lit diya',
    credit: { title: 'Ghee Mysore Pak', author: 'Vaidehi Pujary', ...BY_SA_4, sourceUrl: COMMONS + 'Ghee_Mysore_Pak.jpg' },
  },
  gavvalu: {
    src: 'images/sweets/gavvalu.jpg',
    alt: 'Shell-shaped gavvalu on a white plate',
    credit: { title: 'Andhra sweet - Gavvalu', author: 'విశ్వనాధ్.బి.కె.', ...BY_SA_3, sourceUrl: COMMONS + 'Andhra_sweet_-_Gavvalu.jpg' },
  },
  dryFruitHalwa: {
    src: 'images/sweets/dry-fruit-halwa.jpg',
    alt: 'A piece of dry fruit halwa topped with sliced almonds',
    credit: { title: 'Dry fruit halwa', author: 'Thamizhpparithi Maari', ...BY_SA_4, sourceUrl: COMMONS + 'Dry_fruit_halwa.jpg' },
  },
  sunnundalu: {
    src: 'images/sweets/sunnundalu.jpg',
    alt: 'Three round sunnundalu on a white plate',
    credit: { title: 'Sunnundalu (sweet)', author: 'K.Venkataramana', ...BY_SA_4, sourceUrl: COMMONS + 'Sunnundalu_(sweet).jpg' },
  },
  pootharekulu: {
    src: 'images/sweets/pootharekulu.jpg',
    alt: 'Folded and rolled pootharekulu on a steel plate',
    credit: {
      title: 'Pootharekulu from Atreyapuram',
      author: 'విశ్వనాధ్.బి.కె.',
      ...BY_SA_4,
      sourceUrl:
        COMMONS +
        'Pootharekulu_or_Poothareku_(singular)_is_a_popular_sweet_from_Atreyapuram,_East_Godavari_District_of_Andhrapradesh.JPG',
    },
  },
  ariselu: {
    src: 'images/sweets/ariselu.jpg',
    alt: 'Golden-brown ariselu on a plate',
    credit: { title: 'Ariselu', author: 'T.sujatha', ...BY_SA_3, sourceUrl: COMMONS + 'Ariselu.jpg' },
  },
  ariselu2: {
    src: 'images/sweets/ariselu-2.jpg',
    alt: 'Ariselu in a steel bowl',
    credit: {
      title: 'Ariselu or Adhirasam',
      author: 'Jagisnowjughead',
      ...BY_SA_4,
      sourceUrl: COMMONS + 'Ariselu_or_Adhirasam_or_Kajjaya_or_Athirasa.jpg',
    },
  },
  roseCookies: {
    src: 'images/sweets/rose-cookies.jpg',
    alt: 'Flower-shaped rose cookies on a floral plate',
    credit: { title: 'Achappam (rose cookies)', author: 'John C', ...BY_SA_3, sourceUrl: COMMONS + 'Achappam.jpg' },
  },
  kakinadaKaja: {
    src: 'images/sweets/kakinada-kaja.jpg',
    alt: 'Close-up of layered Kakinada kaja',
    credit: { title: 'Kaja from Kakinada', author: 'Deepak Vallamsetti', ...BY_SA_4, sourceUrl: COMMONS + 'Kaja_from_Kakinada.jpg' },
  },
  // Gift box gallery (home page). Generic boxes, not Sweet Estate packaging.
  giftBoxGold: {
    src: 'images/gifts/gift-box-gold.jpg',
    alt: 'Gold-lined gift box with nine assorted sweets in three compartments',
    credit: { title: 'Assorted Sweets, Mehsana', author: 'Nizil Shah', ...BY_SA_4, sourceUrl: COMMONS + 'Assorted_Sweets_-_Mehsana_-_Gujarat_-_1.jpg' },
  },
  assortedBox1: {
    src: 'images/gifts/assorted-box-1.jpg',
    alt: 'Festive sweet box with twelve compartments of colourful mithai',
    credit: { title: 'Sweets Diwali Mithai India', author: 'Krista', ...BY_2, sourceUrl: COMMONS + 'Sweets_Diwali_Mithai_India.jpg' },
  },
  assortedBox2: {
    src: 'images/gifts/assorted-box-2.jpg',
    alt: 'Box filled with assorted burfis topped with almonds and pistachios',
    credit: {
      title: 'A box full of burfis',
      author: 'secretlondon123',
      ...BY_SA_2,
      sourceUrl: COMMONS + 'A_box_full_of_burfis,_Mithai_Indian_Sweets_London_November_2009.jpg',
    },
  },
  assortedBox3: {
    src: 'images/gifts/assorted-box-3.jpg',
    alt: 'Sweet box with chum chum and silver-leaf barfi',
    credit: { title: 'Sweets box', author: 'Krista', ...BY_2, sourceUrl: COMMONS + 'Mithaas_sweets_box_Indian_food.jpg' },
  },
} satisfies Record<string, StockPhoto>;

export type StockPhotoKey = keyof typeof STOCK_PHOTOS;
