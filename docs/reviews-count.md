# Google review count

The homepage shows how many Google reviews the business has and the average star rating. Both numbers come from one file, `src/data/reviews.json`, and are no longer typed into the page. Flow to Form's Make scenario "S&S Google review count to site" keeps that file in step with the Google Business Profile.

## What updates the number

1. The Make scenario reads the Business Profile reviews list (Business Profile API v4, `reviews.list`) and takes two fields: `totalReviewCount` and `averageRating`.
2. If either differs from `src/data/reviews.json` on `main`, it commits a new `reviews.json` to `main` of `structureandstyle/incandescent-manatee-e242f2`, the repository Netlify deploys the live site from, with the new values and today's date. If neither differs, it commits nothing.
3. The commit starts a Netlify production build, which runs `npm run build:production`. If that build passes, the new number is live. If it fails, Netlify keeps the previous deploy live and the site goes on showing the last good number.

Nothing else writes the file. Flow to Form owns the Make scenario. Kaspar does not need to do anything for the number to follow the profile.

## The file

```json
{
  "count": 20,
  "average": 5,
  "updated": "2026-10-27"
}
```

- `count`: whole number, the total number of Google reviews (`totalReviewCount`).
- `average`: a plain JSON number, the Google average star rating (`averageRating`). The site formats it to one decimal, so `5` shows as "5.0" and `4.9` as "4.9". Do not write it as a string.
- `updated`: `YYYY-MM-DD`, the date the values last changed.

The git history of the file is the record of what the site said and when.

## What the build refuses

`scripts/verify-build.mjs` checks the file on every production build and fails the build, naming the field, if:

- the file is missing or is not valid JSON
- `count` is not a whole number from 1 to 1000 (so `"20"` in quotes, `0` and `20.5` all fail)
- `average` is not a JSON number from 1 to 5
- `updated` does not look like `YYYY-MM-DD`
- the built homepage does not show the file's count and average, which would mean someone had gone back to typing them into the page

A bad `reviews.json` on `main` stops every production build, not only the one that carried it, so an unrelated journal or content merge does not go live either until the file is fixed (see below). Branch deploys and deploy previews run the plain build and skip this check, so a bad file is only stopped on production. The business schema must also never mark up its own reviews (`aggregateRating` or `review`); the same script fails any page that does. The number is page text only.

## Changing it by hand

Only needed if the scenario is switched off or wrong. Edit the three values in `src/data/reviews.json`, keeping the shape above, and commit to `main` of `structureandstyle/incandescent-manatee-e242f2`. To check first, run `npm run build:production` (use Node 22, as pinned in `netlify.toml`) and look for "Verify passed". The next scenario run overwrites a hand edit if Google's numbers differ from it, which is correct: the profile is the source.

## What is never automated

The individual review quotes on the homepage are not part of this. They are hand-picked in `REVIEWS.quotes` in `src/data/site-content.ts`, copied verbatim from the profile and held to the rules written above that export: genuine past customers only, unedited, no gating, no incentives, and the complete text must pass the site's own gates. A rising count never adds a quote, and no scenario should write to that list.
