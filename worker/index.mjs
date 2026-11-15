/**
 * THE STRUCTURE & STYLE SITE ON CLOUDFLARE (15 Nov 2026).
 *
 * One Worker in S&S's own Cloudflare account (a founder's choice, 15 Nov
 * 2026), serving the built Astro site from ./dist and doing what Netlify did
 * around it:
 *   - the redirects and headers in netlify.toml (./site-rules.mjs);
 *   - the enquiry form, which Netlify Forms received (./enquiry.mjs);
 *   - the three photo routes, which were Netlify Functions. They are the
 *     same files, imported from netlify/functions/, and run here unchanged:
 *     they use the web Request and Response, and node:crypto and process.env
 *     through the nodejs_compat flag in wrangler.jsonc.
 *
 * It runs before the static files on every request (run_worker_first), so
 * the rules above apply to all of them. Until the domain moves, Netlify keeps
 * serving the same build from the same repository; nothing here changes the
 * live site. docs/cloudflare-move.md has the move, the secrets and the order.
 */
import uploadTickets from "../netlify/functions/enquiry-upload-tickets.mjs";
import enquiryFile from "../netlify/functions/enquiry-file.mjs";
import enquiryFiles from "../netlify/functions/enquiry-files.mjs";
import { handleEnquiry } from "./enquiry.mjs";
import { SECURITY_HEADERS, cacheControlFor, isProductionHost, redirectFor } from "./site-rules.mjs";

const ROUTES = {
  "/api/enquiry-upload-tickets": uploadTickets,
  "/api/enquiry-file": enquiryFile,
  "/api/enquiry-files": enquiryFiles,
};

/** The site-wide headers on top of whatever the route or the static file set. */
function finish(response, url) {
  const out = new Response(response.body, response);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    if (!out.headers.has(name)) out.headers.set(name, value);
  }
  const cache = cacheControlFor(url.pathname);
  if (cache && response.ok) out.headers.set("Cache-Control", cache);
  if (!isProductionHost(url.hostname)) out.headers.set("X-Robots-Tag", "noindex");
  return out;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    const target = redirectFor(url);
    if (target) return Response.redirect(target, 301);

    const route = ROUTES[url.pathname];
    if (route) return finish(await route(request), url);

    if (request.method === "POST") {
      if (url.pathname === "/" || url.pathname === "/thanks/") {
        const answer = await handleEnquiry(request, env, ctx);
        if (answer) return finish(answer, url);
      }
      return finish(new Response("Method not allowed.", { status: 405, headers: { Allow: "GET, HEAD" } }), url);
    }

    const asset = await env.ASSETS.fetch(request);
    // The static files answer /contact with a 307 to /contact/. Netlify's
    // pretty URLs used a 301, which tells Google the slash form is the
    // address for good, so the same move is made permanent here.
    if (asset.status === 307) {
      const location = asset.headers.get("location");
      if (location && new URL(location, url).pathname === `${url.pathname}/`) {
        return finish(new Response(null, { status: 301, headers: { Location: location } }), url);
      }
    }
    return finish(asset, url);
  },
};
