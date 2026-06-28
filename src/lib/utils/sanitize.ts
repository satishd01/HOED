/**
 * Input sanitization utilities.
 *
 * Security: Strip HTML tags from user-provided strings to prevent
 * stored XSS and to ensure document titles remain plain text.
 */

/**
 * Strip all HTML tags from a string.
 * Used on document titles before storing in the database.
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

/**
 * Validate that a string is a valid UUID v4.
 * Used on all route params to reject malformed IDs before hitting the DB.
 */
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

/**
 * Sanitize a document title:
 * - Strip HTML
 * - Trim whitespace
 * - Truncate to 200 chars
 */
export function sanitizeTitle(title: string): string {
  return stripHtml(title).slice(0, 200);
}

/**
 * Validate and sanitize the incoming size of a base64 Yjs snapshot payload.
 * Returns the byte size of the decoded data.
 *
 * Base64 overhead: actual bytes = base64.length * 0.75
 * Max allowed: 4MB decoded
 */
const MAX_SNAPSHOT_BYTES = 4 * 1024 * 1024; // 4MB

export function validateSnapshotSize(base64: string): {
  valid: boolean;
  byteSize: number;
} {
  const byteSize = Math.floor(base64.length * 0.75);
  return { valid: byteSize <= MAX_SNAPSHOT_BYTES, byteSize };
}
