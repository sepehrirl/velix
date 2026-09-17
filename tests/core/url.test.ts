import { describe, expect, it } from "vitest";
import { parseVideoUrl } from "../../src/core/url";

describe("parseVideoUrl", () => {
  it("accepts a public http URL", () => {
    expect(parseVideoUrl("https://example.com/video/123")).toEqual({
      url: "https://example.com/video/123",
      protocol: "https:",
      hostname: "example.com",
    });
  });

  it("rejects non-http protocols", () => {
    expect(() => parseVideoUrl("javascript:alert(1)")).toThrow("Unsupported URL protocol");
  });

  it("rejects malformed URLs", () => {
    expect(() => parseVideoUrl("not-a-url")).toThrow("Invalid URL");
  });
});
