# The footer

Every page ends with the same footer, `src/components/Footer.astro` (what it holds) over `src/components/ds/SiteFooter.astro` (how it is laid out). It was reorganised on 29 October 2026. This file says what it holds, where each part comes from, and what the arrangement was taken from.

## What it holds

| Part | Contents | Where it comes from |
|---|---|---|
| Brand row | Wordmark, the line "Bespoke joinery and fitted furniture · London", the ampersand | Fixed text |
| Contact | Enquire, Call 07309 872555, WhatsApp, info@structureandstyle.co.uk | `BUSINESS` in `src/data/site.ts` |
| Hours | Mon to Fri 08:00 to 18:00, Sat 09:00 to 14:00 | `hoursLines()` in `src/data/site.ts`, the same lines as the contact page, which mirror the Business Profile |
| Services | All five services | `SERVICES`, the guide left out, each once its page gate clears |
| The company | Process, Materials, Work, About, Journal | `NAV`, plus Journal once an article is live: the header's own list |
| Guides | The cost guide, then up to three journal articles, newest first | `SERVICES` (the guide) and the journal collection, by each article's breadcrumb label |
| Small print | © year and company name, company number, the Flow to Form credit, Privacy notice, Cookies | `BUSINESS`, `AGENCY_CREDIT`; the year is derived |

No list is typed out. A page appears in the footer the day its gate clears or its article is cleared, and a draft never does.

## Rulings it keeps

- All five services are listed, including the two noindexed pages (Denis, 4 Sep 2026).
- Phone, WhatsApp and email are on every page (Denis, 1 Sep 2026).
- The footer's Enquire goes to /contact/ rather than opening the enquiry pop-up (Denis, 7 Sep 2026).
- Privacy notice and Cookies are on every page, so the cookie policy can be found after the banner is dismissed.
- The credit sits in the small-print bar beside the copyright line, never hidden at any width (client's yes, 16 Oct 2026).
- No street address and no registered office (Denis, 8 Sep 2026).
- Every link is at least 44px tall. The credit's own link is 24px, set by its generated component, inside a 44px row.

Enquire leads the contact block and the email comes last, at the size of the links around it, for the reason the enquiry band dropped the large email on 1 Sep 2026: the form attributes every enquiry it sends, the email does not.

## How it was organised

Twenty-five footers from the trade were captured in a real browser at 1440px and 375px (kitchen, joinery and fitted furniture makers, in the UK and abroad) and rated for how well they are organised. The arrangement takes only what the best-rated ones share:

| Technique | Taken from |
|---|---|
| The ways in first: left on a laptop, top on a phone, hours with them | Uncommon Projects, Sebastian Cox, Herringbone Kitchens |
| Small, dim capital headings over larger sentence-case links | Charles Yorke, Neptune, Harvey Jones |
| Two columns of links on a phone, no accordions | Neptune, Harvey Jones, Reform, deVOL |
| One rule only, above the small print; space does the rest | Charles Yorke, Herringbone Kitchens, Uncommon Projects, Reform, deVOL, Neptune |
| All the small print in one bar, the copyright one end and the policies the other | Charles Yorke, Herringbone Kitchens, deVOL |
| Guide pages listed in the footer | Sebastian Cox, Neptune, Charles Yorke, Uncommon Projects |

Left out on the evidence: accordions (they hide links), newsletter and social blocks (none exist), badges and a review count (the brief was to organise, not add; the count is on the home page), a filled button (the enquiry band directly above already asks).

## Measured, before and after

| Width | Before | After |
|---|---|---|
| 375 | 1,524px | 1,161px |
| 443 | 1,391px | 1,158px |
| 560 | 1,234px | 1,122px |
| 1024 | 893px | 657px |
| 1440 | 906px | 619px |

Before, every item was the same 11px uppercase mono, the contact links were 35px tall, the legal lines broke mid-phrase on phones, and the journal was missing although the header linked it. No width from 320px to 1440px scrolls sideways. Below about 330px the ampersand drops under the wordmark; everywhere else it sits beside it.
