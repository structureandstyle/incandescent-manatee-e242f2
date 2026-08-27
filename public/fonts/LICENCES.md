# Font licences

All four families here are licensed under the **SIL Open Font License, Version 1.1**,
which permits self-hosting, subsetting and embedding in a website. Full licence
text: <https://openfontlicense.org/>

| Family | Files | Copyright | Source |
|---|---|---|---|
| Archivo | `archivo-400/500/600.woff2` | Copyright 2020 The Archivo Project Authors, <https://github.com/Omnibus-Type/Archivo> | Instanced from the variable TTF held in the Flow to Form repo at `clients/yellow-ladder/`, then subset |
| Libre Caslon Display | `libre-caslon-display-400.woff2` | The Libre Caslon Project Authors | Google Fonts, latin subset |
| Libre Caslon Text | `libre-caslon-text-400-italic.woff2` | The Libre Caslon Project Authors | Google Fonts, latin subset |
| Spline Sans Mono | `spline-sans-mono-400/500.woff2` | The Spline Sans Mono Project Authors | Google Fonts, latin subset |

## What was done to them

The three Archivo faces were generated locally by instancing the variable font at
weight 400, 500 and 600 with width 100, then subset to Google's own `latin`
unicode-range so they match the four downloaded faces. That took them from about
30KB each to about 14KB each. The OFL permits modification and redistribution;
it requires only that the fonts are not sold on their own and that any derivative
is not passed off under a reserved name. Neither applies here.

Total payload: seven faces, roughly 119KB.
