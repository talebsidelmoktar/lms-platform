// Querying with "sanityFetch" will keep content automatically updated
// Before using it, import and render "<SanityLive />" in your layout, see
// https://github.com/sanity-io/next-sanity#live-content-api for more information.
import { defineLive } from "next-sanity/live";
import { client } from "./client";

// Token for fetching draft content (optional - set false to silence warning if not using drafts)
const token = process.env.SANITY_API_READ_TOKEN;

// Never ship secret tokens to the browser in production.
// If you need authenticated draft previews locally, explicitly enable it in development only.
const enableBrowserToken =
  process.env.NODE_ENV !== "production" &&
  (process.env.SANITY_ENABLE_BROWSER_TOKEN ?? "").toLowerCase() === "true";

export const { sanityFetch, SanityLive } = defineLive({
  client,
  // Provide tokens for draft content support, or set to false to silence warnings
  serverToken: token || false,
  browserToken: enableBrowserToken ? token || false : false,
});
