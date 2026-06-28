import { describe, it, expect } from "vitest";
import { stripHtml, isValidUuid, sanitizeTitle, validateSnapshotSize } from "@/lib/utils/sanitize";

describe("stripHtml", () => {
  it("removes basic HTML tags", () => {
    expect(stripHtml("<b>Hello</b> World")).toBe("Hello World");
  });

  it("removes script tags", () => {
    expect(stripHtml("<script>alert('xss')</script>Clean text")).toBe(
      "alert('xss')Clean text"
    );
  });

  it("handles strings with no HTML", () => {
    expect(stripHtml("Plain text")).toBe("Plain text");
  });

  it("trims whitespace", () => {
    expect(stripHtml("  Hello  ")).toBe("Hello");
  });
});

describe("isValidUuid", () => {
  it("accepts valid UUID v4", () => {
    expect(isValidUuid("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
  });

  it("rejects malformed UUIDs", () => {
    expect(isValidUuid("not-a-uuid")).toBe(false);
    expect(isValidUuid("550e8400-e29b-41d4-a716")).toBe(false);
    expect(isValidUuid("'; DROP TABLE users; --")).toBe(false);
    expect(isValidUuid("")).toBe(false);
  });
});

describe("sanitizeTitle", () => {
  it("strips HTML and truncates to 200 chars", () => {
    const long = "A".repeat(300);
    expect(sanitizeTitle(long).length).toBe(200);
  });

  it("strips HTML from title", () => {
    expect(sanitizeTitle("<script>bad</script>Good Title")).toBe(
      "badGood Title"
    );
  });
});

describe("validateSnapshotSize", () => {
  it("allows small payloads", () => {
    // ~100 bytes of base64 = ~75 bytes decoded — well under 4MB
    const small = Buffer.alloc(100).toString("base64");
    expect(validateSnapshotSize(small).valid).toBe(true);
  });

  it("rejects oversized payloads", () => {
    // 4MB decoded → ~5.4MB base64
    const bigBase64 = "A".repeat(5.5 * 1024 * 1024);
    expect(validateSnapshotSize(bigBase64).valid).toBe(false);
  });
});
