export type AffiliateLink = {
  slug: string;
  url: string;
  label: string;
};

/**
 * Central source of truth for all affiliate shortlinks under `/go/*`.
 *
 * Add/modify items here and Astro will generate a static page per slug.
 */
export const affiliateLinks: AffiliateLink[] = [
  {
    slug: 'cursor',
    label: 'Cursor',
    url: 'https://cursor.com',
  },
  {
    slug: 'claude',
    label: 'Claude',
    url: 'https://www.anthropic.com/claude',
  },
];

export function getAffiliateLink(slug: string) {
  return affiliateLinks.find((l) => l.slug === slug);
}

