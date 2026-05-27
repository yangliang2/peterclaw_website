export type OgContentType = 'blog' | 'knowledge' | 'reviews';
export type OgLocale = 'zh' | 'en';

type OgImageUrlInput = {
  title: string;
  subtitle?: string;
  type: OgContentType;
  locale?: OgLocale;
};

export function ogImagePath({ title, subtitle, type, locale }: OgImageUrlInput): string {
  const params = new URLSearchParams({
    title,
    type,
  });

  if (subtitle) {
    params.set('subtitle', subtitle);
  }

  if (locale) {
    params.set('locale', locale);
  }

  return `/api/og?${params.toString()}`;
}

export function blogOgImagePath(entryId: string): string {
  return `/og/blog/${entryId}.png`;
}

export function blogPostOgType(contentType?: string): OgContentType {
  return contentType === 'review' ? 'reviews' : 'blog';
}
