/**
 * Search radius steps for the distance slider, in km.
 * Not linear: fine steps up close (100 m, 200 m...), coarse steps far away (20 km, 30 km...),
 * because 100 m matters when you're walking but nobody cares about 100 m at 30 km.
 * The slider moves over the step *index*, so every step gets the same width.
 */
export const RADIUS_STEPS = [0.1, 0.2, 0.3, 0.5, 0.7, 1, 1.5, 2, 3, 4, 5, 7, 10, 15, 20, 30, 50];

/** 0.3 -> "300 公尺", 1.5 -> "1.5 公里" */
export const formatRadius = (km) => (km < 1 ? `${Math.round(km * 1000)} 公尺` : `${km} 公里`);

/** Short form for slider marks: 0.1 -> "100m", 10 -> "10km" */
export const shortRadius = (km) => (km < 1 ? `${Math.round(km * 1000)}m` : `${km}km`);

/** Index of the step closest to a radius (e.g. one saved in a recent search). */
export const indexForRadius = (km) => RADIUS_STEPS.reduce(
  (best, step, i) => (Math.abs(step - km) < Math.abs(RADIUS_STEPS[best] - km) ? i : best),
  0,
);

/** Smallest step that reaches `km` and is bigger than the current radius (null if none). */
export const nextRadiusCovering = (km, currentKm) => RADIUS_STEPS.find((step) => step >= km && step > currentKm) ?? null;
