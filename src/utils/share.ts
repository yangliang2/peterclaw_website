export type ShareLinks = {
  twitter: string;
  linkedin: string;
};

/** Build platform share URLs with encoded title and canonical page URL. */
export function buildShareLinks(title: string, url: string): ShareLinks {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };
}
