/**
 * THE SITE'S REDIRECTS AND HEADERS ON CLOUDFLARE (15 Nov 2026).
 *
 * The same rules netlify.toml gives Netlify, as plain functions so the Worker
 * (./index.mjs) and tests/worker.test.mjs run the same code. netlify.toml
 * keeps its copy until the domain has moved and Netlify is switched off:
 * until then both hosts serve the same build. Change a rule here and there
 * in the same commit. docs/cloudflare-move.md has the whole move.
 */

export const CANONICAL_HOST = "structureandstyle.co.uk";

/**
 * Permanent redirects, checked before anything else. Returns the target URL
 * or null. www goes to the apex in one direction; the retired addresses
 * forward to their pages (netlify.toml says why each exists).
 */
const PATH_REDIRECTS = [
  { from: /^\/carpenter-hampstead-design(?:\/.*)?$/, to: "/carpenter-hampstead/" },
  { from: /^\/carpenter-camden(?:\/.*)?$/, to: "/areas/camden/" },
  { from: /^\/carpenter-primrose-hill(?:\/.*)?$/, to: "/areas/primrose-hill/" },
];

/** wrangler dev on this machine runs over plain http and is left alone. */
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function redirectFor(url) {
  const u = new URL(url);
  // The port goes too: Cloudflare serves plain http on ports such as 8080,
  // where it has no https, so the target is always the standard port.
  if (u.hostname === `www.${CANONICAL_HOST}`) {
    u.hostname = CANONICAL_HOST;
    u.protocol = "https:";
    u.port = "";
    return u.toString();
  }
  // Netlify forced HTTPS for every address; the Worker does it here, in the
  // same hop as a retired address's forward, so an old http:// link never
  // serves a page, or a visitor's photos, unencrypted (review, 16 Nov 2026).
  const insecure = u.protocol === "http:" && !LOCAL_HOSTS.has(u.hostname);
  if (insecure) {
    u.protocol = "https:";
    u.port = "";
  }
  for (const rule of PATH_REDIRECTS) {
    if (rule.from.test(u.pathname)) return new URL(rule.to, u.origin).toString();
  }
  return insecure ? u.toString() : null;
}

/** Every response from the site: the five security headers netlify.toml sets for /*. */
export const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // A year of HTTPS-only, without includeSubDomains (netlify.toml, 5 Sep 2026).
  "Strict-Transport-Security": "max-age=31536000",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  "X-Frame-Options": "DENY",
  // Deliberately not a full CSP (netlify.toml explains). form-action 'self'
  // still holds: the enquiry form posts to this origin, now to this Worker.
  "Content-Security-Policy": "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'",
};

/**
 * Cache-Control by path, the netlify.toml rules in the same order of
 * precedence: hashed /_astro/ files and fonts for a year, unhashed images for
 * a month. Returns null where Cloudflare's default (revalidate) should stand,
 * which is every page.
 */
export function cacheControlFor(pathname) {
  if (pathname.startsWith("/_astro/") || pathname.startsWith("/fonts/")) {
    return "public, max-age=31536000, immutable";
  }
  if (pathname.startsWith("/images/") || pathname.endsWith(".jpg")) {
    return "public, max-age=2592000, must-revalidate";
  }
  if (/\.(?:png|ico|svg)$/.test(pathname)) return "public, max-age=2592000";
  return null;
}

/**
 * Netlify set X-Robots-Tag: noindex on every non-production deploy. The
 * workers.dev address and any preview are the same here: only the real
 * domain may be indexed.
 */
export function isProductionHost(hostname) {
  return hostname === CANONICAL_HOST;
}
