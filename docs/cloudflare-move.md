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
    - `SS_UPLOAD_LINK_SECRET` is a new value on Cloudflare, and the "Attached files" links already in the shared log get re-signed with it (see "Old file links" below);
    - `SS_TURNSTILE_SECRET_KEY` comes from the widget in S&S's account;
    - the R2 keys and account ID are not needed on Cloudflare at all: the Worker reaches the bucket through its binding (see "Photos" below, 15 to 16 Nov).
  - **Spam:** Netlify's spam folder held 11 posts in the month to 15 Nov, and 10 of them never ran the form's script (subject still the placeholder `Website enquiry (%{submissionId})`, landing page empty): bots posting straight to the form, most of them asking "your price" in a different language each time. The eleventh was a person pitching a redesign. Every real enquiry ran the script.
- **Done, steps 1 and 2 (same evening):**
  - Kaspar created the Worker `structureandstyle-site` from his machine. Workers Builds is linked to `structureandstyle/incandescent-manatee-e242f2`, branch `main`, with build `npm run build:production`, deploy `npx wrangler deploy` and preview builds on. The Cloudflare GitHub app is installed on the `structureandstyle` account.
  - The pull request with this code merged at 17:55 UTC, and Cloudflare built it in about 40 seconds. It answers on https://structureandstyle-site.cold-bush-4b5f.workers.dev only, noindexed.
  - Checked there: every page, the 301 to the slash form, both retired-address redirects, the 404 page, all six security headers, `noindex`, and the cache rules. The photo routes answer "Uploads are not configured", correct until step 3. A honeypot post is dropped with a 303.
  - The build image ran Node 24.22.1.
