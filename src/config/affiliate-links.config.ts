export type AffiliateLink = {
  slug: string;
  url: string;
  label: string;
};

/**
 * Central source of truth for all affiliate shortlinks under `/go/*`.
 *
 * Add/modify items here and Astro will generate a static page per slug. URLs
 * intentionally use public UTM attribution until vendor-specific affiliate IDs
 * are approved and available.
 */
export const affiliateLinks: AffiliateLink[] = [
  {
    slug: 'cursor',
    label: 'Cursor',
    url: 'https://cursor.com?utm_source=peterclaw&utm_medium=tools&utm_campaign=affiliate_toolbox',
  },
  {
    slug: 'windsurf',
    label: 'Windsurf',
    url: 'https://codeium.com/windsurf?utm_source=peterclaw&utm_medium=tools&utm_campaign=affiliate_toolbox',
  },
  {
    slug: 'claude',
    label: 'Claude Code',
    url: 'https://docs.anthropic.com/en/docs/agents-and-tools/claude-code?utm_source=peterclaw&utm_medium=tools&utm_campaign=affiliate_toolbox',
  },
  {
    slug: 'notion-ai',
    label: 'Notion AI',
    url: 'https://www.notion.com/product/ai?utm_source=peterclaw&utm_medium=tools&utm_campaign=affiliate_toolbox',
  },
  {
    slug: 'astro',
    label: 'Astro',
    url: 'https://astro.build?utm_source=peterclaw&utm_medium=tools&utm_campaign=affiliate_toolbox',
  },
  {
    slug: 'vercel',
    label: 'Vercel',
    url: 'https://vercel.com?utm_source=peterclaw&utm_medium=tools&utm_campaign=affiliate_toolbox',
  },
  {
    slug: 'plausible',
    label: 'Plausible Analytics',
    url: 'https://plausible.io?utm_source=peterclaw&utm_medium=tools&utm_campaign=affiliate_toolbox',
  },
  {
    slug: 'buttondown',
    label: 'Buttondown',
    url: 'https://buttondown.email?utm_source=peterclaw&utm_medium=tools&utm_campaign=affiliate_toolbox',
  },
  {
    slug: 'amazon-ai-books',
    label: 'Amazon AI Books',
    url: 'https://www.amazon.com/s?k=AI+books&tag=peterclaw-20',
  },
];

export function getAffiliateLink(slug: string) {
  return affiliateLinks.find((l) => l.slug === slug);
}
