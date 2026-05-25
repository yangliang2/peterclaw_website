import { getSiteUrl, siteConfig } from '@/config/site';
import type { Locale } from '@/lib/i18n';

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export type ArticleSchemaInput = {
  title: string;
  description: string;
  path: string;
  locale: Locale;
  publishedTime: Date;
  modifiedTime?: Date;
  imagePath?: string;
};

export type ProductSchemaInput = {
  title: string;
  description: string;
  path: string;
  locale: Locale;
  price?: string;
};

export function absoluteUrl(path = '/'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalized, getSiteUrl()).href;
}

export function buildWebSiteSchema(locale: Locale, description: string) {
  const siteUrl = getSiteUrl().href;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    description,
    url: siteUrl,
    inLanguage: locale,
    publisher: {
      '@id': absoluteUrl('/#organization'),
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: absoluteUrl(`/${locale}/search/?q={search_term_string}`),
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildOrganizationSchema() {
  const siteUrl = getSiteUrl().href;

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': absoluteUrl('/#organization'),
    name: siteConfig.name,
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl('/favicon.svg'),
    },
    sameAs: Object.values(siteConfig.author.social),
  };
}

export function buildPersonSchema() {
  const siteUrl = getSiteUrl().href;

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': absoluteUrl('/#person'),
    name: siteConfig.author.name,
    url: siteUrl,
    sameAs: Object.values(siteConfig.author.social),
    image: {
      '@type': 'ImageObject',
      url: absoluteUrl('/favicon.svg'), // Use favicon as default person image if none other
    },
  };
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildArticleSchema(input: ArticleSchemaInput) {
  const url = absoluteUrl(input.path);
  const image = absoluteUrl(input.imagePath ?? siteConfig.defaultOgImage);

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: input.title,
    description: input.description,
    url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    datePublished: input.publishedTime.toISOString(),
    dateModified: (input.modifiedTime ?? input.publishedTime).toISOString(),
    author: {
      '@type': 'Person',
      name: siteConfig.author.name,
      url: siteConfig.author.url,
      sameAs: Object.values(siteConfig.author.social),
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: getSiteUrl().href,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/favicon.svg'),
      },
    },
    image: [image],
    inLanguage: input.locale,
  };
}

export function buildProductSchema(input: ProductSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    applicationCategory: 'BusinessApplication',
    inLanguage: input.locale,
    ...(input.price
      ? {
          offers: {
            '@type': 'Offer',
            price: input.price,
            priceCurrency: 'USD',
          },
        }
      : {}),
  };
}
