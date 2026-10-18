#!/usr/bin/env node
/**
 * Build with the journal's draft articles rendered, then run the verify step.
 *
 *     npm run build:drafts
 *
 * This is how a draft article is checked before it is cleared: the page is
 * built exactly as a deploy preview builds it (noindexed, under the draft bar),
 * and scripts/verify-build.mjs runs its schema, factual and style checks over
 * it. Open questions on the draft are listed rather than failed, because a
 * noindexed page may carry them; clearing the article (`blocked: false`) then
 * makes any left over fail the production build.
 */
import { spawnSync } from "node:child_process";

const env = { ...process.env, JOURNAL_DRAFTS: "1" };
for (const cmd of ["npx astro build", "node scripts/verify-build.mjs"]) {
  const r = spawnSync(cmd, { stdio: "inherit", shell: true, env });
  if (r.status !== 0) process.exit(r.status ?? 1);
}
