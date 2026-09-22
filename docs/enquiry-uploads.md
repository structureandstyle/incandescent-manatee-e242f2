# SS enquiry uploads

The public form uploads up to 10 files directly to the private Cloudflare R2 bucket `structure-style-enquiry-uploads`. Each file may be up to 15 MB; the batch may be up to 60 MB. Netlify receives the enquiry text and private download links. The links are added to the job description so the current Make CRM notes mapping can carry them without changing the scenario.

## Who does what

Flow to Form has Turnstile and R2 Admin access in the SS Cloudflare account. After authorization, Flow to Form can create the widget and restricted R2 token and save the bucket CORS rule. Kaspar controls the SS Netlify project and must enter the site environment variables there. Do not put credentials in Git, chat, or email. Agree a private credential handoff with Kaspar before creating the one-time R2 secret.

## Cloudflare preparation by Flow to Form

1. Create a Turnstile widget for `structureandstyle.co.uk`. Use Managed mode with pre-clearance off. Record its site key and secret key. Add a deploy preview hostname only while testing that preview.
2. Create a User API token with Object Read & Write permission, applying it only to `structure-style-enquiry-uploads`. Record the Access Key ID and Secret Access Key when they appear. The secret cannot be viewed again. Keep the bucket private. Do not enable a public development URL or public custom domain.
3. Set this R2 CORS policy on the bucket, adding the exact Netlify preview origin only if testing a preview:

   ```json
   [{
     "AllowedOrigins": ["https://structureandstyle.co.uk"],
     "AllowedMethods": ["PUT"],
     "AllowedHeaders": ["content-type"],
     "MaxAgeSeconds": 3600
   }]
   ```

## Netlify setup by Kaspar

1. Open the Netlify project serving `structureandstyle.co.uk` and confirm it is connected to `structureandstyle/incandescent-manatee-e242f2`.
2. Open **Project configuration > Environment variables**. Add the following as site variables. Use the Production deploy context. If scopes are available, select Functions for the first five and Builds for the last one. Mark private values as secret where Netlify offers that control.

   | Variable | Value |
   | --- | --- |
   | `R2_ACCOUNT_ID` | Cloudflare account ID from R2 Overview |
   | `R2_ACCESS_KEY_ID` | Restricted R2 token Access Key ID |
   | `R2_SECRET_ACCESS_KEY` | Restricted R2 token Secret Access Key |
   | `SS_TURNSTILE_SECRET_KEY` | Turnstile secret key |
   | `SS_UPLOAD_LINK_SECRET` | A new random 32-byte value, for example the output of `openssl rand -hex 32` |
   | `PUBLIC_SS_TURNSTILE_SITE_KEY` | Turnstile site key |

3. Keep `SS_UPLOAD_LINK_SECRET` stable. Changing it invalidates existing download links. Do not place any of these values in `netlify.toml`; its variables are unavailable to Netlify Functions. Set `PUBLIC_SS_TURNSTILE_SITE_KEY` last. Until this public key is set and the site is rebuilt, the site keeps its original one-file form.
4. Tell Flow to Form when the variable names and scopes are saved. Do not send the values. After PR #2 is merged into the production branch, confirm a new Netlify production deploy succeeds. Trigger a production deploy if one does not start automatically.
5. Submit a controlled enquiry with two harmless sample files and confirm both links appear in the Netlify `enquiry` submission. Flow to Form can check the private R2 bucket and both downloads. Whoever owns the CRM should confirm both links appear in its notes. Remove the controlled records and R2 objects after the check.

## Operation

- Upload tickets expire after 30 minutes. A download link is stable, but each click redirects to a one-minute R2 URL. Anyone holding the stable link can access its file, so keep it inside the enquiry record.
- The file checker permits JPG, PNG, WebP, HEIC, HEIF, PDF and Word documents. It rejects other extensions and limits file sizes in both the browser and ticket function.
- Netlify form submission happens only after all selected files upload. If the form post fails, the visitor can retry without uploading those files again in the current page session.
- Deleting an enquiry under the privacy notice also requires deleting its R2 objects. An abandoned upload can leave an unlinked object, so review the bucket for orphaned files as part of routine enquiry cleanup.
- The `attachment_links` form field preserves the links separately for a future Make mapping. The current Make scenario has not been changed and must be checked with a live controlled submission before this release is considered complete.
