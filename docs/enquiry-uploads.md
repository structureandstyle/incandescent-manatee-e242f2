# SS enquiry uploads

The public form uploads up to 10 files directly to the private Cloudflare R2 bucket `structure-style-enquiry-uploads`. Each file may be up to 25 MB; the batch may be up to 100 MB. Netlify receives the enquiry text and private download links. The links are added to the job description so the current Make CRM notes mapping can carry them without changing the scenario.

## Production setup

1. In Cloudflare, create a Turnstile widget for `structureandstyle.co.uk`. Use the managed mode and note its site key and secret key. Add a deploy preview hostname only while testing that preview.
2. Create an R2 token restricted to object read and write for `structure-style-enquiry-uploads`. Keep the bucket private. Do not enable a public development URL or public custom domain.
3. Set this R2 CORS policy, adding the exact Netlify preview origin temporarily during review:

   ```json
   [{
     "AllowedOrigins": ["https://structureandstyle.co.uk"],
     "AllowedMethods": ["PUT"],
     "AllowedHeaders": ["content-type"],
     "MaxAgeSeconds": 3600
   }]
   ```

4. In the **SS site** on Netlify, set `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `SS_UPLOAD_LINK_SECRET`, and `SS_TURNSTILE_SECRET_KEY` as site environment variables available to Functions. `SS_UPLOAD_LINK_SECRET` should be a random 32-byte value and should remain stable because changing it invalidates existing download links. Store these values only in Netlify, never in Git or a message.
5. Set `PUBLIC_SS_TURNSTILE_SITE_KEY` for Builds last, then redeploy. Until this public key is set, the site keeps the original one-file Netlify form.
6. Submit a controlled enquiry with two harmless sample files. Confirm both files in the private R2 bucket, both links in the Netlify submission and CRM notes, and a successful download from each link. Remove the controlled records and R2 objects after the check.

## Operation

- Upload tickets expire after 30 minutes. A download link is stable, but each click redirects to a one-minute R2 URL. Anyone holding the stable link can access its file, so keep it inside the enquiry record.
- The file checker permits JPG, PNG, WebP, HEIC, HEIF, PDF and Word documents. It rejects other extensions and limits file sizes in both the browser and ticket function.
- Netlify form submission happens only after all selected files upload. If the form post fails, the visitor can retry without uploading those files again in the current page session.
- Deleting an enquiry under the privacy notice also requires deleting its R2 objects. An abandoned upload can leave an unlinked object, so review the bucket for orphaned files as part of routine enquiry cleanup.
- The `attachment_links` form field preserves the links separately for a future Make mapping. The current Make scenario has not been changed and must be checked with a live controlled submission before this release is considered complete.
