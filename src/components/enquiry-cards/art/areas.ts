/**
 * Area cards: one landmark per area that people who live there know at a
 * glance, drawn as a front elevation like the service cards. Our own simple
 * line drawings, never traced from photographs or maps.
 *
 * Landmarks replaced the first bird's-eye maps on 14 Nov 2026 (a founder:
 * "maybe something unique each area has that everyone recognizes"). The
 * "Somewhere else" card keeps a map: a dashed boundary with an arrow
 * leading out of it.
 *
 * Format and classes: ./README.md.
 */
export const AREA_ART: Record<string, string> = {
  /* Kenwood House on Hampstead Heath: the portico and its low wings, a tree either side, the lawn. */
  "hampstead":
    '<path class="h" d="M6 53H114"/>' +
    '<path class="k" d="M44 31L60 19L76 31Z"/>' +
    '<path class="k" d="M46 34H74M46 34V53M74 34V53M50 34V53M56.7 34V53M63.3 34V53M70 34V53"/>' +
    '<path class="k" d="M20 53V38H46M74 38H100V53"/>' +
    '<path class="t" d="M20 41H46M74 41H100M57.5 44h5v9h-5z"/>' +
    '<path class="t" d="M22.5 44h3v9h-3zM28.5 44h3v9h-3zM34.5 44h3v9h-3zM40.5 44h3v9h-3zM76.5 44h3v9h-3zM82.5 44h3v9h-3zM88.5 44h3v9h-3zM94.5 44h3v9h-3z"/>' +
    '<circle class="gw" cx="11" cy="40" r="6"/>' +
    '<circle class="gw" cx="109" cy="40" r="6"/>' +
    '<path class="t" d="M11 46V53M109 46V53"/>' +
    '<path class="g" d="M14 62Q60 57 106 64"/>',
  /* A pair of white stucco Italianate villas, the houses Belsize Park is known for. */
  "belsize-park":
    '<path class="h" d="M6 62H114"/>' +
    '<path class="k" d="M16 28L25 18H52L60 24L68 18H95L104 28Z"/>' +
    '<path class="k" d="M18 28V62M60 24V62M102 28V62"/>' +
    '<path class="t" d="M20 28v2.5M26 28v2.5M32 28v2.5M38 28v2.5M44 28v2.5M50 28v2.5M56 28v2.5M64 28v2.5M70 28v2.5M76 28v2.5M82 28v2.5M88 28v2.5M94 28v2.5M100 28v2.5"/>' +
    '<path class="t" d="M22 33h6v14h-6zM40 33h6v14h-6zM92 33h6v14h-6zM74 33h6v14h-6zM40 52h6v8h-6zM74 52h6v8h-6z"/>' +
    '<path class="g" d="M21 47.5H29M39 47.5H47M91 47.5H99M73 47.5H81"/>' +
    '<path class="k" d="M18 50H30M20 50V62M28 50V62M90 50H102M92 50V62M100 50V62"/>' +
    '<path class="t" d="M22 53h4v9h-4zM94 53h4v9h-4zM17 64H31M15 66H33M89 64H103M87 66H105"/>' +
    '<circle class="gw" cx="110" cy="52" r="6"/>' +
    '<path class="t" d="M110 58V62"/>',
  /* The top of Primrose Hill: the path, the lamp post and bench, and the skyline beyond (BT Tower, St Paul's, the Shard). */
  "primrose-hill":
    '<path class="gw" d="M6 74Q60 18 114 74Z"/>' +
    '<path class="k" d="M6 74Q60 18 114 74"/>' +
    '<path class="h" d="M6 42H114"/>' +
    '<path class="t" d="M10 42V35H18V42M90 42V33H98V42M100 42V37H110V42"/>' +
    '<path class="t" d="M22 42V15M22 15V10M20.5 20h3v6h-3z"/>' +
    '<path class="t" d="M38 42V37H56V42M40 37Q47 24 54 37M47 28V24M45.5 25.5H48.5"/>' +
    '<path class="t" d="M79 42L84 11L89 42"/>' +
    '<path class="t" d="M42 74Q54 62 55 48M52 74Q62 62 60 48"/>' +
    '<path class="k" d="M66 46V33M62 33H70L68.5 29.5H63.5Z"/>' +
    '<path class="k" d="M50 43.5H58"/>' +
    '<path class="t" d="M51 43.5V46.8M57 43.5V46.8M50 40H57.5"/>',
  /* The Forum on Highgate Road: the stepped art deco front and its canopy. */
  "kentish-town":
    '<path class="h" d="M6 66H114M6 70H114"/>' +
    '<path class="k" d="M40 66V24H46V18H52V14H68V18H74V24H80V66"/>' +
    '<path class="k" d="M14 66V38H40M80 38H106V66"/>' +
    '<path class="t" d="M46 26h4v24h-4zM58 26h4v24h-4zM70 26h4v24h-4zM14 44H40M80 44H106"/>' +
    '<path class="t" d="M19 48h5v8h-5zM30 48h5v8h-5zM85 48h5v8h-5zM96 48h5v8h-5z"/>' +
    '<path class="g" d="M30 54H90M30 54V57M90 54V57"/>' +
    '<path class="t" d="M46 57h5v9h-5zM57.5 57h5v9h-5zM69 57h5v9h-5z"/>' +
    '<path class="k" d="M111 66V38H107"/>' +
    '<circle class="f" cx="107" cy="40" r="1.2"/>',
  /* Camden Lock: the lock gates and their beams, a narrowboat, the humped footbridge. */
  "camden":
    '<path class="h" d="M6 66H114"/>' +
    '<path class="k" d="M30 38Q64 4 98 38M36 42Q64 12 92 42M30 38L36 42M98 38L92 42M30 38V58M36 42V58M98 38V58M92 42V58"/>' +
    '<path class="t" d="M44 26.9V34.7M52 23.1V29.8M60 21.2V27.3M68 21.2V27.3M76 23.1V29.8M84 26.9V34.7"/>' +
    '<path class="k" d="M20 40h4v24h-4zM98 52h4v12h-4zM22 40L8 34M102 52L114 47"/>' +
    '<path class="w" d="M6 44H20M26 58H96M104 58H114"/>' +
    '<path class="k" d="M42 50H86L82 57H46ZM52 50V45H76V50"/>' +
    '<path class="t" d="M55 46.5h4v2.5h-4zM62 46.5h4v2.5h-4zM69 46.5h4v2.5h-4z"/>' +
    '<path class="g" d="M45 53.5H83"/>',
  /* The Swiss Cottage pub: the chalet roof, deep eaves and the long balcony. */
  "swiss-cottage":
    '<path class="h" d="M6 71H114"/>' +
    '<path class="k" d="M12 38L55 15L98 38ZM20 38V71H90V38M18 57H92"/>' +
    '<path class="t" d="M17 38L55 19L93 38"/>' +
    '<path class="g" d="M18 49H92"/>' +
    '<path class="t" d="M22 49V57M28 49V57M34 49V57M40 49V57M46 49V57M52 49V57M58 49V57M64 49V57M70 49V57M76 49V57M82 49V57M88 49V57"/>' +
    '<path class="t" d="M47 28h5v8h-5zM55 28h5v8h-5zM26 41h4v6h-4zM33 41h4v6h-4zM76 41h4v6h-4zM83 41h4v6h-4z"/>' +
    '<polygon class="pf" points="71,34 71,28 78,21 85,28 85,34"/>' +
    '<path class="k" d="M71 34V28L78 21L85 28V34"/>' +
    '<path class="t" d="M76 28h4v5h-4z"/>' +
    '<path class="k" d="M44 71V61H64V71"/>' +
    '<path class="t" d="M54 61V71M25 62h10v6h-10zM75 62h10v6h-10z"/>' +
    '<circle class="gw" cx="106" cy="50" r="9"/>' +
    '<path class="k" d="M106 59V71"/>',
  /* Highgate Cemetery: the Gothic gateway among trees, headstones, a cross and an obelisk. */
  "highgate":
    '<circle class="gw" cx="33" cy="32" r="14"/>' +
    '<circle class="gw" cx="88" cy="30" r="14"/>' +
    '<path class="h" d="M6 73L36 71L66 73L96 71L114 72"/>' +
    '<path class="t" d="M33 46V60M88 44V58"/>' +
    '<path class="k" d="M38 72V28H46V72M74 72V28H82V72M37 28H47L42 22ZM73 28H83L78 22Z"/>' +
    '<path class="k" d="M46 46C46 34 54 26 60 18C66 26 74 34 74 46"/>' +
    '<path class="t" d="M50 46C50 38 55 32 60 27C65 32 70 38 70 46M52 52V46M56 52V44M64 52V44M68 52V46"/>' +
    '<path class="k" d="M14 73V63Q14 58 19 58Q24 58 24 63V73M30 73V65L34 60L38 65V73M52 73V61M48 65H56M68 73L69 59L70.5 55L72 59L73 73M88 73V65Q88 61 92 61Q96 61 96 65V73M102 73V68Q102 65 105 65Q108 65 108 68V73"/>',
  /* West End Lane under the railway: the girder bridge, a train crossing, shops beneath. */
  "west-hampstead":
    '<path class="h" d="M6 71H114"/>' +
    '<path class="k" d="M6 30H114M6 38H114M6 30V38M114 30V38M28 38V71H32V38M88 38V71H92V38"/>' +
    '<path class="t" d="M12 30V38M18 30V38M24 30V38M30 30V38M36 30V38M42 30V38M48 30V38M54 30V38M60 30V38M66 30V38M72 30V38M78 30V38M84 30V38M90 30V38M96 30V38M102 30V38M108 30V38"/>' +
    '<path class="k" d="M34 17H60V30H34ZM62 17H88V30H62Z"/>' +
    '<path class="t" d="M37 20h4v4h-4zM43 20h4v4h-4zM49 20h4v4h-4zM55 20h3v4h-3zM65 20h4v4h-4zM71 20h4v4h-4zM77 20h4v4h-4zM83 20h3v4h-3z"/>' +
    '<path class="g" d="M34 27H60M62 27H88"/>' +
    '<path class="g" d="M8 49H27L28 54H7Z"/>' +
    '<path class="k" d="M93 49H112L113 54H94Z"/>' +
    '<path class="t" d="M12 49L11 54M17 49V54M22 49L23 54M98 49L97.5 54M103 49V54M108 49L108.5 54"/>' +
    '<path class="t" d="M9 58h12v13M23 58h4v13M94 58h12M94 58v13M110 58v13"/>',
  /* The Angel: the corner building with its domed turret on the junction. */
  "islington":
    '<path class="h" d="M6 72H114"/>' +
    '<path class="k" d="M60 34L16 40V66L60 71L104 66V40ZM60 34V71M53 34V22H67V34"/>' +
    '<path class="g" d="M52 22C52 14 55 12 60 12C65 12 68 14 68 22Z"/>' +
    '<path class="k" d="M58 12V9H62V12M60 9V6"/>' +
    '<path class="t" d="M47.4 38.1h5.1v5.9h-5.1zM47.4 46.4h5.1v5.9h-5.1zM47.4 54.7h5.1v5.9h-5.1zM37.6 39.3h4.8v5.4h-4.7zM37.6 47h4.8v5.4h-4.7zM37.6 54.6h4.8v5.4h-4.7zM27.8 40.5h4.4v5h-4.4zM27.8 47.5h4.4v5h-4.4zM27.8 54.6h4.4v5h-4.4zM18 41.6h4v4.6h-4zM18 48.1h4v4.6h-4zM18 54.6h4v4.6h-4zM67.4 38.1h5.1v5.9h-5.1zM67.4 46.4h5.1v5.9h-5.1zM67.4 54.7h5.1v5.9h-5.1zM77.6 39.3h4.8v5.4h-4.7zM77.6 47h4.8v5.4h-4.7zM77.6 54.6h4.8v5.4h-4.7zM87.8 40.5h4.4v5h-4.4zM87.8 47.5h4.4v5h-4.4zM87.8 54.6h4.4v5h-4.4zM98 41.6h4v4.6h-4zM98 48.1h4v4.6h-4zM98 54.6h4v4.6h-4zM57.5 25h5v6h-5z"/>' +
    '<path class="t" d="M44.9 62.6h10.3v6.2h-10.2zM35.3 62h9.5v5.8h-9.5zM25.6 61.4h8.8v5.3h-8.7zM16 60.8h8v4.9h-8zM64.9 62.6h10.3v6.2h-10.2zM75.3 62h9.5v5.8h-9.5zM85.6 61.4h8.8v5.3h-8.7zM96 60.8h8v4.9h-8zM60 61.4L16 59.2M60 61.4L104 59.2"/>' +
    '<path class="k" d="M110 73V50M107 50H112"/>' +
    '<path class="g" d="M106 49Q109.5 44 113 49Z"/>' +
    '<circle class="gw" cx="10" cy="56" r="6"/>' +
    '<path class="t" d="M10 62V72"/>',
  /* Little Venice: narrowboats on the canal, the iron footbridge, a weeping willow, a stucco house. */
  "maida-vale":
    '<path class="h" d="M6 46H80"/>' +
    '<path class="t" d="M36 46V12H76V46M36 16H76M36 28H76M41 20h5v6h-5zM53 20h5v6h-5zM66 20h5v6h-5zM41 32h5v8h-5zM53 32h5v8h-5zM66 32h5v8h-5z"/>' +
    '<ellipse class="gw" cx="20" cy="26" rx="14" ry="10"/>' +
    '<path class="k" d="M20 46Q21 38 19 30"/>' +
    '<path class="t" d="M8 28V42M12 32V45M16 34V43M24 34V44M28 32V45M32 28V42"/>' +
    '<path class="k" d="M10 54H54L50 59H14ZM16 48H46V54"/>' +
    '<path class="t" d="M20 50h3v2.5h-3zM26 50h3v2.5h-3zM32 50h3v2.5h-3zM38 50h3v2.5h-3z"/>' +
    '<path class="g" d="M12 56.5H52"/>' +
    '<path class="k" d="M58 54H80L77 59H61ZM62 49H76V54"/>' +
    '<path class="t" d="M65 51h3v2h-3zM71 51h3v2h-3z"/>' +
    '<path class="w" d="M6 64Q20 62 34 64T62 64T90 64T114 64M16 70Q30 68 44 70T72 70"/>' +
    '<path class="k" d="M82 52Q97 32 112 52M82 52H112M82 52V58M112 52V58"/>' +
    '<path class="t" d="M88 52V45.6M92.5 52V42.9M97 52V42M101.5 52V42.9M106 52V45.6"/>',
  /* Somewhere else: a loose street grid, the dashed edge of the areas we list,
     and a green arrow leading out of it to a marker beyond. */
  "area-other":
    '<path class="s" d="M10 22L110 20M10 38L110 40M10 56L110 54M24 8L26 72M44 8L42 72M64 8L66 72M92 8L94 72M106 10L108 70"/>' +
    '<path class="rl" d="M10 12L40 8L72 12L78 30L74 52L78 66L50 72L14 68L8 40Z"/>' +
    '<path class="r" d="M8 58C34 52 56 60 80 54S104 50 114 52"/>' +
    '<path class="g" d="M38 32C58 36 76 28 95 22M89 20.5L95 22L91 26.5"/>' +
    '<rect class="m" x="98.5" y="18.5" width="5" height="5"/>',
};
