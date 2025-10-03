// Reddit hot sorting algorithm
export function calculateHot(
  upvotes: number,
  downvotes: number,
  createdAt: Date
): number {
  const score = upvotes - downvotes;
  const order = Math.log10(Math.max(Math.abs(score), 1));
  const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
  const seconds = Math.floor(createdAt.getTime() / 1000) - 1134028003;
  const hot = sign * order + seconds / 45000;
  return Math.round(hot * 10000000) / 10000000;
}

export type SortOption = 'hot' | 'new' | 'top';

export function getSortSQL(sort: SortOption): string {
  switch (sort) {
    case 'new':
      return 'ORDER BY p.created_at DESC';
    case 'top':
      return 'ORDER BY score DESC, p.created_at DESC';
    case 'hot':
    default:
      // Will be calculated in application code
      return 'ORDER BY p.created_at DESC';
  }
}

