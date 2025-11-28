export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

const normalizeEnv = (value?: string) => value?.trim() || undefined;

export const APP_TITLE =
  normalizeEnv(import.meta.env.VITE_APP_TITLE) || "Job Application Tracker";

export const APP_LOGO =
  normalizeEnv(import.meta.env.VITE_APP_LOGO) || "/app-icon.svg";

export const ANALYTICS_ENDPOINT = normalizeEnv(
  import.meta.env.VITE_ANALYTICS_ENDPOINT,
);

export const ANALYTICS_WEBSITE_ID = normalizeEnv(
  import.meta.env.VITE_ANALYTICS_WEBSITE_ID,
);

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
