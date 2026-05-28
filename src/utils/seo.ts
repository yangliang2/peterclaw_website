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
  /** BlogPosting for blog posts; Article for knowledge base pages. */
  articleType?: 'BlogPosting' | 'Article';
};

export type DynamicOgImageInput = {
  title: string;
  description?: string;
  section: 'blog' | 'knowledge' | 'review' | 'product';
  locale: Locale;
  category?: string;
};

export type ProductSchemaInput = {
  title: string;
  description: string;
  path: string;
  locale: Locale;
  price?: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type ReviewedProduct = {
  name: string;
  url: string;
};

export type ReviewSchemaInput = {
  title: string;
  description: string;
  path: string;
  publishedTime: Date;
  rating: number;
  itemReviewed: ReviewedProduct;
};

export type ItemListSchemaInput = {
  name: string;
  description: string;
  path: string;
  items: Array<{
    name: string;
    description: string;
    url: string;
  }>;
};

export type FAQItem = {
  question: string;
  answer: string;
};

export type HowToStep = {
  name: string;
  text: string;
  image?: string;
  url?: string;
};

export function absoluteUrl(path = '/'): string {

  const normalized = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalized, getSiteUrl()).href;
}

export function buildDynamicOgImagePath(input: DynamicOgImageInput): string {
  const params = new URLSearchParams({
    title: input.title,
    section: input.section,
    locale: input.locale,
  });

  if (input.description) {
    params.set('description', input.description);
  }

  if (input.category) {
    params.set('category', input.category);
  }

  return `/api/og?${params.toString()}`;
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
        urlTemplate: absoluteUrl('/search?q={search_term_string}'),
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
  const articleType = input.articleType ?? 'BlogPosting';

  return {
    '@context': 'https://schema.org',
    '@type': articleType,
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

export function buildFaqSchema(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
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

export function buildReviewSchema(input: ReviewSchemaInput) {
  const url = absoluteUrl(input.path);

  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    name: input.title,
    reviewBody: input.description,
    url,
    datePublished: input.publishedTime.toISOString(),
    author: {
      '@type': 'Person',
      name: siteConfig.author.name,
      url: siteConfig.author.url,
      sameAs: Object.values(siteConfig.author.social),
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: input.rating,
      bestRating: 5,
      worstRating: 1,
    },
    itemReviewed: {
      '@type': 'SoftwareApplication',
      name: input.itemReviewed.name,
      url: input.itemReviewed.url,
    },
  };
}

export function buildItemListSchema(input: ItemListSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    itemListElement: input.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'SoftwareApplication',
        name: item.name,
        description: item.description,
        url: item.url,
        applicationCategory: 'DeveloperApplication',
      },
    })),
  };
}

export function buildHowToSchema(input: {
  name: string;
  description: string;
  steps: HowToStep[];
  imagePath?: string;
  locale: Locale;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: input.name,
    description: input.description,
    image: input.imagePath ? absoluteUrl(input.imagePath) : undefined,
    inLanguage: input.locale,
    step: input.steps.map((step) => ({
      '@type': 'HowToStep',
      name: step.name,
      text: step.text,
      image: step.image ? absoluteUrl(step.image) : undefined,
      url: step.url ? absoluteUrl(step.url) : undefined,
    })),
  };
}

export type JsonLdSchema =
  | ReturnType<typeof buildWebSiteSchema>
  | ReturnType<typeof buildOrganizationSchema>
  | ReturnType<typeof buildPersonSchema>
  | ReturnType<typeof buildBreadcrumbSchema>
  | ReturnType<typeof buildArticleSchema>
  | ReturnType<typeof buildFaqSchema>
  | ReturnType<typeof buildHowToSchema>
  | ReturnType<typeof buildProductSchema>
  | ReturnType<typeof buildReviewSchema>
  | ReturnType<typeof buildItemListSchema>;
