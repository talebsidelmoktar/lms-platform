export type SafeHref =
  | { kind: "internal"; href: string }
  | { kind: "external"; href: string };

/**
 * Minimal href sanitization for user/AI-authored Markdown and CMS links.
 * Blocks dangerous protocols (javascript:, data:, vbscript:, file:, etc).
 */
export function sanitizeHref(raw: string | null | undefined): SafeHref | null {
  if (!raw) return null;
  const href = raw.trim();
  if (href.length === 0) return null;

  // Allow in-app relative navigation.
  if (
    href.startsWith("/") ||
    href.startsWith("#") ||
    href.startsWith("?")
  ) {
    // Block protocol-relative external URLs (e.g. //evil.com).
    if (href.startsWith("//")) return null;
    return { kind: "internal", href };
  }

  // Allowlist absolute URLs and mailto only.
  try {
    const url = new URL(href);
    const protocol = url.protocol.toLowerCase();
    if (protocol === "http:" || protocol === "https:" || protocol === "mailto:") {
      return { kind: "external", href };
    }
    return null;
  } catch {
    return null;
  }
}

