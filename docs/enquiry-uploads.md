# SS enquiry uploads

The public form uploads up to six files directly to the private Cloudflare R2 bucket `structure-style-enquiry-uploads`. Each file may be up to 15 MB; the batch may be up to 60 MB. Netlify receives the enquiry text and private download links. The links are added to the job description so the current Make CRM notes mapping can carry them without changing the scenario.

## Who does what

Flow to Form has Turnstile and R2 Admin access in the SS Cloudflare account. On 22 September 2026, Flow to Form created the `SS enquiry uploads` Turnstile widget, created the `SS enquiry form uploads` R2 User API token restricted to the enquiry bucket, and saved the site-only CORS rule. Kaspar controls the SS Netlify project and must enter the private site environment variables there. Do not put credentials in Git, chat, or email. The R2 Secret Access Key is shown only on the token creation result screen, so the account holder must store it securely before leaving that screen.

## Cloudflare setup completed by Flow to Form

1. The Turnstile widget is configured for `structureandstyle.co.uk`, in Managed mode with pre-clearance off. The public site key is set for production builds in `netlify.toml`. Add a deploy preview hostname only while testing that preview.
2. The User API token has Object Read & Write permission only for `structure-style-enquiry-uploads`. The bucket remains private with no public development URL or public custom domain. The Access Key ID and one-time Secret Access Key must be handed to Kaspar privately.
3. The bucket has this saved CORS policy. Add the exact Netlify preview origin only if testing a preview:

   ```json
   [{
     "AllowedOrigins": ["https://structureandstyle.co.uk"],
     "AllowedMethods": ["PUT"],
     "AllowedHeaders": ["Content-Type"],
     "MaxAgeSeconds": 3600
   }]
   ```

## Netlify setup by Kaspar

1. Open the Netlify project serving `structureandstyle.co.uk` and confirm it is connected to `structureandstyle/incandescent-manatee-e242f2`.
2. Open **Project configuration > Environment variables > Add a variable > Import from a .env file**. Paste the five-line block supplied through the private handoff. Use the Production deploy context. If scopes are available, select Functions. Mark the values as secret where Netlify offers that control. The public Turnstile site key is already set for production builds in `netlify.toml`, so Kaspar does not need to enter it.

   Flow to Form should prepare the block below in a private note, replacing all four bracketed values before handing it to Kaspar. Generate the last value with a secure random generator, for example `openssl rand -hex 32`. Kaspar should receive the completed block, with no placeholders.

   ```dotenv
   R2_ACCOUNT_ID=498ba2e45d866087024dedacfabc47d1
   R2_ACCESS_KEY_ID=<Access Key ID from the open Cloudflare token result>
   R2_SECRET_ACCESS_KEY=<Secret Access Key from the open Cloudflare token result>
   SS_TURNSTILE_SECRET_KEY=<secret key from the SS enquiry uploads widget>
   SS_UPLOAD_LINK_SECRET=<new random 32-byte hex value>
   ```

3. Keep `SS_UPLOAD_LINK_SECRET` stable. Changing it invalidates existing download links. Do not place these five private values in `netlify.toml`; its variables are unavailable to Netlify Functions. The current live site keeps its original one-file form until PR #2 is merged and a production build runs.
4. Tell Flow to Form when the variable names and scopes are saved. Do not send the values. After PR #2 is merged into the production branch, confirm a new Netlify production deploy succeeds. Trigger a production deploy if one does not start automatically.
5. Submit a controlled enquiry with two harmless sample files and confirm both links appear in the Netlify `enquiry` submission. Flow to Form can check the private R2 bucket and both downloads. Whoever owns the CRM should confirm both links appear in its notes. Remove the controlled records and R2 objects after the check.

## Operation

- Upload tickets expire after 30 minutes. A download link is stable, but each click redirects to a one-minute R2 URL. Anyone holding the stable link can access its file, so keep it inside the enquiry record.
- The file checker permits JPG, PNG, WebP, HEIC, HEIF, PDF and Word documents. It rejects other extensions and limits file sizes in both the browser and ticket function.
- Netlify form submission happens only after all selected files upload. If the form post fails, the visitor can retry without uploading those files again in the current page session.
- Deleting an enquiry under the privacy notice also requires deleting its R2 objects. An abandoned upload can leave an unlinked object, so review the bucket for orphaned files as part of routine enquiry cleanup.
- The `attachment_links` form field preserves the links separately for a future Make mapping. The current Make scenario has not been changed and must be checked with a live controlled submission before this release is considered complete.
