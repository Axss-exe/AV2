/**
 * Perspective Context helper.
 *
 * The country the user selects is NOT a data filter — it is the analytical
 * PERSPECTIVE from which all intelligence is interpreted. Intelligence can
 * still originate anywhere in Africa; the perspective tells the backend
 * "what does this mean for <country>?".
 *
 * This is the single, small, shared source for:
 *   selected country -> perspective_country + perspective_country_code
 */

export interface PerspectivePayload {
  perspective_country: string;
  perspective_country_code: string;
}

/** Shape the backend may echo back on responses. */
export interface PerspectiveContext {
  country: string;
  country_code: string;
}

/**
 * Smallest static mapping required by the perspective selector. Kept
 * deliberately minimal — this is not a country database.
 */
export const PERSPECTIVE_COUNTRIES: { name: string; code: string }[] = [
  { name: 'Zimbabwe', code: 'ZW' },
  { name: 'Zambia', code: 'ZM' },
  { name: 'Botswana', code: 'BW' },
  { name: 'South Africa', code: 'ZA' },
  { name: 'Mozambique', code: 'MZ' },
  { name: 'Namibia', code: 'NA' },
  { name: 'Malawi', code: 'MW' },
  { name: 'Kenya', code: 'KE' },
  { name: 'Tanzania', code: 'TZ' },
  { name: 'Nigeria', code: 'NG' },
  { name: 'Ghana', code: 'GH' },
  { name: 'Rwanda', code: 'RW' },
  { name: 'Uganda', code: 'UG' },
  { name: 'Ethiopia', code: 'ET' },
];

/** Default perspective — the app is Zimbabwe-centric. */
export const DEFAULT_PERSPECTIVE = { name: 'Zimbabwe', code: 'ZW' } as const;

/** Resolve a country name to its ISO code. Returns '' if unknown. */
export function getCountryCode(name: string): string {
  const found = PERSPECTIVE_COUNTRIES.find(
    (c) => c.name.toLowerCase() === name.trim().toLowerCase()
  );
  return found?.code ?? '';
}

/**
 * Build the perspective payload merged into API requests. The single shared
 * helper referenced across Query / News / Execute so there is exactly one
 * implementation.
 */
export function buildPerspectivePayload(country: string, code: string): PerspectivePayload {
  return {
    perspective_country: country,
    perspective_country_code: code || getCountryCode(country),
  };
}
