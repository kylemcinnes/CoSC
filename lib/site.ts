export const SITE_NAME = "Church of Second Chances";
export const SITE_TAGLINE =
  "Restoration, Healing, and Second Chances through Jesus Christ";

/** Production canonical base — set NEXT_PUBLIC_SITE_URL in .env */
export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://churchofsecondchances.ca"
  );
}
