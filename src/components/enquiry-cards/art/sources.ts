/**
 * "How did you hear about us?" cards: generic objects, never a company logo.
 * Format and classes: ./README.md.
 */
export const SOURCE_ART: Record<string, string> = {
  /* Reference drawing. A browser window with a search box and a magnifying
     glass, the first result in green. Not the Google mark. */
  "source-search":
    '<rect class="k" x="14" y="12" width="92" height="56"/>' +
    '<path class="t" d="M14 21H106"/>' +
    '<circle class="f" cx="19.5" cy="16.5" r="1.3"/><circle class="f" cx="24" cy="16.5" r="1.3"/><circle class="f" cx="28.5" cy="16.5" r="1.3"/>' +
    '<rect class="k" x="26" y="28" width="68" height="10"/>' +
    '<circle class="g" cx="86" cy="32.5" r="2.8"/><path class="g" d="M88 34.5L90.5 37"/>' +
    '<path class="g" d="M26 46H70"/>' +
    '<path class="t" d="M26 51H88M26 57H62M26 62H80"/>',

  /* A paper map folded in three panels: zig-zag fold edges, thin roads, a green
     route ending at a plain teardrop pin. Not the Google Maps pin. */
  "source-maps":
    '<polyline class="k" points="12,16 28,12 44,16 60,12 76,16 92,12 108,16"/>' +
    '<polyline class="k" points="12,64 28,68 44,64 60,68 76,64 92,68 108,64"/>' +
    '<path class="k" d="M12 16V64M108 16V64"/>' +
    '<path class="t" d="M44 16V64M76 16V64"/>' +
    '<path class="t" d="M18 28H38M30 28V60M52 26H70M62 26V62M84 58H102"/>' +
    '<polyline class="g" points="18,56 34,46 52,50 66,40 80,46 94,44"/>' +
    '<path class="k" d="M94 44L88.5 35A6 6 0 1 1 99.5 35Z"/>' +
    '<circle class="f" cx="94" cy="32" r="1.8"/>',

  /* A chat window with a question bubble on the right, a longer answer bubble
     on the left and a small green sparkle for the assistant. */
  "source-ai":
    '<rect class="k" x="14" y="10" width="92" height="60"/>' +
    '<path class="t" d="M14 19H106"/>' +
    '<rect class="k" x="58" y="25" width="40" height="12"/>' +
    '<path class="k" d="M88 37L92 42L82 37"/>' +
    '<path class="t" d="M63 30H93M63 34H83"/>' +
    '<rect class="k" x="22" y="47" width="50" height="18"/>' +
    '<path class="k" d="M30 47L26 42L38 47"/>' +
    '<path class="g" d="M27 53H67M27 57H60M27 61H66"/>' +
    '<polygon class="g" points="90,48 92,54 98,56 92,58 90,64 88,58 82,56 88,54"/>',

  /* Two people, head and shoulders, facing each other, with a green speech
     bubble between them: one telling the other about us. */
  "source-referral":
    '<path class="h" d="M12 68H108"/>' +
    '<circle class="k" cx="36" cy="34" r="9"/>' +
    '<path class="k" d="M16 68C16 56 24 50 34 50C44 50 52 56 52 68"/>' +
    '<circle class="k" cx="84" cy="34" r="9"/>' +
    '<path class="k" d="M68 68C68 56 76 50 86 50C96 50 104 56 104 68"/>' +
    '<rect class="g" x="49" y="14" width="22" height="13"/>' +
    '<path class="g" d="M54 27L52 33L60 27"/>' +
    '<path class="gt" d="M54 19H66M54 23H62"/>',

  /* A signpost with two arrow boards pointing different ways, the left one
     edged in green. */
  "source-other":
    '<path class="h" d="M12 70H108"/>' +
    '<path class="k" d="M57 8V70M63 8V70"/>' +
    '<polygon class="k" points="63,16 96,16 104,23 96,30 63,30"/>' +
    '<path class="t" d="M68 23H90"/>' +
    '<polygon class="g" points="57,38 24,38 16,45 24,52 57,52"/>' +
    '<path class="gt" d="M30 45H52"/>',
};
