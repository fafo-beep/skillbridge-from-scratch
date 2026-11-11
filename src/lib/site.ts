// The public origin of this deployment, from configuration only. Used
// wherever a link leaves the app: emails, PDFs, verification pages.
export function siteOrigin(): string {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.AUTH_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "");
  if (configured) return configured.replace(/\/$/, "");
  if (process.env.NODE_ENV === "production") throw new Error("NEXT_PUBLIC_SITE_URL must be set in production");
  return "http://localhost:3000";
}
