/**
 * Single source of truth for business facts.
 *
 * NAP must match the Google Business Profile exactly and be used without
 * variation everywhere. Citations are checked character by character, so a
 * second version of the phone number or the name is a real cost.
 */

export const SITE_URL = "https://structureandstyle.co.uk";

export const BUSINESS = {
  /** Trading name. House rule is "Structure & Style", never "Structure&style". */
  name: "Structure & Style",
  legalName: "Structure and Style Ltd",
  companyNumber: "16822866",
  /** Exactly as it reads on the Business Profile. */
  profileName: "Structure & Style – Bespoke Carpentry & Interiors",
  /* London-led per Kaspar's Q3 answer and Denis's ruling, 30 Aug 2026. The
     named districts below stay: they are where the demand and the reviews are. */
  tagline: "Bespoke carpentry and joinery across London",
  phoneDisplay: "07309 872555",
  phoneHref: "tel:+447309872555",
  whatsapp: "https://wa.me/447309872555",
  email: "info@structureandstyle.co.uk",
  /** Service-area business: no public address, so no PostalAddress in schema. */
  areaServed: [
    "Hampstead",
    "Belsize Park",
    "Primrose Hill",
    "Kentish Town",
    "Camden",
    "Swiss Cottage",
    "Highgate",
    "West Hampstead",
    "Islington",
    "Maida Vale",
  ],
  openingHours: [
    { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "18:00" },
    { days: ["Saturday"], opens: "09:00", closes: "14:00" },
  ],
  /** Read live from the public profile on 1 September 2026. Down from the
      22 August baseline of 15: Arthur Kvasnei's review is no longer on the
      profile. See the ops repo baseline record, A6.1. */
  reviewCount: 14,
  ratingValue: "5.0",
} as const;

/** GA4 measurement ID, live in Kaspar's own Analytics account. */
export const GA4_ID = "G-FSGVTJXMMP";

/**
 * The agency credit in the footer.
 *
 * OFF, AND IT STAYS OFF UNTIL KASPAR AGREES TO IT. Built 5 September 2026 so
 * that agreeing is a one-word change rather than a job, not because it is
 * going live. This is his website: the executed agreement gives Flow to Form a
 * named case study, a testimonial once the results deserve one, and two
 * introductions where reasonably possible. A credit on his pages is not among
 * them, so it is a thing to ask for and not a thing to ship.
 *
 * THE WORDING IS THE PART THAT WAS THOUGHT ABOUT. The first suggestion was
 * "Flow to Form 2026" beside the copyright line, and in a single wrapping row
 * the © reads as governing whatever sits next to it: that would have put our
 * name where the site's ownership goes, on a site we do not own. This says
 * what was done instead, which is also the better advertisement, and
 * SiteFooter renders it after a gap rather than as another legal line.
 *
 * The link is nofollow. See the note at the render site for why that is a
 * convention rather than caution about this one link.
 */
export const AGENCY_CREDIT = {
  enabled: false,
  label: "Site and search by Flow to Form",
  href: "https://flowtoform.co.uk/",
} as const;

