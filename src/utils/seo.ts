import { getSiteUrl, siteConfig } from "../config/site";

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export type ArticleSchemaInput = {
  title: string;
  description: string;
  path: string;
  publishedTime: Date;
  modifiedTime?: Date;
  imagePath?: string;
};

export function getContentSlug(id: string): string {
  return id.replace(/\.(md|mdx)$/, "");
}

export function absoluteUrl(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalized, getSiteUrl()).href;
}

export function buildWebSiteSchema() {
  const siteUrl = getSiteUrl().href;

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteUrl,
    inLanguage: siteConfig.language,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteUrl,
    },
  };
}

export function buildOrganizationSchema() {
  const siteUrl = getSiteUrl().href;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteUrl,
    logo: absoluteUrl("/favicon.svg"),
    sameAs: [siteConfig.author.url],
  };
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
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
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    datePublished: input.publishedTime.toISOString(),
    dateModified: (input.modifiedTime ?? input.publishedTime).toISOString(),
    author: {
      "@type": "Person",
      name: siteConfig.author.name,
      url: siteConfig.author.url,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: getSiteUrl().href,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/favicon.svg"),
      },
    },
    image: [image],
    inLanguage: siteConfig.language,
  };
}
