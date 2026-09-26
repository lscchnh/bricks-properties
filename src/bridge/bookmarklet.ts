// Imported as text: this code runs on app.bricks.co when the bookmark is clicked, not in this app.
import source from "./bookmarklet-source.js?raw";

/** Builds the `javascript:` URL the user drags to their bookmarks bar. */
export function buildBookmarkletHref(siteUrl: string): string {
  const code = source.replace('"__SITE_URL__"', () => JSON.stringify(siteUrl));
  return `javascript:${encodeURIComponent(code)}`;
}

/** The URL the bookmarklet opens: this very site, wherever it is deployed. */
export const currentSiteUrl = () => new URL(import.meta.env.BASE_URL, window.location.origin).href;
