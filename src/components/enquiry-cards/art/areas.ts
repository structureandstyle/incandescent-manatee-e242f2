/**
 * Area cards: our own bird's-eye drawings, as on a map, never traced.
 * Format and classes: ./README.md.
 */
export const AREA_ART: Record<string, string> = {
  /* Reference drawing. The canal across the middle with the lock, Camden
     High Street coming up from the south to the station, Chalk Farm Road and
     Kentish Town Road fanning north over the canal, Camden Road heading east,
     the Overground along the top, and the corner of Regent's Park. */
  camden:
    '<rect class="gw" x="6" y="58" width="22" height="16"/>' +
    '<path class="s" d="M6 30L50 34M70 36L114 30M8 66L50 64M68 64L114 70M30 6L34 40M92 6L88 40M86 54L92 74"/>' +
    '<path class="rl" d="M6 16L114 24"/>' +
    '<path class="w" d="M6 46C22 42 34 48 48 44S76 36 90 42 104 44 114 40"/>' +
    '<path class="k" d="M49.5 40L50.5 48M53.5 39L54.5 47"/>' +
    '<path class="r" d="M58 74L61 52M61 52L44 6M61 52L76 6M61 52L114 58"/>' +
    '<rect class="m" x="58.5" y="49.5" width="5" height="5"/>',

  /* Hampstead: the Heath filling the east and north-east with its ponds down
     the south-east side and Whitestone Pond by Heath Street; Heath Street and
     the High Street running down through the village into Rosslyn Hill,
     Fitzjohn's Avenue heading south-south-west, winding lanes to the west. */
  hampstead:
    '<polygon class="gw" points="58,6 114,6 114,74 78,74 76,50 68,36 62,22"/>' +
    '<ellipse class="gd" cx="82" cy="52" rx="3.5" ry="2"/>' +
    '<ellipse class="gd" cx="87" cy="60" rx="3.5" ry="2"/>' +
    '<ellipse class="gd" cx="93" cy="67" rx="3.5" ry="2"/>' +
    '<ellipse class="gd" cx="53" cy="14" rx="3" ry="2"/>' +
    '<path class="s" d="M10 14C18 20 22 12 30 20S36 28 40 26M8 34C16 30 24 38 32 34M12 48C20 44 26 52 34 50M8 62L22 58L30 66M47 40L60 38"/>' +
    '<path class="r" d="M42 8L45 22L46 32L52 46L66 74M46 34L36 54L28 74"/>' +
    '<rect class="m" x="43.5" y="29.5" width="5" height="5"/>',

  /* Belsize Park: Haverstock Hill running north-north-west to south-south-east
     with Belsize Avenue crossing at the station, the little square of streets
     of Belsize Village, curving streets to the west, a corner of Primrose Hill
     bottom-left and a corner of the Heath top-right. */
  'belsize-park':
    '<polygon class="gw" points="6,74 6,60 20,62 30,74"/>' +
    '<polygon class="gw" points="86,6 114,6 114,34 100,26 92,16"/>' +
    '<path class="s" d="M10 20C20 22 24 32 20 44M16 12C28 16 32 26 30 34M14 46C22 44 30 50 36 48M42 50L54 50L54 60L42 60ZM48 50L48 60M42 55L54 55M70 52L96 62M72 62L100 74"/>' +
    '<path class="r" d="M46 6L58 40L70 74M38 34L78 46"/>' +
    '<rect class="m" x="55.5" y="37.5" width="5" height="5"/>',

  /* Primrose Hill: the hill as a rounded park with contour rings and paths to
     the summit, Regent's Park in the south-east corner, the canal curving
     between them, Regent's Park Road round the east side, the railway across
     the top. */
  'primrose-hill':
    '<ellipse class="gw" cx="52" cy="34" rx="28" ry="20"/>' +
    '<polygon class="gw" points="76,66 114,62 114,74 76,74"/>' +
    '<ellipse class="t" cx="52" cy="34" rx="18" ry="12"/>' +
    '<ellipse class="t" cx="52" cy="34" rx="9" ry="6"/>' +
    '<path class="s" d="M52 34L30 46M52 34L72 46M52 34L50 14M10 30L22 34M96 20L110 24M92 40L110 44"/>' +
    '<path class="rl" d="M6 10L114 12"/>' +
    '<path class="w" d="M6 62C30 58 52 64 74 60S100 56 114 54"/>' +
    '<path class="r" d="M72 58C92 50 94 28 78 16"/>' +
    '<rect class="m" x="49.5" y="31.5" width="5" height="5"/>',

  /* Kentish Town: Kentish Town Road curving north to south, Fortess Road
     branching north-east, two railways crossing near the middle, Prince of
     Wales Road heading west from the south end, a corner of Parliament Hill
     top-left, terraced streets either side. */
  'kentish-town':
    '<polygon class="gw" points="6,6 36,6 24,18 6,26"/>' +
    '<path class="s" d="M10 34L46 34M12 60L46 62M22 28L22 50M34 30L34 52M66 30L110 30M66 58L110 58M66 66L110 66M74 58L74 74M88 58L88 74M102 58L102 74M80 6L80 28M94 6L94 22"/>' +
    '<path class="rl" d="M6 44L114 40M6 50L114 48"/>' +
    '<path class="r" d="M54 6C58 24 52 44 56 74M56 26L96 8M55 66L14 54"/>' +
    '<rect class="m" x="52.5" y="33.5" width="5" height="5"/>',

  /* Swiss Cottage: Finchley Road and Avenue Road meeting in the small
     one-way triangle at the junction, the open space beside it with the round
     library on its edge, Adelaide Road heading east. */
  'swiss-cottage':
    '<polygon class="gw" points="28,38 50,42 48,60 28,56"/>' +
    '<circle class="k" cx="50" cy="46" r="3.5"/>' +
    '<path class="s" d="M8 22L32 26M6 68L40 64M72 8L98 14M78 24L112 18M86 70L112 58M62 40L114 40"/>' +
    '<path class="t" d="M56 36L64 38L60 44Z"/>' +
    '<path class="r" d="M40 6L56 36M60 44L70 74M64 38L96 74"/>' +
    '<rect class="m" x="57.5" y="37.5" width="5" height="5"/>',

  /* Highgate: the hilltop village. High Street along the ridge, Highgate Hill
     descending south-east, North Hill heading north, Highgate Wood top-right,
     Waterlow Park and the Cemetery on the slope, the edge of the Heath with
     its ponds down the left side. */
  highgate:
    '<polygon class="gw" points="6,6 26,6 26,28 30,52 24,74 6,74"/>' +
    '<polygon class="gw" points="76,6 114,6 114,26 94,20 80,16"/>' +
    '<polygon class="gw" points="72,46 98,42 100,60 82,66 76,60"/>' +
    '<polygon class="gw" points="100,40 114,36 114,56 102,58"/>' +
    '<ellipse class="gd" cx="22" cy="36" rx="3" ry="2"/>' +
    '<ellipse class="gd" cx="25" cy="46" rx="3" ry="2"/>' +
    '<ellipse class="gd" cx="23" cy="56" rx="3" ry="2"/>' +
    '<path class="s" d="M36 40L50 38M40 50L58 46M44 16L52 20M34 22L46 20M62 38L70 36"/>' +
    '<path class="r" d="M34 32L56 28L82 26M56 28L62 6M56 28L74 74"/>' +
    '<rect class="m" x="53.5" y="25.5" width="5" height="5"/>',

  /* West Hampstead: West End Lane curving north to south with three railway
     lines crossing close together just below the middle, a small station on
     the Lane at each crossing, Fortune Green top-left, a grid of streets. */
  'west-hampstead':
    '<rect class="gw" x="10" y="10" width="24" height="16"/>' +
    '<path class="s" d="M70 6L70 40M88 6L88 40M104 6L104 40M70 58L70 74M88 58L88 74M104 58L104 74M56 14L114 14M56 26L114 26M56 34L114 34M56 64L114 64M6 36L48 36M6 64L48 64M20 58L20 74M34 58L34 74"/>' +
    '<path class="rl" d="M6 44L114 44M6 49L114 49M6 54L114 54"/>' +
    '<path class="r" d="M52 6C56 26 50 46 54 74"/>' +
    '<rect class="k" x="50.7" y="42" width="4" height="4"/>' +
    '<rect class="k" x="50.7" y="47" width="4" height="4"/>' +
    '<rect class="k" x="50.7" y="52" width="4" height="4"/>' +
    '<rect class="m" x="58" y="46.5" width="5" height="5"/>',

  /* Islington: Upper Street running north with Essex Road forking north-east
     at Islington Green, Highbury Fields at the top, Liverpool Road parallel to
     the west, Pentonville Road and City Road crossing at the Angel, the canal
     coming out of its tunnel on the right. */
  islington:
    '<rect class="gw" x="64" y="8" width="28" height="12"/>' +
    '<polygon class="gw" points="62,43 62,35 72,39"/>' +
    '<path class="s" d="M46 62L48 40L47 10M72 46L110 48M12 30L46 28M12 50L46 54"/>' +
    '<path class="w" d="M70 58C84 56 96 62 114 60"/>' +
    '<path class="r" d="M58 62L60 46L58 8M60 46L100 24M8 68L58 62L112 72"/>' +
    '<rect class="m" x="63.5" y="37.5" width="5" height="5"/>',

  /* Maida Vale: the road dead straight from north-west to south-east, the
     canal along the bottom with the Little Venice basin where it branches,
     Warwick Avenue north from the basin, Elgin Avenue crossing west to east,
     Paddington Recreation Ground top-left. */
  'maida-vale':
    '<polygon class="gw" points="8,8 40,8 40,20 8,20"/>' +
    '<polygon class="gd" points="46,61 58,61 52,69"/>' +
    '<path class="s" d="M72 6L72 28M92 6L92 28M80 38L80 58M98 44L98 58M28 32L28 52M16 30L16 56"/>' +
    '<path class="w" d="M6 60C24 58 38 64 52 62C70 60 94 56 114 58M52 62L60 72"/>' +
    '<path class="r" d="M6 24L106 54M6 29L114 29M52 61L54 6"/>' +
    '<rect class="m" x="57.5" y="37.8" width="5" height="5"/>',

  /* Somewhere else: a loose grid and one main road, a dashed boundary round
     the left two thirds (the areas we list) and a green arrow out across it
     to the marker. */
  'area-other':
    '<path class="s" d="M10 22L110 20M10 38L110 40M10 56L110 54M24 8L26 72M44 8L42 72M64 8L66 72M92 8L94 72M106 10L108 70"/>' +
    '<path class="rl" d="M10 12L40 8L72 12L78 30L74 52L78 66L50 72L14 68L8 40Z"/>' +
    '<path class="r" d="M8 58C34 52 56 60 80 54S104 50 114 52"/>' +
    '<path class="g" d="M38 32C58 36 76 28 95 22M89 20.5L95 22L91 26.5"/>' +
    '<rect class="m" x="98.5" y="18.5" width="5" height="5"/>',
};
