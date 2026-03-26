const REMOTE_API_BASE_URL = "https://backend.thesocialmarket.ai/api/";
const LOCAL_API_PROXY_PREFIX = "/backend-api/";

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function isLocalProxyBase(value: string): boolean {
  const normalized = ensureTrailingSlash(value.trim());
  return (
    normalized === LOCAL_API_PROXY_PREFIX ||
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/backend-api\/$/i.test(normalized)
  );
}

export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (!configured || isLocalProxyBase(configured)) {
    return REMOTE_API_BASE_URL;
  }

  return ensureTrailingSlash(configured);
}

export function buildApiUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl();
  const normalizedEndpoint = endpoint.replace(/^\/+/, "");
  return `${baseUrl}${normalizedEndpoint}`;
}
