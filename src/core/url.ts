export type ParsedVideoUrl = {
  url: string;
  protocol: "http:" | "https:";
  hostname: string;
};

export function parseVideoUrl(input: string): ParsedVideoUrl {
  let parsed: URL;

  try {
    parsed = new URL(input.trim());
  } catch {
    throw new Error("Invalid URL");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Unsupported URL protocol");
  }

  return {
    url: parsed.toString(),
    protocol: parsed.protocol,
    hostname: parsed.hostname,
  };
}
