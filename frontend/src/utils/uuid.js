/**
 * UUID generator utility
 * Provides RFC4122 v4 compliant UUID generation with browser compatibility fallback
 */

/**
 * Generate a UUID v4 string
 * Uses crypto.randomUUID() when available (modern browsers, HTTPS contexts)
 * Falls back to RFC4122 v4 compliant implementation for older browsers/non-HTTPS
 * @returns {string} UUID v4 string (e.g., "550e8400-e29b-41d4-a716-446655440000")
 */
export function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback: RFC4122 v4 compliant UUID
  // Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  // where x = random hex, 4 = version 4, y = 8/9/a/b (variant)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate a prefixed ID for entities (e.g., "mk-", "cls-")
 * @param {string} prefix - Prefix for the ID (e.g., "mk-", "cls-")
 * @returns {string} Prefixed UUID (e.g., "mk-550e8400-e29b-41d4-a716-446655440000")
 */
export function generatePrefixedId(prefix) {
  return `${prefix}${generateUUID()}`;
}