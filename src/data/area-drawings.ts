/**
 * Line drawings for the area pages, shown beside a section's words by
 * AreaSide.astro (a founder's comment on the Primrose Hill draft, 15 Nov 2026:
 * "add examples of what the text describes on the right side").
 *
 * The enquiry-card format (components/enquiry-cards/art/README.md) at 320 x 240:
 * inner markup only, every element one class from k, t, h, g, gt, f, pf, gw,
 * styled from the palette in styles/site-layout.css (prefixed "ad-"). No text,
 * square corners, one green idea per drawing. Simplified and our own, never
 * traced from a photograph, and none shows a real address or a job.
 *
 * `label` is the drawing's description for screen readers (it describes only
 * what is drawn); `caption` sits under it. Drawn and then checked by a second
 * reviewer, each rendered at 800px and 330px, 15 Nov 2026.
 */
export const AREA_DRAWINGS: Record<string, { markup: string; label: string; caption: string }> = {
  "stucco-villa": {
    caption: "A stucco villa, front elevation",
    label:
      "Front elevation of a tall stucco villa: a basement below the ground line behind railings, steps up to a portico and front door with a canted bay window on each side, tall first-floor windows above a balcony rail, smaller windows above those, and a cornice and parapet. A green dimension line beside it spans the raised ground and first floors.",
    markup:
      "<path class=\"h\" d=\"M12 200H308M74 222H206\"/><path class=\"k\" d=\"M74 44V222M206 44V222\"/><rect class=\"k\" x=\"70\" y=\"40\" width=\"140\" height=\"4\"/><path class=\"k\" d=\"M74 40V33H206V40\"/><path class=\"t\" d=\"M74 62H206M74 92H206M74 178H206\"/><path class=\"k\" d=\"M70 138H210\"/><path class=\"k\" d=\"M94 49h8v8h-8zM136 49h8v8h-8zM178 49h8v8h-8z\"/><path class=\"k\" d=\"M93 66h10v22H93zM135 66h10v22h-10zM177 66h10v22h-10z\"/><path class=\"k\" d=\"M91 98h14v36H91zM133 98h14v36h-14zM175 98h14v36h-14z\"/><path class=\"t\" d=\"M91 116H105M133 116H147M175 116H189M86 124H194M86 124V138M194 124V138\"/><path class=\"k\" d=\"M80 143H116M82 143V178M114 143V178M164 143H200M166 143V178M198 143V178\"/><path class=\"t\" d=\"M89 143V178M107 143V178M173 143V178M191 143V178M92 150h12v22H92zM176 150h12v22h-12z\"/><rect class=\"pf\" x=\"124\" y=\"142\" width=\"32\" height=\"4\"/><rect class=\"k\" x=\"124\" y=\"142\" width=\"32\" height=\"4\"/><path class=\"k\" d=\"M128 146V178M152 146V178\"/><rect class=\"k\" x=\"134\" y=\"152\" width=\"12\" height=\"26\"/><path class=\"t\" d=\"M140 152V178\"/><circle class=\"f\" cx=\"138\" cy=\"166\" r=\"0.8\"/><circle class=\"f\" cx=\"142\" cy=\"166\" r=\"0.8\"/><path class=\"k\" d=\"M120 200V194.5H122V189H124V183.5H126V178H154V183.5H156V189H158V194.5H160V200\"/><path class=\"t\" d=\"M76 190H118M162 190H204M80 190V200M88 190V200M96 190V200M104 190V200M112 190V200M168 190V200M176 190V200M184 190V200M192 190V200M200 190V200\"/><path class=\"t\" d=\"M92 206h12v10H92zM176 206h12v10h-12z\"/><path class=\"h\" d=\"M214 178H232M214 92H232\"/><path class=\"g\" d=\"M240 178V92M234 178H246M234 92H246\"/>",
  },
  "alcove-pair": {
    caption: "A pair of alcoves, tops level",
    label:
      "Front view of a living-room wall with a chimney breast in the middle, a fireplace opening and a mantel shelf, and an alcove either side, each with a two-door cupboard below and three floating shelves above. A green line runs across both cupboard tops and the breast at the same height.",
    markup:
      "<path class=\"h\" d=\"M8 14H312M8 222H312\"/><path class=\"t\" d=\"M8 20H312M8 216H31M289 216H312\"/><path class=\"k\" d=\"M127 20V222M207 20V222\"/><rect class=\"gw\" x=\"31\" y=\"141\" width=\"258\" height=\"9\"/><path class=\"k\" d=\"M31 150V212H127V150M207 150V212H289V150\"/><path class=\"t\" d=\"M79 150V212M248 150V212M34 212V222M124 212V222M210 212V222M286 212V222\"/><circle class=\"f\" cx=\"76.5\" cy=\"181\" r=\"1.5\"/><circle class=\"f\" cx=\"81.5\" cy=\"181\" r=\"1.5\"/><circle class=\"f\" cx=\"245.5\" cy=\"181\" r=\"1.5\"/><circle class=\"f\" cx=\"250.5\" cy=\"181\" r=\"1.5\"/><path class=\"k\" d=\"M36 58h86v3H36zM36 86h86v3H36zM36 114h86v3H36zM212 58h72v3H212zM212 86h72v3H212zM212 114h72v3H212z\"/><rect class=\"k\" x=\"121\" y=\"128\" width=\"92\" height=\"5\"/><path class=\"t\" d=\"M146 222V160H188V222\"/><path class=\"k\" d=\"M153 222V170H181V222\"/><path class=\"g\" d=\"M31 150H289\"/>",
  },
  "mansard-wardrobe": {
    caption: "A wardrobe that follows the slope",
    label:
      "Front view of a fitted wardrobe in a top-floor room: two full-height doors under the flat ceiling, two doors cut to the sloping ceiling, and drawers with a cupboard door above them under the lowest part, with the sloping top edge in green.",
    markup:
      "<path class=\"h\" d=\"M8 206H312\"/><path class=\"h\" d=\"M14 206V35H172L308 143.8V206\"/><path class=\"k\" d=\"M24 198V44H172\"/><path class=\"g\" d=\"M172 44L300 146.4\"/><path class=\"k\" d=\"M300 146.4V198H24\"/><path class=\"t\" d=\"M28 198V206M296 198V206\"/><path class=\"t\" d=\"M26 46H97V196H26ZM99 46H171V196H99Z\"/><path class=\"t\" d=\"M173 47.8L221 86.2V196H173ZM223 87.8L258 115.8V196H223Z\"/><path class=\"t\" d=\"M260 117.4L298 147.8V163H260ZM260 165H298V179H260ZM260 181H298V196H260Z\"/><circle class=\"f\" cx=\"91\" cy=\"125\" r=\"1.4\"/><circle class=\"f\" cx=\"105\" cy=\"125\" r=\"1.4\"/><circle class=\"f\" cx=\"215\" cy=\"135\" r=\"1.4\"/><circle class=\"f\" cx=\"229\" cy=\"150\" r=\"1.4\"/><circle class=\"f\" cx=\"279\" cy=\"188.5\" r=\"1.4\"/><circle class=\"f\" cx=\"279\" cy=\"172\" r=\"1.4\"/><circle class=\"f\" cx=\"291\" cy=\"155\" r=\"1.4\"/>",
  },
  "steps-route": {
    caption: "The way in, up the front steps",
    label:
      "A house front with a flight of seven steps rising from the pavement to a raised door with a portico and fanlight. A long green panel rests along the steps, with short green ticks leading in from the kerb and across the landing to the door. To the right, railings edge a basement area with its own short stair down to a basement door.",
    markup:
      "<path class=\"h\" d=\"M8 184H22V176H300\"/><path class=\"k\" d=\"M64 176V167H78V158H92V149H106V140H120V131H134V122H148V113H222V206H300V24H170V113\"/><path class=\"k\" d=\"M222 183.5H231V191H240V198.5H249V206\"/><path class=\"t\" d=\"M170 29H300M222 113H300\"/><path class=\"k\" d=\"M178 113V56M214 113V56M184 113V70H208V113\"/><path class=\"k\" d=\"M174 56H218\"/><path class=\"t\" d=\"M174 51H218M174 51L196 40L218 51M184 70A12 10 0 0 1 208 70M196 70V60M188 70L190.5 62M204 70L201.5 62M196 74V113\"/><circle class=\"f\" cx=\"201\" cy=\"96\" r=\"1.3\"/><path class=\"t\" d=\"M232 70H254V102H232ZM232 36H254V56H232ZM268 70H290V102H268ZM268 36H290V56H268ZM230 102H256M266 102H292M243 70V102M279 70V102\"/><path class=\"t\" d=\"M226 160H296M226 160V176M236 160V176M246 160V176M256 160V176M266 160V176M276 160V176M286 160V176M296 160V176\"/><path class=\"t\" d=\"M264 206V184H286V206M275 184V206\"/><circle class=\"f\" cx=\"272\" cy=\"196\" r=\"1\"/><polygon class=\"gw\" points=\"78 158 144 115.6 140.8 110.6 74.8 153\"/><polygon class=\"g\" points=\"78 158 144 115.6 140.8 110.6 74.8 153\"/><path class=\"gt\" d=\"M30 173h4M40 173h4M50 173h4M67 164h4M152 109h4M162 109h4\"/>",
  },
};
