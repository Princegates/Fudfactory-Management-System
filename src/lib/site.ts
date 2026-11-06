/** The deployed site's own public URL — set per-deployment via env var so
 * this template works for any vendor's domain, not just one hardcoded one. */
export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
