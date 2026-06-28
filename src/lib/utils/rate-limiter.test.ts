import { describe, it, expect } from "vitest";
import { checkRateLimit } from "@/lib/utils/rate-limiter";

describe("checkRateLimit", () => {
  it("allows requests within the limit", () => {
    const key = `test-${Date.now()}`;
    const result = checkRateLimit(key, 5, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("blocks requests that exceed the limit", () => {
    const key = `test-limit-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      checkRateLimit(key, 5, 60_000);
    }
    const result = checkRateLimit(key, 5, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("uses separate buckets for different keys", () => {
    const key1 = `test-k1-${Date.now()}`;
    const key2 = `test-k2-${Date.now()}`;

    // Exhaust key1
    for (let i = 0; i < 3; i++) checkRateLimit(key1, 3, 60_000);
    expect(checkRateLimit(key1, 3, 60_000).allowed).toBe(false);

    // key2 should still be allowed
    expect(checkRateLimit(key2, 3, 60_000).allowed).toBe(true);
  });

  it("provides reset time when rate limited", () => {
    const key = `test-reset-${Date.now()}`;
    for (let i = 0; i < 2; i++) checkRateLimit(key, 2, 60_000);
    const result = checkRateLimit(key, 2, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.resetInMs).toBeGreaterThan(0);
    expect(result.resetInMs).toBeLessThanOrEqual(60_000);
  });
});