export type Service = {
  slug: string;
  /** Nav and card label. */
  title: string;
  /**
   * True for a page that answers a question rather than sells a service.
   *
   * The cost guide lives in SERVICES because it renders from the same template
   * and shares the same gate, but it is not something the client sells, and a
   * list headed "Services" that ends with "What fitted wardrobes cost" reads
   * wrong to the person whose services they are. Flagged in the data rather
   * than matched on its slug wherever a list needs to tell the two apart.
   */
  guide?: boolean;
  /**
   * What this service is called everywhere OTHER than its own page.
   *
   * It exists for one service. Protocol section 5 bans "media wall" as a
   * brand-facing term and then carves out one exception: it may appear on a
   * single search-facing page, because the phrase carries 90,500 UK searches a
   * month and throwing that away is its own kind of mistake. It may never
   * appear on the home page, in a hero, or in a service page title.
   *
   * That is a real conflict, not a contradiction: the phrase is worth having
   * where a searcher types it and worth avoiding where a buyer reads it. So
   * the page keeps the keyword in its title and heading, and `label` carries
   * an approved alternative everywhere else.
   *
   * Defaults to `title`, so this stays empty for every other service.
   */
  label?: string;
  /** <h1>. Carries the primary keyword without reading like it does. */
  heading: string;
  /** Primary keyword, for the record rather than for stuffing. */
  primary: string;
  /** Meta description. Aim 140 to 155 characters. */
  description: string;
  /**
   * The <title>, where the H1 runs past the roughly 60 characters a result
   * page shows. Optional: a page whose heading is short enough uses it.
   */
  metaTitle?: string;
  /**
   * The one price line the enquiry band shows on this page. Site-wide it
   * used to show "Fitted wardrobes from £2,300" on every service page, a
   * wardrobe price above the alcove form (2 Sep 2026).
   */
  bandPrice: string;
  /** One line used on the homepage grid. */
  summary: string;
  /**
   * The guide-price line for the page's cost section. Sourced from the
   * client's pricing document of 31 Aug 2026
   * (Structure_and_Style_Guide_Pricing_Wardrobes_Alcoves.pdf, ops repo).
   * Services it does not price carry the honest per-project line instead,
   * per tone protocol section 12: never "price on application" alone.
   */
  price: string;
  /**
   * Per-service answers, added 6 September 2026 from Kaspar's review of the
   * preview build.
   *
   * Until now every service page shared one answer to what moves the price,
   * one to the smallest job taken, one to survey-to-drawings and one to how
   * long the work runs, because the questionnaire had only ever asked those
   * questions once, about a wardrobe. The template said so in as many words:
   * WHAT THIS NEEDS IS PER-SERVICE DURATIONS FROM KASPAR. These are those, in
   * his own wording, for the services he gave them for.
   *
   * Every field is optional and every one falls back to the shared answer, so
   * a service he has not spoken about is left as it was rather than guessed
   * at.
   */
  /** Replaces the shared Q11 in the "What moves it" row. */
  priceMovers?: string;
  /**
   * A "What's included" row above it, where he has said what the guide price
   * buys. Fitted wardrobes only so far (6 September 2026): the starting
   * specification from his pricing document, in his own sentence.
   */
  included?: string;
  /**
   * The one-sentence materials summary that replaced the four-row materials
   * table on every service page, 6 September 2026, on his instruction: "i
   * dont think we need to go into detail again because we are explaining
   * everything of the materials section". He wrote the wardrobe sentence;
   * the template builds the same shape for the others from the title.
   */
  madeFrom?: string;
  /**
   * The sentence above the cost table. SERVICE_COPY carries this for wave-one
   * pages; a wave-two page has no SERVICE_COPY entry at all, deliberately, and
   * adding one would lift its noindex. This puts his line on the page without
   * touching that gate.
   */
  costLead?: string;
  /**
   * Per-section lead lines for the shared spec sections, keyed by section id
   * (made-from, fitting, after), for a wave-two page that has no SERVICE_COPY
   * entry: the same reason as costLead, since an entry there would lift the
   * noindex. SERVICE_COPY.leads wins where both exist; a missing key falls
   * back to the template's generic lead. Kitchens and media walls, 7 September
   * 2026, in his words.
   */
  leads?: Record<string, string>;
  /**
   * Drops the "Smallest job taken" row. Asked for on walk-in wardrobes and on
   * media walls on 6 September 2026 (a £2,000 minimum sitting under a £5,000
   * guide price answers a question nobody asked and argues with the figure
   * above it), then on 7 September for every service pricing page: "The
   * service-specific guide prices already communicate the relevant starting
   * price." So it is set everywhere and the row renders nowhere. Q12 is
   * unchanged, and the alcove FAQ still states the £2,000 minimum in his words.
   */
  noMinimum?: boolean;
  /**
   * Replaces the shared Q07 in the "Booked ahead" row. Fitted wardrobes only:
   * his walk-in version was the bare Q07 sentence, his wardrobe version adds
   * what the lead time depends on. Missed on the first pass and caught by the
   * verification run against the built page, 6 September 2026.
   */
  leadTime?: string;
  /** Replaces the shared "Survey to drawings" row. */
  surveyToDrawings?: string;
  /** Replaces Q30 or Q32 in the days-on-site row. */
  onSite?: string;
  wave: 1 | 2;
};

/**
 * The signed set: six service pages plus the cost guide, seven in total.
 * Build order and the two-wave sequence come from the SEO runbook, section 2.5.
 * Wave one ships before 1 September because wardrobe searches peak in September.
 */
