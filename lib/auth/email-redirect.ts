function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

export function buildEmailCallbackUrl(
  nextPath: string,
  fallbackOrigin: string,
) {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const baseUrl =
    configuredBaseUrl && /^https?:\/\//.test(configuredBaseUrl)
      ? configuredBaseUrl
      : fallbackOrigin;

  return `${normalizeBaseUrl(baseUrl)}/auth/callback?next=${encodeURIComponent(nextPath)}`;
}
