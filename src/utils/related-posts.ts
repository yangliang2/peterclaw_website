import type { CollectionEntry } from 'astro:content';

type BlogPost = CollectionEntry<'blog'>;

function scoreRelatedPost(current: BlogPost, candidate: BlogPost): number {
  let score = 0;

  if (
    current.data.series &&
    candidate.data.series === current.data.series
  ) {
    score += 100;
    if (
      current.data.seriesNumber != null &&
      candidate.data.seriesNumber != null
    ) {
      const distance = Math.abs(
        current.data.seriesNumber - candidate.data.seriesNumber
      );
      score += Math.max(0, 20 - distance * 5);
    }
  }

  const currentTags = new Set(current.data.tags);
  for (const tag of candidate.data.tags) {
    if (currentTags.has(tag)) {
      score += 10;
    }
  }

  return score;
}

/** Up to `limit` posts in the same locale with overlapping series or tags. */
export function findRelatedPosts(
  current: BlogPost,
  candidates: BlogPost[],
  limit = 3
): BlogPost[] {
  return candidates
    .filter((post) => post.id !== current.id)
    .map((post) => ({ post, score: scoreRelatedPost(current, post) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return (
        b.post.data.publishedAt.valueOf() - a.post.data.publishedAt.valueOf()
      );
    })
    .slice(0, limit)
    .map(({ post }) => post);
}
