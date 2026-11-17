/**
 * Line drawings for the service pages (17 Nov 2026), in the area pages' format
 * (components/enquiry-cards/art/README.md) at 320 x 240: inner markup only,
 * every element one class from k, t, h, g, gt, f, pf, gw, styled by
 * ServiceDrawing.astro (prefixed "sd-"). No text, square corners, one green idea
 * per drawing. Simplified and our own; none shows a real home or a job.
 *
 * Asked for by Arthur on the review link (17 Nov 2026, internal comment on
 * /bespoke-kitchens/): "rework on this page, and add different layouts, and make
 * it more visual". Drawings, not photographs, because Kaspar took the project
 * galleries off the service pages on 6 Sep 2026 ([slug].astro says why).
 *
 * The six layout plans share one scale and style, drawn by one generator so they
 * compare side by side; in each, the cabinetry is the green. `label` is the
 * drawing's description for screen readers (only what is drawn); `caption` sits
 * under it. Checked by an independent reviewer on 17 Nov 2026; on its findings
 * the U, L, galley and peninsula plans were redrawn and four labels corrected.
 * Denis's comment on the review link (17 Nov): every sink and hob now sits
 * centred inside one cabinet, never across two, and each window is over its sink.
 * The hob rings and stools are drawn as true circles on their centre points (the
 * first version drew each ring from its left edge, so hobs sat left, on the line).
 */
