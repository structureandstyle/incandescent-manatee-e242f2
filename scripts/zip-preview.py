#!/usr/bin/env python3
"""
Zip dist/ for a Cloudflare direct upload, with entry names the ZIP spec
actually defines.

WHY THIS FILE EXISTS. On 6 September 2026 the client preview went up looking
like a 1994 text document: the homepage rendered, and every stylesheet, font,
photograph and inner page 404ed. The build was fine and the upload succeeded.
The zip was wrong.

PowerShell 5.1's `Compress-Archive -Path dist\\*` writes entry names with
BACKSLASHES: `_astro\\Kicker.VBz3TxJ8.css`, `about\\index.html`. Section
4.4.17.1 of the ZIP appnote says the separator is a forward slash, so a strict
reader does not see a directory called `_astro` containing a stylesheet. It
sees one root-level file whose name happens to contain a backslash. Windows
Explorer opens such a zip perfectly, which is what makes it dangerous: it looks
correct on the machine that made it and fails on the host that serves it.

Only the files with no separator at all survived, which is exactly and only the
site root: index.html, favicon.svg, robots.txt. Hence a homepage with no CSS
and no working links.

The same command run against the directory rather than the wildcard took a
different code path in the same cmdlet and produced correct forward slashes on
5 September, which is why the first preview worked and the second did not. So
this is not a rule anybody can remember. It is a script.

    npm run zip:preview

It writes forward slashes, no `./` prefix, and then REREADS ITS OWN OUTPUT and
refuses to leave a bad file behind. The verification is the point: the failure
is invisible on this machine, so the check has to happen here rather than in a
browser after a client has already opened it.

The reread goes at the raw central directory rather than at zipfile.namelist(),
because Python normalises the very byte this is looking for. See stored_names.
"""
import os
import sys
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")

out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "ss-preview.zip")

if not os.path.isdir(DIST):
    sys.exit("dist/ does not exist. Run `npm run build:preview` first.")

index = os.path.join(DIST, "index.html")
if not os.path.isfile(index):
    sys.exit("dist/index.html is missing: that is not a built site.")

# A preview build carries the noindex header file. Without it this is a
# production build being sent to a public URL, which is the one mistake that
# cannot be taken back out of Google cleanly.
if not os.path.isfile(os.path.join(DIST, "_headers")):
    sys.exit("dist/_headers is missing: this is not a preview build. Run `npm run build:preview`.")

if os.path.exists(out):
    os.remove(out)

count = 0
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as z:
    for dirpath, dirnames, filenames in os.walk(DIST):
        dirnames.sort()
        for name in sorted(filenames):
            full = os.path.join(dirpath, name)
            # Explicit arcname, relative to dist/, forward slashes, no leading
            # "./": what the spec says and what every static host expects.
            arc = os.path.relpath(full, DIST).replace(os.sep, "/")
            z.write(full, arc)
            count += 1

def stored_names(path):
    """The entry names as they are actually on disk.

    NOT zipfile.namelist(). Python rewrites a backslash to a forward slash on
    the way in as well as on the way out, so namelist() reports a malformed
    archive as though it were fine: reading the broken 6 September zip with
    zipfile showed `_astro/Kicker...css` while .NET, which does not normalise,
    showed `_astro\\Kicker...css`. A check that cannot see the fault is worse
    than no check, because it reads as reassurance. So this walks the central
    directory and takes the bytes.
    """
    with open(path, "rb") as fh:
        blob = fh.read()

    end = blob.rfind(b"PK\x05\x06")
    if end < 0:
        raise RuntimeError("no end-of-central-directory record: not a zip")
    count = int.from_bytes(blob[end + 10 : end + 12], "little")
    start = int.from_bytes(blob[end + 16 : end + 20], "little")

    names, at = [], start
    for _ in range(count):
        if blob[at : at + 4] != b"PK\x01\x02":
            raise RuntimeError("central directory is malformed at byte %d" % at)
        n_len = int.from_bytes(blob[at + 28 : at + 30], "little")
        x_len = int.from_bytes(blob[at + 30 : at + 32], "little")
        c_len = int.from_bytes(blob[at + 32 : at + 34], "little")
        raw = blob[at + 46 : at + 46 + n_len]
        names.append(raw.decode("utf-8", "replace"))
        at += 46 + n_len + x_len + c_len
    return names

# Reread it, from the bytes. A zip that passes here is one a strict unzip will
# read the same way this machine does.
names = stored_names(out)
bad = [n for n in names if "\\" in n or n.startswith("./") or n.startswith("/")]

if bad:
    os.remove(out)
    sys.exit(
        "Refusing to leave a broken zip on disk. %d bad entry name(s), e.g. %r"
        % (len(bad), bad[:3])
    )

for required in ("index.html", "_headers"):
    if required not in names:
        os.remove(out)
        sys.exit("%s is not at the root of the zip." % required)

if not any(n.startswith("_astro/") for n in names):
    os.remove(out)
    sys.exit("No _astro/ entries: the stylesheets would 404, which is the exact fault this script exists to stop.")

size = os.path.getsize(out) / (1024 * 1024)
print("")
print("  %s" % out)
print("  %d files, %.2f MB, every entry name spec-clean." % (count, size))
print("")
print("  Upload it to Cloudflare as a NEW deployment of the existing ss-preview project.")
print("  Then check an inner page, not just the homepage: /work/ and /process/.")
print("")
