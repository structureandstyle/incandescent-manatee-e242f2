/**
 * Every photo's alt text and its visible description, in the same words
 * (a founder, 19 Nov 2026: "add alt text, description of the services in
 * which area, and make it a rule every photo that we add and on any pages to
 * have the same alt text plus description"; asked to choose, they picked the
 * area as context only and the same words in both).
 *
 * The shape: the service first, then what the picture shows (the plate's own
 * alt, which already describes only what is visible), then the page's area as
 * context: "An example for Camden homes." Pages that are not about an area say
 * London, as the site's copy leads with London. The area is never stated as
 * where the work was done: the register's photographs are not recorded jobs in
 * these districts and the AI renders are no one's job (S&S protocol v1.4
 * section 4; F2F working rule 7).
 *
 * The service comes from this map, keyed by the plate's caption (`type`), so
 * every area page and topic page gets it without touching each page's data.
 * A plate whose caption is not here fails the build: add its service here when
 * adding a photo, which is how the rule holds for every photo added later.
 */

export const PLATE_SERVICE: Record<string, string> = {
  // Captions that are already the service
  "Alcove units": "Alcove units",
  "Fitted wardrobes": "Fitted wardrobes",
  "Walk-in wardrobes": "Walk-in wardrobes",
  "Bespoke kitchens": "Bespoke kitchens",
  "Built-in TV units": "Built-in TV units",
  "Doors and panelling": "Doors and panelling",
  "Bookcases": "Built-in bookcases",
  // Area pages
  "Off-white wardrobes below a cornice": "Fitted wardrobes",
  "Grey Shaker-style wardrobes": "Fitted wardrobes",
  "Blue-grey wardrobes with an oak-effect interior": "Fitted wardrobes",
  "Glazed alcove cupboards": "Alcove units",
  "Walk-in wardrobe shelving": "Walk-in wardrobes",
  "Painted wardrobes by a bay window": "Fitted wardrobes",
  "Handleless kitchen units": "Bespoke kitchens",
  "White handleless wardrobes": "Fitted wardrobes",
  "Fitted wardrobe drawers": "Fitted wardrobes",
  "Wardrobe drawer interior": "Fitted wardrobes",
  "Grey sliding-door wardrobe": "Fitted wardrobes",
  "Shaker fitted wardrobe": "Fitted wardrobes",
  "Bathroom vanity unit": "Bespoke furniture",
  "Arched alcove shelving": "Alcove units",
  "Walk-in wardrobe": "Walk-in wardrobes",
  "Walk-in wardrobe drawers and rails": "Walk-in wardrobes",
  "Shaker alcove wardrobes": "Fitted wardrobes",
  "Built-in bookcase": "Built-in bookcases",
  "Built-in shelving": "Built-in bookcases",
  "Panelled fitted wardrobes": "Fitted wardrobes",
  // Topic pages
  "Victorian balustrade": "Bespoke staircases",
  "Oak treads and new balustrade": "Bespoke staircases",
  "Under-stair storage": "Under-stair storage",
  "Loft wardrobes with oak niches": "Loft wardrobes",
  "Eaves cupboards and drawers": "Loft wardrobes",
  "Full-height bookcases": "Built-in bookcases",
  "Floating shelves": "Built-in shelving",
};

/** Words that keep their capital when they open the picture's own description. */
const KEEP_CAPITAL = new Set(["Shaker", "Victorian", "Georgian", "Edwardian", "LED", "AI"]);

function lowerFirst(text: string): string {
  const first = text.split(/\s/, 1)[0].replace(/[^A-Za-z-]/g, "");
  if (KEEP_CAPITAL.has(first) || !/^(?:A\b|[A-Z][a-z])/.test(text)) return text;
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/**
 * The alt text and visible description for one photo: service, what it shows,
 * the page's area as context. `place` is the area's name, or "London".
 */
export function plateText(type: string, alt: string, place: string, where = "a page"): string {
  const service = PLATE_SERVICE[type];
  if (!service) {
    throw new Error(`${where}: the photo captioned "${type}" has no service in src/data/plate-services.ts (every photo needs one: a founder, 19 Nov 2026).`);
  }
  return photoText(service, alt, place);
}

/** The same shape for a photo outside the plates (a render in a page's body), given its service. */
export function photoText(service: string, alt: string, place: string): string {
  const shows = alt.trim().replace(/[.\s]+$/, "");
  return `${service}: ${lowerFirst(shows)}. An example for ${place} homes.`;
}
