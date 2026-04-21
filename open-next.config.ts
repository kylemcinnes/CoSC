/**
 * OpenNext + Cloudflare Workers configuration for this Next.js app.
 * Add R2, KV, D1, or other bindings here when the ministry needs them at the edge.
 *
 * `buildCommand` must be plain `next build` (not `npm run build`) so `opennextjs-cloudflare build`
 * does not recurse when CI uses `npm run build` as the Cloudflare build command.
 */
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import type { OpenNextConfig } from "@opennextjs/cloudflare";

const cloudflare = defineCloudflareConfig({
  // Placeholder for future R2, KV, or D1 bindings if needed
});

const config: OpenNextConfig = {
  ...cloudflare,
  buildCommand: "npx next build",
};

export default config;