export const SERVICES: Service[] = [
  {
    slug: "fitted-wardrobes",
    metaTitle: "Fitted wardrobes London, made to measure",
    noMinimum: true,
    bandPrice: "Fitted wardrobes from £2,300",
    price:
      "From £2,300 for a 2-door run up to 1.2m in melamine. Width and finish move it: from £4,000 at 4 doors, and painted, sprayed and oak veneer finishes step up from there. Internal drawers and integrated lighting add to any of them.",
    /* The five lines below are Kaspar's, 6 September 2026, from his review of
       the preview: the hero sentence, what the guide price includes, what
       moves it, and both timing rows. They replaced the shared answers that
       had stood in for them since the pricing document arrived. */
    included:
      "Made-to-measure fitted wardrobe with a straightforward internal layout, standard shelving and hanging space, soft-close hinges, delivery and professional installation.",
    priceMovers:
      "Drawers, integrated lighting, mirrors, shoe storage, pull-out accessories, specialist hardware, decorative details and more complex designs are priced according to the specification.",
    leadTime:
      "Typically 4 to 8 weeks, depending on the project, specification and current schedule.",
    surveyToDrawings:
      "After the survey, the quotation and any required drawings are prepared for review. More detailed or complex projects may require additional design time.",
    onSite:
      "Typically 2 to 3 days for a straightforward fitted wardrobe. Larger or more complex projects, and wardrobes requiring hand-painting on site, may take longer.",
    madeFrom:
      "Fitted wardrobes are available in painted MR MDF, melamine and decorative boards, or natural wood veneer, with a wide choice of colours and finishes.",
    title: "Fitted wardrobes",
    heading: "Fitted wardrobes in London, made to measure",
    primary: "fitted wardrobes london",
    description:
      "Built-in and fitted wardrobes made to measure for your room, designed around what you store and fitted wall to wall, across Hampstead, Camden and London.",
    summary:
      "Made-to-measure wardrobes designed around your room and how you use it, with hanging space, shelving, drawers and internal storage planned around what you need.",
    wave: 1,
  },
  {
    slug: "walk-in-wardrobes",
    metaTitle: "Bespoke walk-in wardrobes, London",
    /* £5,000, Kaspar, 6 September 2026, replacing the generic "projects
       generally from £2,000" that stood on every page the 31 Aug pricing
       document did not price. A walk-in is a room rather than a run, and the
       old line was pricing it as though it were neither. */
    bandPrice: "Walk-in wardrobes from £5,000",
    price:
      "Walk-in wardrobes typically start from around £5,000. Larger dressing rooms and more detailed specifications can increase considerably from there.",
    priceMovers:
      "The size of the room, number of fitted runs, internal layout, drawers and specialist storage, materials and finishes, integrated lighting and the complexity of the space.",
    noMinimum: true,
    surveyToDrawings:
      "Where design drawings are required, these are prepared for review before the project moves into production.",
    onSite:
      "Installation typically takes around 3 to 5 days, with larger or more complex dressing rooms taking longer.",
    title: "Walk-in wardrobes",
    heading: "Bespoke walk-in wardrobes and dressing rooms",
    primary: "bespoke walk in wardrobe",
    description:
      "Bespoke walk-in wardrobes and dressing room fit-outs for London homes, including loft rooms, box rooms and eaves where standard storage will not fit.",
    summary:
      "Walk-in wardrobes and dressing rooms designed around the space and how you use it, with hanging, shelving, drawers, shoe storage and lighting planned together from the start.",
    wave: 1,
  },
  {
    slug: "alcove-units",
    metaTitle: "Alcove units and shelving in London",
    noMinimum: true,
    bandPrice: "Alcove units from £3,300 a pair",
    price:
      "From £3,300 for a pair of alcove units in melamine, from £3,600 hand-painted, and from £6,000 in oak veneer. Based on base cupboards with shelving over, up to about 1m per alcove. Shelving detail, drawers and lighting move it further.",
    title: "Alcove units and shelving",
    heading: "Alcove units, cupboards and shelving in London",
    primary: "alcove units london",
    description:
      "Alcove cupboards and shelving built into chimney breast recesses across London, measured and scribed individually so doors sit flush and lines run true.",
    summary:
      "No two alcoves in a period house are the same width. Each unit is built to its own measurements and cut to follow the wall.",
    wave: 1,
  },
  {
    slug: "fitted-wardrobe-cost",
    guide: true,
    noMinimum: true,
    metaTitle: "Built-in wardrobe cost in London",
    bandPrice: "Fitted wardrobes from £2,300",
    price:
      "From £2,300 for a 2-door wardrobe in melamine to £6,300 and up for 4 doors in oak veneer. The tables below give every step between.",
    title: "What fitted wardrobes cost",
    heading: "How much do fitted wardrobes cost in London?",
    primary: "built in wardrobe cost",
    description:
      "What fitted wardrobes and alcove units actually cost in London, guide prices by size and finish, what moves the figure, and how to read a quotation.",
    summary:
      "Honest price ranges, what moves them, and the questions worth asking before you accept any quote.",
    wave: 1,
  },
  {
    slug: "media-walls",
    metaTitle: "Media walls and TV units, London",
    bandPrice: "Built-in TV units from £3,500",
    costLead:
      "Media walls vary considerably depending on their size, storage, finish and level of integration. The guide price below is for a complete bespoke media wall or built-in TV unit.",
    price:
      "Bespoke media walls and built-in TV units start from £3,500, with the final price depending on the size, design, finish and specification.",
    priceMovers:
      "Overall size, cabinetry and storage, open shelving, integrated lighting, cable management, ventilation, specialist finishes and additional detailing.",
    noMinimum: true,
    /* His line, 7 September 2026, typed under a screenshot of the section.
       Two versions arrived three minutes apart on a page the crop did not
       name. The generic lead rendered only here and on kitchens, kitchens got
       its own sentence that evening, and the second version names doors,
       drawers and integrated components, so it is this page's, and the later
       one stands. The first read: "Fitted furniture can require minor
       adjustments as it settles into the room. What matters is knowing we'll
       come back and put it right." */
    leads: {
      "after":
        "Doors, drawers and integrated components may need occasional adjustment over time. Our aftercare covers the details that keep everything working as it should.",
    },
    title: "Media walls and TV units",
    label: "Built-in TV units",
    heading: "Media walls and built-in TV units",
    primary: "media wall london",
    description:
      "Media walls and built-in TV units for London homes, with cable routing, ventilation and electrics planned from the start, so the finished wall sits flush.",
    summary:
      "Bespoke media walls and built-in TV units designed around the room, with storage, shelving, integrated lighting, cable management and ventilation planned into the design from the start.",
    wave: 2,
  },
  {
    slug: "bespoke-kitchens",
    metaTitle: "Bespoke kitchens in London",
    bandPrice: "Bespoke kitchens from £10,000",
    price:
      "Bespoke kitchens typically start from £10,000, with each project individually priced following a measured survey. Larger kitchens, islands and more complex designs are quoted accordingly.",
    priceMovers:
      "Kitchen size and layout, cabinetry and internal storage, worktops, appliances, materials and finishes, integrated lighting and any associated electrical, plumbing or finishing works.",
    /* The "Smallest job taken" row came off here on 7 September 2026, when he
       asked for it off every service pricing page; on 6 September he had named
       only walk-in and media walls, and the row stayed here, flagged for
       Denis. The three leads below are his, from the same evening, each typed
       under a screenshot of the kitchens page. */
    noMinimum: true,
    leads: {
      "made-from":
        "Materials and finishes are selected around the design, how the kitchen will be used and the look you want to achieve.",
      "fitting":
        "Kitchen cabinetry is fitted and adjusted on site so that units, worktops, panels and finishes come together cleanly within the room.",
      "after":
        "A fitted kitchen is used every day, so reliable aftercare matters. If anything needs adjusting after installation, we will come back and put it right.",
    },
    title: "Bespoke kitchens",
    heading: "Bespoke kitchens, made to measure",
    primary: "bespoke kitchens london",
    description:
      "Bespoke kitchen design, build and installation for London homes, including the awkward runs around chimney breasts, boilers, boxing and sloping ceilings.",
    summary:
      "Bespoke kitchens designed around the room and how it is used, with cabinetry, tall units, islands and storage made to measure as part of one considered design.",
    wave: 2,
  },
];

