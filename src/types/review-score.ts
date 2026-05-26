export interface ReviewScoreDimension {
  /** Display name for the dimension */
  name: string;
  /** Maximum score (default 5) */
  maxScore?: number;
  /** Actual score achieved */
  score: number;
  /** Weight between 0 and 1; all dimensions should sum to 1 */
  weight: number;
  /** Optional footnote shown in the table */
  note?: string;
}

export interface ReviewScoreData {
  /** Product or tool label */
  title: string;
  dimensions: ReviewScoreDimension[];
  /** Override computed weighted total (same scale as maxScore) */
  totalScore?: number;
  /** Show SVG radar chart (default true) */
  showRadar?: boolean;
  /** Default max score when dimension omits maxScore (default 5) */
  maxScore?: number;
}

export function computeWeightedTotal(
  dimensions: ReviewScoreDimension[],
  defaultMax = 5,
  override?: number,
): number {
  if (override !== undefined) return override;
  const total = dimensions.reduce((sum, dimension) => {
    const max = dimension.maxScore ?? defaultMax;
    const normalized = max > 0 ? dimension.score / max : 0;
    return sum + normalized * dimension.weight;
  }, 0);
  return total * defaultMax;
}

export function assertReviewDimensions(dimensions: ReviewScoreDimension[]): void {
  if (dimensions.length < 2 || dimensions.length > 8) {
    throw new Error(`ReviewScoreCard expects 2–8 dimensions, got ${dimensions.length}`);
  }
  const weightSum = dimensions.reduce((sum, d) => sum + d.weight, 0);
  if (Math.abs(weightSum - 1) > 0.01) {
    throw new Error(`ReviewScoreCard dimension weights must sum to 1, got ${weightSum.toFixed(3)}`);
  }
}
