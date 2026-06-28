/**
 * Sliding-window in-memory rate limiter.
 *
 * Security: Prevents OOM attacks and brute-force abuse on API routes.
 * Each IP is limited to `maxRequests` within a `windowMs` rolling window.
 *
 * Note: This is in-memory and per-instance. For multi-replica deployments,
 * replace with Redis-backed rate limiting (e.g. @upstash/ratelimit).
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    // Remove entries that have no recent timestamps
    entry.timestamps = entry.timestamps.filter((t) => now - t < 60_000);
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
}

/**
 * Check if the given key (typically an IP address) is within the rate limit.
 * @param key - Unique identifier (e.g. IP address)
 * @param maxRequests - Max requests allowed in the window (default: 60)
 * @param windowMs - Window size in milliseconds (default: 60 seconds)
 */
export function checkRateLimit(
  key: string,
  maxRequests = 60,
  windowMs = 60_000
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  if (!store.has(key)) {
    store.set(key, { timestamps: [] });
  }

  const entry = store.get(key)!;

  // Purge timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

  if (entry.timestamps.length >= maxRequests) {
    const oldest = entry.timestamps[0];
    return {
      allowed: false,
      remaining: 0,
      resetInMs: oldest + windowMs - now,
    };
  }

  entry.timestamps.push(now);

  return {
    allowed: true,
    remaining: maxRequests - entry.timestamps.length,
    resetInMs: 0,
  };
}

/**
 * Extract the client IP from a Next.js Request object.
 * Checks x-forwarded-for (for proxies/Vercel) then falls back to a default.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}
