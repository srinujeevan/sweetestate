import { SITE_CONFIG } from '../config/site.config';
import { Branch } from '../models/branch.model';
import { absoluteUrl } from './seo.service';

/**
 * schema.org builders using ONLY supplied business data.
 * Product structured data is deliberately not emitted: prices are indicative
 * and availability is unknown, so it would not be accurate.
 */
export function organizationJsonLd(): object {
  const url = absoluteUrl('/');
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.legalName,
    alternateName: SITE_CONFIG.brandName,
    ...(url ? { url } : {}),
    areaServed: { '@type': 'City', name: SITE_CONFIG.city },
  };
}

export function branchJsonLd(branch: Branch): object | null {
  if (branch.status !== 'active' || !branch.address) return null;
  const url = absoluteUrl(`/branches/${branch.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'FoodEstablishment',
    name: `${SITE_CONFIG.legalName} – ${branch.name}`,
    ...(url ? { url, '@id': url } : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: branch.address.streetAddress,
      addressLocality: branch.address.locality,
      addressRegion: branch.address.region,
      ...(branch.address.postalCode ? { postalCode: branch.address.postalCode } : {}),
      addressCountry: 'IN',
    },
    ...(branch.phone ? { telephone: branch.phone.e164 } : {}),
    ...(branch.hours ? { openingHours: branch.hours.schemaOrg } : {}),
    parentOrganization: { '@type': 'Organization', name: SITE_CONFIG.legalName },
  };
}