/**
 * Deferred, 31 Aug 2026, Denis's call: the page ships when its imagery exists.
 * The photo library holds ZERO usable under-stair photographs and no finished
 * home office, and a service page with empty plates sells nothing. This is a
 * deferral of a signed wave-two page, not a drop: it is recorded in the ops
 * repo's engagement status, Kaspar gets told in the next update, and the ask
 * that brings it back is him photographing an under-stair or home office job.
 * To restore: move the entry back into SERVICES and re-add its gate in
 * page-gates.ts.
 */
export const DEFERRED_SERVICES: Service[] = [
  {
    slug: "home-office-understairs-storage",
    bandPrice: "Projects generally from £2,000",
    price:
      "Priced per project. A measured survey, usually about an hour on site, gives a firm, itemised figure, and projects generally start at £2,000 of value.",
    title: "Home office and under-stair storage",
    heading: "Home office and under-stair storage",
    primary: "under stairs storage london",
    description:
      "Built-in desks, study storage and under-stair storage that uses the whole void, fitted around windows, radiators and the stair pitch.",
    summary:
      "Desks and storage fitted around windows, radiators and sloped ceilings, and under-stair storage that uses the whole void.",
    wave: 2,
  },
];

export const servicePath = (s: Service) => `/${s.slug}/`;

/** What to call a service anywhere but its own page. See `label` above. */
export const serviceLabel = (s: Service) => s.label ?? s.title;
