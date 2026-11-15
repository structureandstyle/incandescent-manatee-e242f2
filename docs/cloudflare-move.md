# Moving the site from Netlify to Cloudflare

*Written 15 Nov 2026. A founder asked to move the site off Netlify. Decided the same day: it goes into **S&S's own Cloudflare account** (where the enquiry uploads bucket and the Turnstile widget already are), and **Make sends the new-enquiry email**, as one Gmail step in scenario 7361484, so no new company joins the data agreement. Update this file as each step is done.*

## Where it stands

**15 Nov 2026, evening (a founder with Kaspar present):**
- **Done:** team@ is a member of S&S's Cloudflare account, "Info@structureandstyle.co.uk's Account".
- **Done, steps 6 and 7:**
  - The zone was added on the Free plan, with Bot Preference Sync off, so Cloudflare never edits the site's robots.txt.
  - All 13 records are DNS only. Wix's own list showed one record a resolver could not: `en` CNAME `cdn3.wixdns.net`, which was added.
  - Every record was checked identical on both Cloudflare nameservers and on Wix's, before the switch.
  - DNSSEC was off.
  - The nameservers at Wix were changed to `carioca.ns.cloudflare.com` and `garrett.ns.cloudflare.com`. Wix's "Reset to Wix" button undoes it.
  - The zone is active. The site still runs straight to Netlify, and email is unchanged.
- **Found in Netlify:**
  - **Deploys are paused.** Kaspar's team is on "operational credits", so production deploys are paused until his next billing cycle or an upgrade. The site stays live, but nothing merged now deploys there.
  - **Notifications:** emails go to **info@structureandstyle.co.uk** and **team@flowtoform.co.uk**, plus the Make webhook.
  - **The secrets cannot be copied out.** All five environment variables are marked Secret values, which Netlify never shows again. So:
    - `SS_UPLOAD_LINK_SECRET` will be a new value on Cloudflare, and the few "Attached files" links already in the shared log get re-signed with it;
    - `SS_TURNSTILE_SECRET_KEY` comes from the widget in S&S's account;
    - the R2 keys come from a new R2 token limited to the bucket;
    - `R2_ACCOUNT_ID` is `498ba2e45d866087024dedacfabc47d1`.
  - **Spam:** Netlify's spam folder held 11 bot posts in the past month, many of them "I wanted to know your price" in other languages. The Worker must filter more than the honeypot before step 8.
- **Next:** step 2 (create the Worker), then steps 3 to 5, then step 8.

## What moves and what stays

| Part | On Netlify today | On Cloudflare |
|---|---|---|
| The pages | Netlify serves `dist/` | The Worker serves `dist/` (`worker/index.mjs`, static assets) |
| Redirects and headers | `netlify.toml` | `worker/site-rules.mjs`, the same rules; a test checks they match |
| Photo routes (`/api/enquiry-upload-tickets`, `/api/enquiry-file`, `/api/enquiry-files`) | Netlify Functions | The same files in `netlify/functions/`, run by the Worker unchanged |
| The enquiry form | Netlify Forms keeps it, emails it, sends it to Make | The Worker saves it in R2 (`submissions/`), then sends it to the same Make webhook in the same shape (`worker/enquiry.mjs`) |
| The new-enquiry email | Netlify, from formresponses@netlify.com | Make's new Gmail step, from team@ |
| Build and deploy | Netlify builds `main` from GitHub | Cloudflare Workers Builds builds `main` from the same GitHub repository |
| DNS | Wix (ns6/ns7.wixdns.net) | A Cloudflare zone in S&S's account. **The domain stays registered at Wix, in Kaspar's name** |

**Unchanged:** the GitHub repository, the R2 bucket `structure-style-enquiry-uploads`, the Turnstile widget, Make scenario 7361484 and its mapping, the shared enquiry log, Google Workspace email.

Until step 8, nothing here changes the live site: Netlify ignores `worker/` and `wrangler.jsonc`, and Cloudflare ignores `netlify.toml`. Both hosts can serve the same commit.

## What we need from Kaspar

1. **Cloudflare access.** Invite team@flowtoform.co.uk to his Cloudflare account with rights to deploy Workers and edit DNS (the Administrator role is simplest). Today we have Turnstile and R2 only.
2. **Netlify settings.**
   - **Notification emails:** tell us which addresses get the form notification emails today, so Make sends to the same ones.
   - **Secrets:** copy four values from the Netlify site's environment variables into the Cloudflare Worker himself: `SS_UPLOAD_LINK_SECRET`, `SS_TURNSTILE_SECRET_KEY`, `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY`.
   - **Keep the link secret identical.** `SS_UPLOAD_LINK_SECRET` must be the same value on Cloudflare, or every "Attached files" link already in the log stops opening. If Netlify will not show it, say so before the move: those old links would need a decision.
