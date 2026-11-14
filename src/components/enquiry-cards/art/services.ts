/**
 * Service cards and option B's rough-width picker: front elevations.
 * Format and classes: ./README.md.
 */
export const SERVICE_ART: Record<string, string> = {
  /* Reference drawing. Three bays to the ceiling, the middle one open on its
     rail (the green line), two drawers under the hanging. */
  "fitted-wardrobes":
    '<path class="h" d="M6 9H114M6 71H114"/>' +
    '<rect class="k" x="24" y="11" width="72" height="60"/>' +
    '<path class="k" d="M48 11V71M72 11V71M44 37V46M76 37V46"/>' +
    '<path class="t" d="M24 16H96M24 66H96M48 54H72M48 60H72"/>' +
    '<path class="g" d="M51 22H69"/>' +
    '<path class="t" d="M53 24h4v22h-4zM58.5 24h4v26h-4zM64 24h4v18h-4z"/>',
  /* Walk-in wardrobe: back wall in k, side walls in shallow perspective (t), green rail with garments, shelves, low drawers. */
  "walk-in-wardrobes":
    '<path class="h" d="M6 9H114M6 71H114"/>' +
    '<path class="t" d="M6 9L34 20M114 9L86 20M6 71L34 62M114 71L86 62"/>' +
    '<rect class="k" x="34" y="20" width="52" height="42"/>' +
    '<path class="g" d="M38 28H66"/>' +
    '<path class="t" d="M41 30h4v14h-4zM47 30h4v16h-4zM53 30h4v12h-4zM59 30h4v15h-4z"/>' +
    '<path class="t" d="M38 50h28v12h-28zM38 56H66M70 20V62M70 32H86M70 42H86M70 52H86"/>' +
    '<path class="t" d="M50 53H54M50 59H54"/>',
  /* Chimney breast with a recess either side: two-door cupboard under a worktop line, three open shelves above (middle one green). */
  "alcove-units":
    '<path class="h" d="M6 9H114M6 71H114"/>' +
    '<rect class="k" x="46" y="9" width="28" height="62"/>' +
    '<path class="t" d="M54 71V48H66V71M50 44H70"/>' +
    '<path class="k" d="M12 48H44V71M28 48V71M76 71V48H108M92 48V71"/>' +
    '<path class="t" d="M12 20H44M12 40H44M76 20H108M76 40H108"/>' +
    '<path class="g" d="M12 30H44M76 30H108"/>' +
    '<circle class="f" cx="26" cy="58" r="1"/><circle class="f" cx="30" cy="58" r="1"/><circle class="f" cx="90" cy="58" r="1"/><circle class="f" cx="94" cy="58" r="1"/>',
  /* Built-in TV wall: flat TV on a panelled surround, three low cupboards below a green console shelf, open shelves either side. */
  "tv-units":
    '<path class="h" d="M6 71H114"/>' +
    '<rect class="k" x="10" y="11" width="100" height="60"/>' +
    '<path class="k" d="M36 11V71M84 11V71"/>' +
    '<rect class="t" x="40" y="14" width="40" height="34"/>' +
    '<rect class="k" x="46" y="19" width="28" height="18"/>' +
    '<path class="g" d="M36 50H84"/>' +
    '<path class="t" d="M52 50V71M68 50V71M10 24H36M10 38H36M10 52H36M84 24H110M84 38H110M84 52H110M14 17h6v7h-6zM96 31h8v7h-8z"/>' +
    '<circle class="f" cx="49" cy="60" r="1"/><circle class="f" cx="55" cy="60" r="1"/><circle class="f" cx="65" cy="60" r="1"/><circle class="f" cx="71" cy="60" r="1"/>',
  /* Kitchen run: base units with green worktop, sink tap and two hob burners, wall cupboards above, tall oven housing at the right end. */
  "kitchens":
    '<path class="h" d="M6 71H114"/>' +
    '<rect class="k" x="10" y="49" width="68" height="22"/>' +
    '<path class="g" d="M8 47H80"/>' +
    '<path class="t" d="M27 49V71M44 49V71M61 49V71M21 47V41H25V43"/>' +
    '<circle class="t" cx="52" cy="44" r="2.2"/><circle class="t" cx="62" cy="44" r="2.2"/>' +
    '<rect class="k" x="10" y="12" width="68" height="22"/>' +
    '<path class="t" d="M27 12V34M44 12V34M61 12V34"/>' +
    '<rect class="k" x="82" y="12" width="28" height="59"/>' +
    '<path class="t" d="M86 16h20v9h-20zM86 28h20v20h-20zM90 31H102M82 54H110"/>' +
    '<circle class="f" cx="94" cy="62" r="1"/><circle class="f" cx="98" cy="62" r="1"/>',
  /* Staircase in side view rising left to right, with pull-out drawers built under it, shorter drawers at the low end; green stair string. */
  "under-stairs":
    '<path class="h" d="M6 71H114"/>' +
    '<path class="k" d="M10 71V65H24V58H38V51H52V44H66V37H80V30H94V23H108V16H112V71"/>' +
    '<path class="g" d="M10 71L112 20"/>' +
    '<path class="t" d="M34 61h22v10h-22zM58 49h22v11h-22zM58 60h22v11h-22zM82 37h26v12h-26zM82 49h26v11h-26zM82 60h26v11h-26z"/>' +
    '<path class="f" d="M42 65h6v1.4h-6zM66 53h6v1.4h-6zM66 64h6v1.4h-6zM92 41h6v1.4h-6zM92 53h6v1.4h-6zM92 64h6v1.4h-6z"/>',
  /* Wall with panelled lower half, green dado rail and skirting, beside a four-panel door in an architrave with a knob. */
  "panelling-doors":
    '<path class="h" d="M6 9H114M6 71H114"/>' +
    '<path class="g" d="M6 44H68"/>' +
    '<path class="t" d="M8 48h12v14h-12zM23 48h12v14h-12zM38 48h12v14h-12zM53 48h12v14h-12zM6 65h62v6h-62z"/>' +
    '<rect class="k" x="68" y="12" width="40" height="59"/>' +
    '<rect class="k" x="72" y="16" width="32" height="55"/>' +
    '<path class="t" d="M76 20h9v16h-9zM88 20h9v16h-9zM76 42h9v24h-9zM88 42h9v24h-9z"/>' +
    '<circle class="f" cx="100" cy="46" r="1.6"/>',
  /* Chevron parquet seen from above, meeting the skirting along the top;
     one block picked out in green. Redrawn 14 Nov 2026: the first version
     read as a brick wall. */
  flooring:
    '<path class="k" d="M8 14H112"/><path class="t" d="M8 17H112"/>' +
    '<path class="t" d="M10 17V72M22 17V72M34 17V72M46 17V72M58 17V72M70 17V72M82 17V72M94 17V72M106 17V72"/>' +
    '<polyline class="t" points="10 18 22 26 34 18 46 26 58 18 70 26 82 18 94 26 106 18"/><polyline class="t" points="10 27 22 35 34 27 46 35 58 27 70 35 82 27 94 35 106 27"/><polyline class="t" points="10 36 22 44 34 36 46 44 58 36 70 44 82 36 94 44 106 36"/><polyline class="t" points="10 45 22 53 34 45 46 53 58 45 70 53 82 45 94 53 106 45"/><polyline class="t" points="10 54 22 62 34 54 46 62 58 54 70 62 82 54 94 62 106 54"/><polyline class="t" points="10 63 22 71 34 63 46 71 58 63 70 71 82 63 94 71 106 63"/>' +
    '<path class="g" d="M46 44L58 36V45L46 53Z"/>',
  /* Sheet of drawing paper with a rough sideboard sketch and a pencil laid across it, green tip: for something else. */
  "service-other":
    '<rect class="pf" x="16" y="8" width="68" height="60"/>' +
    '<rect class="k" x="16" y="8" width="68" height="60"/>' +
    '<path class="h" d="M24 24H66M24 22V26M66 22V26"/>' +
    '<path class="t" d="M24 32h42v24h-42zM45 32V56M24 40H66M40 46H42M48 46H50"/>' +
    '<polygon class="pf" points="106.1 18.1 101.9 13.9 76.3 39.5 72 48 80.5 43.7"/>' +
    '<polygon class="k" points="106.1 18.1 101.9 13.9 76.3 39.5 72 48 80.5 43.7"/>' +
    '<path class="t" d="M102.9 21.3L98.7 17.1"/>' +
    '<polygon class="m" points="72 48 73.5 45 75 46.5"/>',
  /* Width picker, about 1 m: one alcove unit beside the door, green dimension line over it. */
  "width-1":
    '<path class="h" d="M6 70H114"/>' +
    '<rect class="k" x="8" y="34" width="14" height="36"/>' +
    '<circle class="f" cx="19" cy="53" r="1"/>' +
    '<rect class="k" x="30" y="30" width="16" height="40"/>' +
    '<path class="t" d="M30 42H46M30 56H46"/>' +
    '<circle class="f" cx="38" cy="63" r="0.9"/>' +
    '<path class="g" d="M30 19V25M30 22H46M46 19V25"/>',
  /* Width picker, about 1.5 m: two-bay unit beside the door, green dimension line. */
  "width-2":
    '<path class="h" d="M6 70H114"/>' +
    '<rect class="k" x="8" y="34" width="14" height="36"/>' +
    '<circle class="f" cx="19" cy="53" r="1"/>' +
    '<rect class="k" x="30" y="30" width="28" height="40"/>' +
    '<path class="t" d="M30 42H58M30 56H58M44 30V70"/>' +
    '<circle class="f" cx="37" cy="63" r="0.9"/><circle class="f" cx="51" cy="63" r="0.9"/>' +
    '<path class="g" d="M30 19V25M30 22H58M58 19V25"/>',
  /* Width picker, about 2.5 m: three-bay unit, green dimension line. */
  "width-3":
    '<path class="h" d="M6 70H114"/>' +
    '<rect class="k" x="8" y="34" width="14" height="36"/>' +
    '<circle class="f" cx="19" cy="53" r="1"/>' +
    '<rect class="k" x="30" y="30" width="45" height="40"/>' +
    '<path class="t" d="M30 42H75M30 56H75M45 30V70M60 30V70"/>' +
    '<circle class="f" cx="37.5" cy="63" r="0.9"/><circle class="f" cx="52.5" cy="63" r="0.9"/><circle class="f" cx="67.5" cy="63" r="0.9"/>' +
    '<path class="g" d="M30 19V25M30 22H75M75 19V25"/>',
  /* Width picker, about 3.5 m: four-bay unit, green dimension line. */
  "width-4":
    '<path class="h" d="M6 70H114"/>' +
    '<rect class="k" x="8" y="34" width="14" height="36"/>' +
    '<circle class="f" cx="19" cy="53" r="1"/>' +
    '<rect class="k" x="30" y="30" width="64" height="40"/>' +
    '<path class="t" d="M30 42H94M30 56H94M46 30V70M62 30V70M78 30V70"/>' +
    '<circle class="f" cx="38" cy="63" r="0.9"/><circle class="f" cx="54" cy="63" r="0.9"/><circle class="f" cx="70" cy="63" r="0.9"/><circle class="f" cx="86" cy="63" r="0.9"/>' +
    '<path class="g" d="M30 19V25M30 22H94M94 19V25"/>',
  /* Width picker, 4 m and more: unit runs off the right edge with a zig-zag break mark, green dimension line. */
  "width-5":
    '<path class="h" d="M6 70H114"/>' +
    '<rect class="k" x="8" y="34" width="14" height="36"/>' +
    '<circle class="f" cx="19" cy="53" r="1"/>' +
    '<path class="k" d="M114 30H30V70H114"/>' +
    '<path class="t" d="M30 42H114M30 56H114M46.8 30V70M63.6 30V70M80.4 30V70M97.2 30V70"/>' +
    '<circle class="f" cx="38.4" cy="63" r="0.9"/><circle class="f" cx="55.2" cy="63" r="0.9"/><circle class="f" cx="72" cy="63" r="0.9"/><circle class="f" cx="88.8" cy="63" r="0.9"/>' +
    '<path class="g" d="M30 19V25M30 22H114"/>' +
    '<polyline class="t" points="108 34 112 42 108 50 112 58 108 66"/>',
  /* Width picker, not sure: door for scale, unit drawn as broken k dashes with no dimension, a tape measure with a green tape pulled out. */
  "width-unsure":
    '<path class="h" d="M6 70H114"/>' +
    '<rect class="k" x="8" y="34" width="14" height="36"/>' +
    '<circle class="f" cx="19" cy="53" r="1"/>' +
    '<path class="k" d="M30 30H37M42 30H49M54 30H61M62 30H66M30 30V37M30 42V50M30 55V62M30 67V70M66 30V37M66 42V50M66 55V62M66 67V70"/>' +
    '<circle class="k" cx="100" cy="61" r="9"/>' +
    '<circle class="t" cx="100" cy="61" r="3.5"/>' +
    '<path class="g" d="M91 66H70M70 63V69"/>' +
    '<path class="t" d="M85 66V63M80 66V63M75 66V63"/>',
};
