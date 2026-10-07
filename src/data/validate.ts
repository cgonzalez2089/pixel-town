import {
  ITEM_STATUSES,
  ITEM_TYPES,
  RATING_MAX,
  RATING_MIN,
  RATING_STEP,
  type Item,
  type ItemType,
} from './types';

export type ValidationResult<T> = { ok: true; items: T[] } | { ok: false; errors: string[] };

const COMMON_KEYS = [
  'id',
  'title',
  'type',
  'year',
  'imageUrl',
  'description',
  'dateAdded',
  'status',
];
const RATED_KEYS = [...COMMON_KEYS, 'rating', 'review'];

type RawRecord = Record<string, unknown>;

function isRecord(value: unknown): value is RawRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/** True for a real calendar date written as `YYYY-MM-DD`. */
export function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  // Round-tripping rejects dates like 2024-02-30 that `Date` silently rolls over.
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

/** True for a rating between 0.5 and 5 in half-star steps. */
export function isValidRating(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    value >= RATING_MIN &&
    value <= RATING_MAX &&
    Number.isInteger(value / RATING_STEP)
  );
}

/** Accepts absolute http(s) URLs and relative paths into `public/`. */
export function isValidImageUrl(value: unknown): value is string {
  if (!isNonEmptyString(value)) return false;
  if (/^https?:\/\//i.test(value)) {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }
  // Relative paths only: no other schemes, no leading slash, no escaping `public/`.
  return !/^[a-z][a-z\d+.-]*:/i.test(value) && !value.startsWith('/') && !value.includes('..');
}

function validateItem(raw: unknown, expectedType: ItemType, at: string, errors: string[]): void {
  if (!isRecord(raw)) {
    errors.push(`${at}: must be an object`);
    return;
  }
  const fail = (field: string, message: string) => errors.push(`${at}.${field}: ${message}`);

  if (!isNonEmptyString(raw.id)) fail('id', 'must be a non-empty string');
  if (!isNonEmptyString(raw.title)) fail('title', 'must be a non-empty string');
  if (!isNonEmptyString(raw.description)) fail('description', 'must be a non-empty string');

  if (!ITEM_TYPES.includes(raw.type as ItemType)) {
    fail('type', `must be one of ${ITEM_TYPES.join(', ')}`);
  } else if (raw.type !== expectedType) {
    fail('type', `must be "${expectedType}" in this file`);
  }

  if (typeof raw.year !== 'number' || !Number.isInteger(raw.year)) {
    fail('year', 'must be a whole number');
  }
  if (!isIsoDate(raw.dateAdded)) fail('dateAdded', 'must be a real date in YYYY-MM-DD form');
  if ('imageUrl' in raw && !isValidImageUrl(raw.imageUrl)) {
    fail('imageUrl', 'must be an http(s) URL or a relative path into public/');
  }

  if (!ITEM_STATUSES.includes(raw.status as Item['status'])) {
    fail('status', `must be one of ${ITEM_STATUSES.join(', ')}`);
    return;
  }

  if (raw.status === 'rated') {
    if (!isValidRating(raw.rating)) {
      fail('rating', `must be ${RATING_MIN}–${RATING_MAX} in steps of ${RATING_STEP}`);
    }
    if ('review' in raw && !isNonEmptyString(raw.review)) {
      fail('review', 'must be a non-empty string when present');
    }
  }

  // Unknown keys are usually typos ("raiting"), so reject them instead of ignoring them.
  const allowed = raw.status === 'rated' ? RATED_KEYS : COMMON_KEYS;
  for (const key of Object.keys(raw)) {
    if (!allowed.includes(key)) {
      const hint = key === 'rating' || key === 'review' ? ' (only rated items have this)' : '';
      fail(key, `unknown field${hint}`);
    }
  }
}

/**
 * Checks untrusted JSON against the item schema and reports every problem
 * at once, each prefixed with its location (e.g. `movies.json[2].rating`).
 */
export function validateItems<TType extends ItemType>(
  raw: unknown,
  expectedType: TType,
  source: string,
): ValidationResult<Item<TType>> {
  if (!Array.isArray(raw)) {
    return { ok: false, errors: [`${source}: must be an array of items`] };
  }

  const errors: string[] = [];
  const seenIds = new Set<string>();

  raw.forEach((entry: unknown, index) => {
    const at = `${source}[${index}]`;
    validateItem(entry, expectedType, at, errors);
    if (isRecord(entry) && typeof entry.id === 'string') {
      if (seenIds.has(entry.id)) errors.push(`${at}.id: duplicate id "${entry.id}"`);
      seenIds.add(entry.id);
    }
  });

  return errors.length > 0 ? { ok: false, errors } : { ok: true, items: raw as Item<TType>[] };
}