3. **Change the nameservers at Wix himself** (step 7), at a time we give him once the zone is ready, to the two names we send. Messages to Kaspar give what to do and when, and no call offers (Arthur, 12 Nov 2026).
4. **A week after the move,** turn off the Netlify site's form notifications and outgoing webhook, then delete the Netlify site.

Tell him, do not ask him (the agreement allows it): after the move Netlify is no longer one of the companies we use for his site. Cloudflare is already named in the data agreement. Make still has to be named, as owed since 5 Nov.

## The order

Each step can be checked, and undone, before the next.

1. **Merge this pull request.** It adds files only. Netlify keeps building and serving exactly as now.
2. **Create the Worker** in S&S's account: Workers and Pages, Create, then Import a repository. Choose `structureandstyle/incandescent-manatee-e242f2` (the repository Netlify deploys from), branch `main`.
   - Build command: `npm run build:production`
   - Deploy command: `npx wrangler deploy`
   - Non-production branches: build `npm run build`, deploy `npx wrangler versions upload`
   - Build variables:
     - `NODE_VERSION=22.20.0`, the pin netlify.toml gives;
     - `PUBLIC_SS_TURNSTILE_SITE_KEY=0x4AAAAAAE_4Ksd9JvaaXUXM`, public, set for production only, as in netlify.toml;
     - `CONTEXT=production`, which `scripts/verify-build.mjs` reads.
3. **Secrets** (Worker, Settings, Variables and secrets, type Secret; never in Git, chat or email):

   | Name | Value |
   |---|---|
   | `MAKE_WEBHOOK_URL` | The webhook of Make scenario 7361484 (module 1, "SS Netlify enquiry live"), the same address Netlify posts to. From Make, by a founder |
   | `SS_UPLOAD_LINK_SECRET` | Netlify's value, unchanged (see above) |
   | `SS_TURNSTILE_SECRET_KEY` | Netlify's value, or the widget's secret from Turnstile in the same account |
   | `R2_ACCOUNT_ID` | S&S's Cloudflare account ID |
   | `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | Netlify's values, or a new R2 token limited to the bucket, Object Read and Write |

4. **Test on the workers.dev address.** It sends `X-Robots-Tag: noindex`.
   - Check pages, redirects and headers.
   - Send one test enquiry with "test" in the name: Make's filter keeps it out of the Enquiry log, and the inbox row is marked Test after.
   - Check the Make run, the inbox row and the copy in R2 under `submissions/`.
   - Photo uploads only work there if the workers.dev host is added to the Turnstile widget's hostnames and to the bucket's CORS rule for the test. Remove both afterwards.
5. **Make: add the email step.** Add a Gmail "Send an email" module after module 1 (the webhook), using a new team@ Gmail connection, which a founder authorises.
   - **To:** team@flowtoform.co.uk plus the addresses Kaspar names.
   - **Subject:** `{{1.data.subject}}`
   - **Content:** `{{1.email_text}}`
   - **Reply-To:** `{{1.data.email}}`
   - **Filter:** give it the filter "`email_text` exists". Netlify's posts have no `email_text`, so during the overlap only the Worker's posts send an email, and nothing arrives twice.
   - **team@ Gmail:** add a filter for `from:(team@flowtoform.co.uk) "Sent from the enquiry form on structureandstyle.co.uk"`, applying the label `10_Clients/Structure & Style/Enquiries`, never spam, important. Today's filter K2 keys on formresponses@netlify.com, and the new subject ("Name / Area / Service") has no fixed word to match. Record it in F2F SOP 09.
6. **Add the zone** structureandstyle.co.uk to S&S's account on the Free plan. Cloudflare copies the records it can find. Make it match the table below exactly before going further:
   - all records set to DNS only (grey cloud);
   - the apex and www still pointing at Netlify, as now.

   Ask Kaspar for a screenshot of the Wix DNS page, to catch any record a resolver cannot see. Add the OpenAI business claim TXT here if it is still wanted, with a fresh value from the OpenAI page.
7. **Kaspar changes the nameservers at Wix** to the two Cloudflare gives, at the time we agreed. Because every record is the same, the site and email carry on exactly as before while it spreads (the old NS records have a 6-hour TTL).
   - **Check it has spread:** `https://dns.google/resolve?name=structureandstyle.co.uk&type=NS`.
   - **Check email still flows both ways:** send a message to info@structureandstyle.co.uk and have Kaspar reply.
   - **To undo:** put the Wix nameservers back.
