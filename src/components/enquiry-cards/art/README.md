# Enquiry card drawings

The small line drawings on the enquiry form's choice cards (14 Nov 2026 preview,
options A and B). One drawing per card: the services, the areas, the ways
people hear about us, and option B's rough-width picker.

They render once per page as an SVG sprite (`ArtSprite.astro`) and every card
points at its drawing with `<use>`, so a form that appears twice on a page (the
page form and the Get a quote pop-up) does not carry the drawings twice.

## The format

Each file exports a `Record<string, string>`: drawing id to the inner markup of
one `<symbol viewBox="0 0 120 80">`. No `<svg>` wrapper, no `style`, no
`fill`/`stroke` attributes, no text, no `<image>`, no gradients, no filters.
Every element carries exactly one of the classes below, which
`ArtSprite.astro` styles from the site palette. Elements allowed: `path`,
`line`, `rect`, `circle`, `ellipse`, `polyline`, `polygon`. Keep each drawing
under about 1,200 characters.

Keep the drawing inside x 6 to 114, y 6 to 74. Square corners (no `rx`):
nothing in this brand is rounded. Numbers to one decimal place at most.

| Class | What it is | Drawn as |
|---|---|---|
| `k` | main line | char, 1.6 wide, round caps and joins |
| `t` | thin detail line | char at 55%, 1 wide |
| `h` | hairline: floor, ceiling, ground, guides | 24% char, 1 wide |
| `g` | green accent line | door green, 1.8 wide |
| `gt` | thin green line | door green, 1 wide |
| `f` | small solid fill (knobs, dots) | char fill, no stroke |
| `pf` | paper fill, to hide what is behind | paper fill, no stroke |
| `gw` | green wash fill (parks, soft areas) | green at 14%, no stroke |
| `gd` | deep green fill (ponds, lakes) | green at 34%, no stroke |
| `w` | water line (canal, river) | door green, 2.6 wide, round |
| `r` | main road | char, 2.4 wide, round |
| `s` | minor street | char at 45%, 1 wide |
| `rl` | railway | char at 70%, 1.2 wide, dashed 4 / 2.5 |
| `m` | the area marker (one per map) | solid door green, no stroke |

## The style

- Services and the width picker: a flat front elevation, like the site's
  wardrobe drawing. A floor hairline (`h`), the piece in `k`, inside detail in
  `t`, one green accent (`g`) on the thing that matters (a rail, a shelf line,
  a dimension).
- Areas: a bird's-eye view, as on a map. Two or three main roads (`r`), a few
  minor streets (`s`), the park (`gw`), water (`w` for the canal, `gd` for
  ponds), a railway where it defines the place (`rl`), and one small marker
  square (`m`, 5 by 5) at the area's centre. Simplified and our own: never
  traced from map tiles. Each map must still be recognisable to someone who
  lives there.
- Ways people hear about us: generic objects. Never a company logo: no
  Google "G", no Maps pin in Google colours, no OpenAI knot.

Ids are kebab-case. The card data in `../choices.ts` names which id each card
uses.