export const SERVICE_DRAWINGS: Record<string, { markup: string; label: string; caption: string }> = {
  "kitchen-one-wall": {
    caption: "One wall layout, in plan",
    label:
      "Plan of a kitchen seen from above. Every cabinet stands along the top wall, with a tall unit at the left end. The base cupboards hold a sink under a window and a hob. The rest of the room is empty floor, with a door in the bottom wall. The cabinets are drawn in green.",
    markup:
      "<path class=\"gw\" d=\"M54 62h22v24h-22zM76 62h190v20h-190z\"/><path class=\"k\" d=\"M48 56h224v136h-224zM54 62h212v124h-212z\"/><path class=\"pf\" d=\"M141.1 55h36v8h-36zM70 185h30v8h-30z\"/><path class=\"k\" d=\"M70 186V156M141.1 56V62M177.1 56V62M70 186V192M100 186V192\"/><path class=\"t\" d=\"M54 62L76 86M99.8 62V82M123.5 62V82M147.2 62V82M171 62V82M194.8 62V82M218.5 62V82M242.2 62V82M151.1 66.5h16v11h-16zM223.6 67.8a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0M223.6 76.2a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0M232 67.8a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0M232 76.2a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0M141.1 56H177.1M141.1 59H177.1M141.1 62H177.1M70 156A30 30 0 0 1 100 186\"/><path class=\"g\" d=\"M54 62h22v24h-22zM76 62h190v20h-190z\"/><circle class=\"f\" cx=\"159.1\" cy=\"72\" r=\"1.2\"/>",
  },
  "kitchen-galley": {
    caption: "Galley layout, in plan",
    label:
      "Plan of a long, narrow kitchen seen from above. Two runs of base cupboards face each other along the long walls, with a walkway between them. The top run has a tall unit at its left end and a sink; the bottom run has a hob almost opposite the sink. A door is in the left end wall and a window in the right. The cabinets are drawn in green.",
    markup:
      "<path class=\"gw\" d=\"M36 82h22v24h-22zM58 82h226v20h-226zM36 142h248v20h-248z\"/><path class=\"k\" d=\"M30 76h260v92h-260zM36 82h248v80h-248z\"/><path class=\"pf\" d=\"M283 102h8v40h-8zM29 108h8v30h-8z\"/><path class=\"k\" d=\"M36 138H66M284 102H290M284 142H290M30 108H36M30 138H36\"/><path class=\"t\" d=\"M36 82L58 106M83.1 82V102M108.2 82V102M133.3 82V102M158.4 82V102M183.6 82V102M208.7 82V102M233.8 82V102M258.9 82V102M60.8 142V162M85.6 142V162M110.4 142V162M135.2 142V162M160 142V162M184.8 142V162M209.6 142V162M234.4 142V162M259.2 142V162M163 86.5h16v11h-16zM165.6 147.8a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0M165.6 156.2a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0M174 147.8a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0M174 156.2a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0M284 102V142M287 102V142M290 102V142M66 138A30 30 0 0 0 36 108\"/><path class=\"g\" d=\"M36 82h22v24h-22zM58 82h226v20h-226zM36 142h248v20h-248z\"/><circle class=\"f\" cx=\"171\" cy=\"92\" r=\"1.2\"/>",
  },
  "kitchen-l-shaped": {
    caption: "L-shaped layout, in plan",
    label:
      "Plan of a kitchen seen from above. Cabinets run along the top wall and down the left wall, meeting in the top left corner. The top run holds a sink under a window. The left run holds a hob, with a tall unit at its lower end. A door is in the bottom wall at the right. The cabinets are drawn in green.",
    markup:
      "<path class=\"gw\" d=\"M80 42h160v20h-160zM80 62h20v100h-20zM80 162h22v40h-22z\"/><path class=\"k\" d=\"M74 36h172v172h-172zM80 42h160v160h-160z\"/><path class=\"pf\" d=\"M164.9 35h36v8h-36zM192 201h30v8h-30z\"/><path class=\"k\" d=\"M222 202V172M164.9 36V42M200.9 36V42M192 202V208M222 202V208\"/><path class=\"t\" d=\"M102.9 42V62M125.7 42V62M148.6 42V62M171.4 42V62M194.3 42V62M217.1 42V62M80 87H100M80 112H100M80 137H100M80 162L102 202M174.9 46.5h16v11h-16zM83.2 95.3a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0M83.2 103.7a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0M91.6 95.3a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0M91.6 103.7a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0M164.9 36H200.9M164.9 39H200.9M164.9 42H200.9M222 172A30 30 0 0 0 192 202\"/><path class=\"g\" d=\"M80 42h160v20h-160zM80 62h20v100h-20zM80 162h22v40h-22z\"/><circle class=\"f\" cx=\"182.9\" cy=\"52\" r=\"1.2\"/>",
  },
  "kitchen-u-shaped": {
    caption: "U-shaped layout, in plan",
    label:
      "Plan of a kitchen seen from above. Cabinets wrap round three walls: along the top, with a sink under a window, and down both sides. The left run holds a hob and the right run ends in a tall unit. The bottom wall has no cabinets and holds the door. The cabinets are drawn in green.",
    markup:
      "<path class=\"gw\" d=\"M100 42h120v20h-120zM100 62h20v104h-20zM200 62h20v104h-20zM198 166h22v36h-22z\"/><path class=\"k\" d=\"M94 36h132v172h-132zM100 42h120v160h-120z\"/><path class=\"pf\" d=\"M142 35h36v8h-36zM132 201h30v8h-30z\"/><path class=\"k\" d=\"M132 202V172M142 36V42M178 36V42M132 202V208M162 202V208\"/><path class=\"t\" d=\"M124 42V62M148 42V62M172 42V62M196 42V62M100 88H120M100 114H120M100 140H120M200 88H220M200 114H220M200 140H220M198 166L220 202M152 46.5h16v11h-16zM103.2 96.8a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0M103.2 105.2a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0M111.6 96.8a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0M111.6 105.2a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0M142 36H178M142 39H178M142 42H178M132 172A30 30 0 0 1 162 202\"/><path class=\"g\" d=\"M100 42h120v20h-120zM100 62h20v104h-20zM200 62h20v104h-20zM198 166h22v36h-22z\"/><circle class=\"f\" cx=\"160\" cy=\"52\" r=\"1.2\"/>",
  },
  "kitchen-island": {
    caption: "Island layout, in plan",
    label:
      "Plan of a kitchen seen from above. A run of cabinets along the top wall has a tall unit at the left end, a sink under a window and a hob. A separate rectangular island stands in the middle of the room, with three round stools along its lower side. A door with its swing is in the bottom wall. The cabinets are drawn in green.",
    markup:
      "<path class=\"gw\" d=\"M40 42h22v24h-22zM62 42h218v20h-218zM96 104h128v30h-128z\"/><path class=\"k\" d=\"M34 36h252v172h-252zM40 42h240v160h-240z\"/><path class=\"pf\" d=\"M153 35h36v8h-36zM52 201h30v8h-30z\"/><path class=\"k\" d=\"M52 202V172M153 36V42M189 36V42M52 202V208M82 202V208\"/><path class=\"t\" d=\"M40 42L62 66M86.2 42V62M110.4 42V62M134.7 42V62M158.9 42V62M183.1 42V62M207.3 42V62M231.6 42V62M255.8 42V62M163 46.5h16v11h-16zM236.9 47.8a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0M236.9 56.2a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0M245.3 47.8a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0M245.3 56.2a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0M128 104V134M160 104V134M192 104V134M119 148a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M155 148a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M191 148a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M153 36H189M153 39H189M153 42H189M52 172A30 30 0 0 1 82 202\"/><path class=\"g\" d=\"M40 42h22v24h-22zM62 42h218v20h-218zM96 104h128v30h-128z\"/><circle class=\"f\" cx=\"171\" cy=\"52\" r=\"1.2\"/>",
  },
  "kitchen-peninsula": {
    caption: "Peninsula layout, in plan",
    label:
      "Plan of a kitchen seen from above. A run of cabinets along the top wall has a tall unit at the left end and a sink under a window. Partway along it, a second run juts out into the room, joined at one end and free at the other, holding a hob. Three round stools stand along its free side. A door is in the bottom wall. The cabinets are drawn in green.",
    markup:
      "<path class=\"gw\" d=\"M50 42h22v24h-22zM72 42h198v20h-198zM190 62h22v92h-22z\"/><path class=\"k\" d=\"M44 36h232v172h-232zM50 42h220v160h-220z\"/><path class=\"pf\" d=\"M115.9 35h36v8h-36zM64 201h30v8h-30z\"/><path class=\"k\" d=\"M64 202V172M115.9 36V42M151.9 36V42M64 202V208M94 202V208\"/><path class=\"t\" d=\"M50 42L72 66M96.8 42V62M121.5 42V62M146.2 42V62M171 42V62M195.8 42V62M220.5 42V62M245.2 42V62M190 85H212M190 108H212M190 131H212M125.9 46.5h16v11h-16zM194.2 92.3a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0M194.2 100.7a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0M202.6 92.3a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0M202.6 100.7a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0M221 82a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M221 112a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M221 142a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M115.9 36H151.9M115.9 39H151.9M115.9 42H151.9M64 172A30 30 0 0 1 94 202\"/><path class=\"g\" d=\"M50 42h22v24h-22zM72 42h198v20h-198zM190 62h22v92h-22z\"/><circle class=\"f\" cx=\"133.9\" cy=\"52\" r=\"1.2\"/>",
  },
  "kitchen-run": {
    caption: "One kitchen wall, its appliances in green",
    label:
      "Front elevation of one kitchen wall, with every unit rising to the ceiling line. At the left stand two tall units. One has a cupboard above a built-in oven, with a drawer and a cupboard below it; the other is a fridge column. A worktop runs along the rest of the wall over base units: three drawers, two cupboard doors under a window, a dishwasher, and two wide drawers under the hob. Wall cupboards sit either side of the window, and an extractor hood rises above the hob. The oven, dishwasher, hob and hood are drawn in green.",
    markup:
      "<path class=\"h\" d=\"M12 40H308M12 212H308\"/><path class=\"k\" d=\"M24 40H104V206H24ZM64 40V206M24 70H64M24 120H64M24 140H64M64 118H104\"/><path class=\"t\" d=\"M28 66H60M28 124H60M44 130h4M28 144H60M68 114H100M68 122H100M26 206V212M102 206V212\"/><path class=\"k\" d=\"M104 40H140V92H104ZM196 40H244V92H196ZM104 128H296V132H104ZM104 132H296V206H104ZM144 132V206M170 132V206M196 132V206M236 132V206M104 156H144M104 180H144M236 168H296\"/><path class=\"t\" d=\"M108 88H136M200 88H240M108 136H140M108 160H140M108 184H140M148 136H166M174 136H192M240 136H292M240 172H292M106 206V212M294 206V212M106 209H294\"/><path class=\"k\" d=\"M148 50H192V114H148ZM148 82H192\"/><path class=\"t\" d=\"M170 50V114M146 114H194\"/><path class=\"g\" d=\"M28 76H60V116H28ZM248 92L256 60H276L284 92ZM260 60V40H272V60M196 132H236V204H196ZM252 124H280V128H252Z\"/><path class=\"gt\" d=\"M32 84H56\"/>",
  },
};