8. **Switch the site.** In the Worker, Settings, Domains and Routes, add the custom domains `structureandstyle.co.uk` and `www.structureandstyle.co.uk`. First delete the apex `A 75.2.60.5` and the `www` CNAME to Netlify, which the custom domains replace. The site moves within minutes.
   - **To undo, in minutes:** remove the two custom domains, then put back `A 75.2.60.5` and the `www` CNAME `incandescent-manatee-e242f2.netlify.app`, both DNS only.
9. **Check it live:**
   - pages, the six security headers, the redirects, www to the apex, the 404 page;
   - one test enquiry, with a founder's OK: the email from Make, the inbox row, the R2 copy;
   - one with two photos: both open from the files link.
   - Watch the first week of real enquiries against the Make run history.
10. **A week later, tidy up:**
    - Kaspar turns off and deletes the Netlify site.
    - Remove `netlify.toml`, the `data-netlify`, `netlify-honeypot` and `data-remove-prefix` attributes, and Netlify's `%{submissionId}` placeholder in the form. The Worker fills it, so it can stay until then.
    - Move `netlify/functions/` to `functions/`.
    - Update the privacy notice, which says the site is hosted by Netlify and Netlify processes the form, with copy written under S&S protocol v1.4.
    - Update the client runbook in the ops repository.
    - Tell Kaspar Netlify is gone and Make is named.

## DNS records to carry over

Read from a public resolver on 15 Nov 2026. A record only Wix can see would not show here, which is why step 6 asks for Kaspar's screenshot.

| Name | Type | Value | Note |
|---|---|---|---|
| structureandstyle.co.uk | MX | 10 aspmx.l.google.com | Google Workspace. **Email breaks if any MX is wrong** |
| structureandstyle.co.uk | MX | 20 alt1.aspmx.l.google.com | |
| structureandstyle.co.uk | MX | 30 alt2.aspmx.l.google.com | |
| structureandstyle.co.uk | MX | 40 alt3.aspmx.l.google.com | |
| structureandstyle.co.uk | MX | 50 alt4.aspmx.l.google.com | |
| structureandstyle.co.uk | TXT | `v=spf1 include:_spf.google.com ~all` | Sending permission for Google |
| structureandstyle.co.uk | TXT | `google-site-verification=6ZNbLWWo...` | Search Console. Copy the full value from Wix, never retype |
| structureandstyle.co.uk | TXT | `google-site-verification=avSAm2lF...` | Google Workspace. **Must stay** |
| _dmarc | TXT | `v=DMARC1; p=none` | |
| google._domainkey | TXT | `v=DKIM1; k=rsa; p=MIIBIjAN...` (long) | Google Workspace DKIM. Copy the full value |
| structureandstyle.co.uk | A | 75.2.60.5 | Netlify. Stays until step 8, then is replaced by the Worker's custom domain |
| www | CNAME | incandescent-manatee-e242f2.netlify.app | Netlify. The same |
| en | CNAME | cdn3.wixdns.net | Left from the old Wix site. Only on Wix's own list; carried over as it was |

## Things to know

- **Spam.** Netlify ran every post through its spam filter (Akismet). The Worker has the honeypot only, and drops a post with no name, phone or email. Watch the first two weeks.
  - **If spam gets through:** add Cloudflare's free rate-limiting rule on `POST /` and `POST /thanks/`, or extend the Turnstile check to every send.
- **If Make is down,** the lead is not lost. The Worker saves each enquiry before sending it, as `submissions/YYYY-MM/<id>.json` in the uploads bucket, with `forwarded` true or false.
  - **To replay one:** post its JSON, without `forwarded` and `make_status`, to the Make webhook.
  - **Errors:** they show in the Worker's logs, where observability is on.
- **Keeping the copies.** The `submissions/` copies are personal data, like the Netlify dashboard's copy was. **Open, a founder's call:** how long to keep them, for example an R2 lifecycle rule deleting after twelve months. Then make the privacy notice say it.
- **Sending is the same for the visitor.**
  - The plain post goes to `/thanks/` and lands on the thank-you page (303).
  - The script's post after photo uploads goes to `/` and gets 200.
  - `/contact` redirects permanently to `/contact/`, as on Netlify.
- **Checked before the pull request.**
  - `npm test`: 65 pass, 13 of them for the Worker, including that every netlify.toml redirect and security header has its rule here.
  - `wrangler deploy --dry-run`: 126 KB gzipped.
  - `wrangler dev`, Cloudflare's own runtime on this machine, against the production build, with a stand-in Make. It checked:
    - the pages, the trailing-slash 301, the redirects, www to the apex, the 404 page;
    - all six headers, and the cache rules;
    - the three photo routes;
    - both kinds of post;
    - spam dropped;
    - Make receiving the fields its scenario maps.
  - **Not tested:** anything in S&S's real account (no access yet), real uploads to R2 from the Worker, and the Make Gmail step.
