import { Branch } from '../models/branch.model';

/**
 * Branch directory.
 *
 * The business has five branches. Only three have been supplied with verified
 * details; the remaining two are 'details-pending' slots that render as
 * "Details coming soon" and get no detail page.
 *
 * To add a branch once details are confirmed: fill in a pending slot, set
 * `status: 'active'`, give it a unique `slug`, and rebuild. Leave any unknown
 * field null — the UI shows a safe fallback (e.g. "Please contact the branch
 * for timings"). Swiggy/Zomato links must be the exact store URLs confirmed
 * by the owner.
 */
export const BRANCHES: Branch[] = [
  {
    id: 'hb-colony',
    slug: 'hb-colony',
    status: 'active',
    name: 'H.B. Colony',
    area: 'Durga Nagar',
    isMain: true,
    address: {
      streetAddress: '181-3-4, H.B. Colony Rd, MIG-27, Durga Nagar, H.B. Colony',
      locality: 'Visakhapatnam',
      region: 'Andhra Pradesh',
      postalCode: '530022',
    },
    hours: { summary: 'Daily, 9:00 AM – 9:30 PM', schemaOrg: 'Mo-Su 09:00-21:30' },
    phone: { display: '+91 76740 95588', e164: '+917674095588' },
    deliveryLinks: { swiggy: null, zomato: null },
    sortOrder: 1,
  },
  {
    id: 'seethammadhara',
    slug: 'seethammadhara',
    status: 'active',
    name: 'Seethammadhara',
    area: 'Near Alluri Seetha Rama Raju Statue',
    isMain: false,
    address: {
      streetAddress:
        'D.No. 54-13-5, C/O Reliance Fresh Surya Vihar, Near Alluri Seetha Rama Raju Statue, Seethammadhara',
      locality: 'Visakhapatnam',
      region: 'Andhra Pradesh',
      postalCode: '530013',
    },
    hours: { summary: 'Daily, 8:00 AM – 10:00 PM', schemaOrg: 'Mo-Su 08:00-22:00' },
    phone: { display: '+91 78422 33399', e164: '+917842233399' },
    deliveryLinks: { swiggy: null, zomato: null },
    sortOrder: 2,
  },
  {
    id: 'madhavadhara',
    slug: 'madhavadhara',
    status: 'active',
    name: 'Madhavadhara',
    area: 'Gnanapuram',
    isMain: false,
    address: {
      streetAddress: 'Door 39-7-18, Varma Complex, Gnanapuram, Murali Nagar, Madhavadhara',
      locality: 'Visakhapatnam',
      region: 'Andhra Pradesh',
      postalCode: null,
    },
    hours: null, // not supplied
    phone: null, // not supplied
    deliveryLinks: { swiggy: null, zomato: null },
    sortOrder: 3,
  },
  {
    id: 'branch-4',
    slug: 'branch-4',
    status: 'details-pending',
    name: 'Branch 4',
    area: null,
    isMain: false,
    address: null,
    hours: null,
    phone: null,
    deliveryLinks: { swiggy: null, zomato: null },
    sortOrder: 4,
  },
  {
    id: 'branch-5',
    slug: 'branch-5',
    status: 'details-pending',
    name: 'Branch 5',
    area: null,
    isMain: false,
    address: null,
    hours: null,
    phone: null,
    deliveryLinks: { swiggy: null, zomato: null },
    sortOrder: 5,
  },
];
