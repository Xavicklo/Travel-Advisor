/**
 * Minimum-rating steps for the rating slider (stars).
 * Not linear, like the distance slider: most places are rated 4-5, so that range gets
 * 0.1 steps, while "no minimum" -> 3 -> 3.5 -> 4 are only a step apart each.
 */
export const RATING_STEPS = [0, 3, 3.5, 4, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9];

/** 0 -> "不限", 4.3 -> "4.3 星以上" */
export const formatRating = (stars) => (stars ? `${stars} 星以上` : '不限');

/** Index of the step closest to a rating. */
export const indexForRating = (stars) => RATING_STEPS.reduce(
  (best, step, i) => (Math.abs(step - stars) < Math.abs(RATING_STEPS[best] - stars) ? i : best),
  0,
);