- **Done, the build settings and the spam filter (PR #52, merged 18:18 UTC):**
  - The dashboard would not save build variables for a member who does not own the build's access key: it is Kaspar's, and the page offers to create a new one. So the code carries them:
    - `.node-version` pins Node 22.20.0;
    - `astro.config.mjs` gives a build of `main` the public Turnstile key and `CONTEXT=production`, from Cloudflare's `WORKERS_CI_BRANCH`;
    - `scripts/verify-build.mjs` reads the same variable.
  - Checked on the test address after it deployed: `/contact/` carries `data-sitekey` and the upload fieldsets.
  - The spam filter: see "Spam" below. A spam test landed under `spam/` in the bucket.
  - Previews get their own empty bucket, `structure-style-enquiry-uploads-preview`, which Cloudflare requires before it builds a preview.
- **Done, step 3 and step 5, and the plain test (15 Nov, by 18:55 UTC):**
  - The secrets were entered as type Secret from Kaspar's login. `SS_UPLOAD_LINK_SECRET` is a new random value, since Netlify's could not be read.
  - Make scenario 7361484 now has a router after the inbox row: route 1 is the original CRM modules, unchanged; route 2 is the Gmail step from team@, to team@flowtoform.co.uk and info@structureandstyle.co.uk, with the filter "`email_text` exists".
  - A plain test enquiry on the workers.dev address went through end to end: the Make run, the inbox row, the email to both addresses, and the copy under `submissions/`.
- **Photos: the bucket keys are gone (15 to 16 Nov).** The first photo test failed at the upload. The ticket was issued, but the bucket refused the file, because the `R2_ACCESS_KEY_ID` secret held an API token's value, not the 32-character Access Key ID. It was entered three times and held a token value each time. A key that can be pasted wrong breaks every photo upload with nothing on screen to say why. So the Worker now writes the photos through its bucket binding and needs no bucket keys at all (`worker/uploads.mjs`, see "Photos" below).
- **Done, photos end to end (16 Nov, 08:53 UTC).** The photos PR (#53) merged at 08:38 UTC, and Cloudflare had it live 31 seconds later.
  - Checked on the workers.dev address: http:// goes to https://; the upload address answers; a bad file link is refused.
  - A test enquiry with two photos went through the whole path:
    - the ticket, and both uploads to the Worker's own address;
    - the enquiry post and the thank-you page;
    - the Make run (webhook, inbox row, email; the CRM step skipped the test, as designed);
    - inbox row 23 with its "Attached files" link, marked Test;
    - the email from team@ to team@ and info@structureandstyle.co.uk;
    - the files page, with both photos showing.
  - Turnstile passed on its own once the browser window was on screen. In a minimised window it stalls at "Verifying…".
  - **Found on the way:** a founder's test sent through the live Netlify site on 15 Nov at 19:57 reached the Enquiry log as an open enquiry. The CRM step only skips names containing "test" and flowtoform.co.uk addresses, and it was neither. Founders testing on the live site should put "test" in the name.
- **Done, step 8: the site moved (16 Nov, about 09:15 UTC).** A founder's go, Kaspar not present: team@ is an Administrator of the whole account, which covers DNS, Workers and SSL.
  - **Before:**
    - Email Address Obfuscation turned **off**, so pages are served exactly as Netlify served them. It had been on by default, and would have rewritten info@ on every page.
    - The universal certificate for the domain and `*.` subdomains was already Active.
    - AI crawler policies (search, training, agents) were all already "Allow".
  - **The switch:** the apex `A 75.2.60.5` was deleted, `structureandstyle.co.uk` was added as the Worker's custom domain within seconds, then the same for `www` and its Netlify CNAME. Cloudflare refuses a custom domain while another record holds the name, so the delete has to come first.
  - **Checked live,** through Cloudflare:
    - pages 200; http to https, www to the apex, the trailing slash and the retired address all 301; the 404 page;
    - robots.txt and the sitemap; the upload route;
    - all six security headers, and **no** `X-Robots-Tag` on the real domain;
    - the Turnstile key on the form, and no email obfuscation;
    - MX unchanged.
    - Public DNS showed Cloudflare for the apex at once, and for www within five minutes.
- **Done, step 9's photo test on the real domain (16 Nov, 09:26 UTC).** A test enquiry with two photos from `structureandstyle.co.uk/contact/` went through the ticket, both uploads to the Worker, the enquiry and the thank-you page. Then:
  - the Make run (3 steps; the CRM step skipped the test);
  - inbox row 24, its files link now on the real domain, marked Test;
  - the email from team@ to team@ and info@;
  - both photos on the files page.
  - Netlify sent no email for it: Netlify no longer receives enquiries, so nothing arrives twice.
  - The old Netlify-signed links now answer 403, as expected, until they are re-signed.
- **Next:**
  - Tell Kaspar: new-enquiry emails now come from team@ with the subject "Name / Area / Service", Netlify is gone, and Make is named under the data agreement.
  - ~~Re-sign the old file links~~ **Done 16 Nov, by 10:10 UTC.**
    - The 15 Nov link secret had been made on Kaspar's laptop and never saved, so a founder made a new one on their own machine, saved it in the founders' vault and set it in the Worker. That cost nothing: no real enquiry had come in since the switch, so only today's test links used the old one.
    - `scripts/resign-file-links.mjs` made the five links again. All five open on the live site: four photos, and a files page whose six pictures all open.
    - The new links sit next to the old ones:
      - inbox tab, "Attachment URL", rows 7, 8 and 14;
      - Enquiry log, Notes, after "Attachment:", rows 15, 16 and 18.
    - The old links stay in the job descriptions until step 9's first week has passed.
  - ~~Delete `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` from the Worker's settings~~ **Done 16 Nov, about 10:50 UTC** (a founder's go; "Delete & Deploy", versions 587a2f0d and 5bd33429). The Worker now holds three secrets (`MAKE_WEBHOOK_URL`, `SS_TURNSTILE_SECRET_KEY`, `SS_UPLOAD_LINK_SECRET`) and the `UPLOADS` bucket binding, nothing else. Checked live afterwards: pages, the form's Turnstile key, a customer photo link, the files page, and the ticket route checking Turnstile.
  - Any R2 token made for the Worker on 15 Nov can go. It was made from Kaspar's login, so it is listed under R2, Manage API tokens, **Account** API tokens, which only he can see.
  - **Leave the user token `SS enquiry form uploads` alone until step 10.** team@ made it on 22 Sep 2026. Netlify no longer serves the site, but keep it until Netlify is switched off in case step 8 has to be undone.

## What moves and what stays

| Part | On Netlify today | On Cloudflare |
|---|---|---|
| The pages | Netlify serves `dist/` | The Worker serves `dist/` (`worker/index.mjs`, static assets) |
| Redirects and headers | `netlify.toml` | `worker/site-rules.mjs`, the same rules; a test checks they match |
| Photo routes (`/api/enquiry-upload-tickets`, `/api/enquiry-file`, `/api/enquiry-files`) | Netlify Functions; the browser sends each file straight to R2 on an address presigned with the bucket's S3 keys | `worker/uploads.mjs`: the browser sends each file to the Worker (`/api/enquiry-upload`), which writes it through its bucket binding; file links stream from the bucket. No bucket keys. The checks, the file rules and the links are shared with Netlify's functions (`netlify/functions/lib/enquiry-uploads.mjs`); the files page is Netlify's own function, run unchanged |
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
   - **Secrets:** ~~copy four values from Netlify~~ Netlify would not show them (15 Nov). The Worker has its own `SS_UPLOAD_LINK_SECRET` and `SS_TURNSTILE_SECRET_KEY`, and needs no R2 keys.
   - **The link secret changed,** so the "Attached files" links already in the log stop opening once the domain moves. The files themselves are safe in the bucket: see "Old file links" below.
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
   - No build variables: the repository sets them (`.node-version`, and `astro.config.mjs` for a build of `main`).
3. **Secrets** (Worker, Settings, Variables and secrets, type Secret; never in Git, chat or email):

   | Name | Value |
   |---|---|
   | `MAKE_WEBHOOK_URL` | The webhook of Make scenario 7361484 (module 1, "SS Netlify enquiry live"), the same address Netlify posts to. From Make, by a founder |
   | `SS_UPLOAD_LINK_SECRET` | A new random value, since Netlify's could not be read: 48 random bytes in Base64, 64 characters. The 15 Nov one was never saved, so it was made again in PowerShell on 16 Nov and **kept in the founders' vault**. It signs every file link, so keep it: changing it stops every link the Worker made from opening |
   | `SS_TURNSTILE_SECRET_KEY` | The widget's secret, from Turnstile in the same account. Every ticket request is checked with it |

   No R2 keys and no account ID: the Worker reaches the bucket through its binding (16 Nov). Three secrets, and nothing else.

4. **Test on the workers.dev address.** It sends `X-Robots-Tag: noindex`.
   - Check pages, redirects and headers.
   - Send one test enquiry with "test" in the name: Make's filter keeps it out of the Enquiry log, and the inbox row is marked Test after.
   - Check the Make run, the inbox row and the copy in R2 under `submissions/`.
   - Photo uploads only work there once the workers.dev host is in the Turnstile widget's hostnames (added 15 Nov). The bucket's CORS rule no longer matters to the Worker, since the browser sends the files to the Worker, not to the bucket. Remove the workers.dev host from both after step 9.
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
   - **After an undo, links the Worker signed do not open on Netlify:** the re-signed ones, and those of enquiries the Worker took in between. Netlify checks links with its own secret. Use the Netlify link kept next to each re-signed one. Or open the Worker's link with its address changed to `structureandstyle-site.cold-bush-4b5f.workers.dev`, which keeps answering. If step 8 is then done again, re-sign the links of every enquiry Netlify took in between too.
9. **Check it live:**
   - pages, the six security headers, the redirects, www to the apex, http:// to https:// (the Worker does it, as Netlify did), the 404 page;
   - one test enquiry, with a founder's OK: the email from Make, the inbox row, the R2 copy;
   - one with two photos: both open from the files link.
   - Watch the first week of real enquiries against the Make run history.
10. **A week later, tidy up:**
    - **Before Netlify goes,** copy out the files of the three September enquiries: they were sent through Netlify's own form upload, and their "Attachment URL" in the inbox tab points at Netlify's storage (`d33wubrfki0l68.cloudfront.net`), which goes with the site.
    - Kaspar turns off and deletes the Netlify site.
    - Then delete the R2 user token `SS enquiry form uploads` (made by team@ on 22 Sep 2026, Netlify's bucket keys) and the bucket's CORS rule. Nothing else uses either.
    - Remove `netlify.toml`, the `data-netlify`, `netlify-honeypot` and `data-remove-prefix` attributes, and Netlify's `%{submissionId}` placeholder in the form. The Worker fills it, so it can stay until then.
    - Delete what only Netlify used:
      - the files `netlify/functions/enquiry-upload-tickets.mjs`, `netlify/functions/enquiry-file.mjs` and `netlify/functions/lib/r2-client.mjs`;
      - the two `@aws-sdk` packages in `package.json`;
      - the Netlify handler tests in `tests/enquiry-uploads.test.mjs`, and the line in `tests/worker-uploads.test.mjs` that expects Netlify's route to import `r2-client.mjs`.
    - Move what the Worker uses, `netlify/functions/lib/enquiry-uploads.mjs` and `netlify/functions/enquiry-files.mjs`, to `functions/`. In the files page, drop `https://*.r2.cloudflarestorage.com` from its image rule and the comments about redirects to R2.
    - Rewrite `docs/enquiry-uploads.md` for the Worker alone: no R2 token, no keys, no CORS rule.
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

- **Photos** (`worker/uploads.mjs`, 16 Nov 2026). The form's script is unchanged: it asks for a ticket per file, sends each file to the address on its ticket, then posts the enquiry with the one files link.
  - **A ticket** (`POST /api/enquiry-upload-tickets`) passes the same checks as on Netlify: same origin, Turnstile, up to six files, 15 MB each, 60 MB together, the allowed types. Each file gets a signed link to `/api/enquiry-upload` for its own name and exact size, good for 30 minutes.
  - **The upload** (`PUT /api/enquiry-upload`) must match its ticket: the signature, the time, the type from the file's extension, and the size, byte for byte. The Worker writes it to the bucket through the binding. Anything else is refused, and nothing is kept.
  - **The file link** (`/api/enquiry-file`) streams the file from the bucket. Its type comes from the extension the link signs. Opened directly, it downloads and nothing in it can run. The files page (`/api/enquiry-files`) is Netlify's own function.
  - **No bucket keys, no CORS rule, no keys to rotate.** The photos need two secrets: `SS_UPLOAD_LINK_SECRET` signs every link, and `SS_TURNSTILE_SECRET_KEY` checks each ticket request.
  - **The upload carries the site's cookies** (`credentials: "same-origin"` in the form). On Cloudflare the file goes through the site's own zone, so if the zone ever challenges visitors (Under Attack mode during a spam wave, or a challenge rule), Cloudflare's clearance cookie must travel with it. Netlify's R2 address is another origin, which gets no cookies either way.
  - **Every body is read only up to its limit:** 10 KB for a ticket request, 1 MB for an enquiry. That holds whatever the headers say, so a sender cannot fill the Worker's memory with a body that states no length.
  - **Previews** bind the same name to the empty preview bucket, so a test upload on a preview never lands beside real enquiries.
- **Old file links.** Links signed with Netlify's link secret stop opening once the domain moves: the Worker signs with its own, and Netlify's cannot be read.
  - **Affected:** five links on three real enquiries (8, 18 and 30 Oct), plus test rows. The files are safe in the bucket. If step 8 is ever undone and done again, add the links of every enquiry Netlify took in between.
  - **The fix:** `scripts/resign-file-links.mjs` makes each link again, for the same file or folder, with the Worker's secret.
    - A founder runs it in PowerShell or Windows Terminal and pastes the secret at its hidden prompt, never into chat or a file. It refuses to ask anywhere it could not hide what is pasted.
    - It accepts only the link secret's shape (64 characters of letters, digits, `+` and `/`), so the Turnstile secret pasted by mistake is refused rather than making links that never open.
    - It reads the list of old links whether the file was saved as UTF-8 or by Windows PowerShell (UTF-16).
    - It writes "old link, new link" pairs, kept outside the repository because they open customers' photos.
    - **Before adding any to the log,** open one new link with its address changed to `structureandstyle-site.cold-bush-4b5f.workers.dev`. If it opens, the secret was the right one.
  - **Keep both links** in the shared log, the new one added next to the old, until step 9's first week has passed. Then drop the old one. Replacing it outright would leave nothing that opens on Netlify if step 8 had to be undone.
- **http:// goes to https://** (`redirectFor` in `worker/site-rules.mjs`), in the same hop as www to the apex or a retired address's forward, always to the standard port, as Netlify forced it. Without it, an old http:// link would serve pages, and now photo uploads, unencrypted. `wrangler dev` on this machine runs over http and is left alone.
- **Spam.** Netlify ran every post through its spam filter (Akismet). The Worker's check (`spamReason` in `worker/enquiry.mjs`, 15 Nov 2026) is built from what that filter actually caught.
  - **How it decides:** the form's script adds `ec_e` at Send, the milliseconds the page had been open, on the visitor's own clock. A post is spam if, in order:
    - the honeypot is filled;
    - it has no name, phone or email;
    - `ec_e` is missing, meaning the script did not run, as with 10 of Netlify's 11;
    - it was sent within 2.5 seconds;
    - the job box holds more than five links.
  - **Nothing is deleted.** Spam is kept as `spam/YYYY-MM/<id>.json` in the uploads bucket, with the reason, and is not sent to Make or emailed. The sender sees the thank-you page either way.
  - **Look in `spam/` once a month,** as nobody did with Netlify's spam folder. A real enquiry kept there by mistake, most likely from someone with JavaScript switched off, can be replayed to the Make webhook.
  - **Not caught:** a person typing a sales pitch. The log's Review status handles those, as before.
  - **If spam still gets through:** add Cloudflare's free rate-limiting rule on `POST /` and `POST /thanks/`, or extend the Turnstile check to every send.
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
- **Checked before the photos PR (16 Nov).**
  - `npm test`: 88 pass. Twenty are new:
    - **The Worker's photos (11, `tests/worker-uploads.test.mjs`):**
      - tickets that point at the Worker;
      - a file in and back out intact;
      - every way an upload link can be misused;
      - no signature standing in for another kind;
      - a missing file;
      - the missing binding;
      - nothing the Worker loads, following its imports, bringing in the AWS SDK or bucket keys;
      - the account ID in no file of the repository (checked by its hash);
      - the form's script still sending to its ticket's address with the site's cookies;
      - oversized ticket and enquiry posts refused without being read whole.
    - **http:// to https:// in one hop, the port dropped (1).**
    - **The re-sign tool (8),** including a wrong secret refused, a UTF-16 file read, a file with no links failing loudly, and no prompt without a terminal.
  - Netlify's own photo tests pass unchanged. The new photo tests passed 40 runs in a row.
  - **An independent review** looked at four things (security, Cloudflare's runtime, compatibility with the form and Netlify, the docs), with a separate skeptic trying to refute each serious finding. Two were confirmed and fixed:
    - one test passed or failed by chance;
    - this runbook would have had the old links overwritten, which breaks step 8's undo.
    - The fixes above for https, the upload cookies, the body limits and the token clean-up came from its lower-severity findings.
  - **A second, shorter review** went over those fixes: the redirect, the body limits, the cookies and the re-sign tool. Nothing serious held up. Its four small points are fixed: the redirect now drops a non-standard port, and the tool refuses a wrong secret, reads UTF-16 files, fails loudly on a file with no links, and will not ask for the secret outside a real terminal.
  - `wrangler deploy --dry-run`: 8 KB gzipped, down from 126 KB, with no AWS SDK in it.
  - `wrangler dev` 4.162.0, Cloudflare's runtime on this machine with a local bucket, 25 checks, all passed after the review's fixes:
    - a real photo in and back out, byte for byte, with the right headers;
    - the files page, with both photos opening;
    - a chunked upload of the right size kept;
    - one too short and one too long refused, with nothing stored;
    - a changed size, a wrong type, a GET, an expired ticket and a wrong file signature all refused;
    - the ticket route reaching Cloudflare's Turnstile check, which refused the stand-in secret, as it should;
    - enquiry posts read through the new body limit and saved: multipart to `/thanks/` (303) and to `/` (200), urlencoded, and a no-script post kept as spam;
    - a 5 MB enquiry body and a 1 MB ticket body, both sent with no stated length, refused before being read whole.
  - **Not tested here:** a real Turnstile pass and S&S's real bucket. Both are covered by the test on the workers.dev address after the merge.
