export const computeRetryDelay = (attemptCount: number) => {
  const base = 5 * 1000;
  const max = 5 * 60 * 1000;

  return Math.min(base * 2 ** (attemptCount - 1), max);
}
