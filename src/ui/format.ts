import { RATING_MAX } from '../data/types';

/** How many full, half and empty stars draw a rating, e.g. 3.5 → 3 full, 1 half, 1 empty. */
export function starParts(rating: number): { full: number; half: boolean; empty: number } {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return { full, half, empty: RATING_MAX - full - (half ? 1 : 0) };
}

/** Screen-reader text for a rating, e.g. "4.5 out of 5 stars". */
export function ratingLabel(rating: number): string {
  return `${rating} out of ${RATING_MAX} stars`;
}

/**
 * Absolute URLs are used as-is; relative ones point into `public/` and need
 * the site's base path (`/pixel-town/` on GitHub Pages).
 */
export function resolveImageUrl(url: string, base: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `${base.replace(/\/?$/, '/')}${url}`;
}
