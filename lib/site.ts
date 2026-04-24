export const SITE_NAME = "Church of Second Chances";
export const SITE_TAGLINE =
  "Restoration, Healing, and Second Chances through Jesus Christ";

/** Lead pastor name for on-site copy (see “Who we are” on the home page). */
export const LEAD_PASTOR_NAME = "Justin Roberts";

/** Production canonical base — set NEXT_PUBLIC_SITE_URL in .env */
export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://churchofsecondchances.ca"
  );
}
