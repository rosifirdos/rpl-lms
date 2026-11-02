/**
 * UUID Generation Utilities
 * Provides prefixed ID generation for consistent entity identification
 */

/**
 * Generate a prefixed ID with timestamp and random component
 * @param {string} prefix - Prefix for the ID (e.g., 'mk-', 'cls-', 'usr-')
 * @returns {string} Unique ID string
 */
export function generatePrefixedId(prefix = 'id-') {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}-${randomPart}`;
}

/**
 * Generate a simple UUID v4 compliant string
 * @returns {string} UUID string
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate a short ID for display purposes
 * @param {number} length - Length of the ID (default 8)
 * @returns {string} Short ID
 */
export function generateShortId(length = 8) {
  return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
}