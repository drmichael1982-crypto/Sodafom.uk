/** Shared result thresholds used by both rewards and adaptive progression. */
export function starsForPercentage(score: number): number {
  if (score >= 90) return 3;
  if (score >= 75) return 2;
  if (score >= 50) return 1;
  return 0;
}
