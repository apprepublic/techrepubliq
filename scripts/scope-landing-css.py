#!/usr/bin/env python3
"""Regenerate src/app/landing.css from the v7 preview document.

    python3 scripts/scope-landing-css.py > src/app/landing.css

The homepage markup and stylesheet are ported out of the standalone design file
(ASSET/TechRepubliQ-preview_v7.html). That file styles the
document itself (html/body/*/headings, :root variables, element selectors like
`section`, `a`, `button`). App Router treats any imported CSS as global, so
importing it verbatim would restyle the Nav, the Footer and every other route.

This script rewrites every selector to sit under the `.v7` root class the page
component renders, maps `:root` -> `.v7` so the variables stay page-local, and
substitutes the 1.27 MB inline base64 hero backdrop with the byte-identical PNG
it was produced from (public/assets/hero-sunburst.png), so the asset renders from
a normal request instead of a data URI in the bundle.

Run this after changing the landing document, then re-check the diff: the
declarations themselves are copied through untouched, so anything unexpected in
the output means the source file changed shape.
"""
import re
import sys

HERO_DATA_URI = re.compile(r"url\('data:image/png;base64,[A-Za-z0-9+/=]+'\)")
HERO_ASSET = "url('/assets/hero-sunburst.png')"
SOURCE = "ASSET/TechRepubliQ-preview_v7.html"


def read_style_block(path):
    lines = open(path, encoding="utf8").read().split("\n")
    try:
        start = next(i for i, l in enumerate(lines) if l.strip() == "<style>") + 1
        end = next(i for i, l in enumerate(lines) if l.strip() == "</style>")
    except StopIteration:
        sys.exit(f"{path}: could not find the <style> block")
    return "\n".join(lines[start:end])


def parse(text, out):
    """Emit scoped rule strings from a flat CSS text into `out`."""
    i, n = 0, len(text)
    while i < n:
        j = text.find("{", i)
        if j == -1:
            break
        prelude = text[i:j].strip()
        depth, k = 1, j + 1
        while k < n and depth:
            if text[k] == "{":
                depth += 1
            elif text[k] == "}":
                depth -= 1
            k += 1
        body = text[j + 1:k - 1]

        if prelude.startswith("@media") or prelude.startswith("@supports"):
            # recurse so nested rules get scoped too
            inner = []
            parse(body, inner)
            out.append(prelude + " {\n" + "\n".join(inner) + "\n}")
        elif prelude.startswith("@"):
            # @keyframes and friends are document-global: never prefix them
            out.append(prelude + " {" + body + "}")
        elif prelude == "html":
            pass  # globals.css already sets scroll-behavior
        elif prelude in ("body", ":root"):
            # the document defaults and palette belong on the page root element
            out.append(".v7 {" + body + "}")
        elif prelude == "*":
            out.append(".v7, .v7 *" + " {" + body + "}")
        else:
            grouped = ", ".join(".v7 " + s.strip() for s in prelude.split(",") if s.strip())
            out.append(grouped + " {" + body + "}")
        i = k
    return out


def main():
    css = read_style_block(SOURCE)
    if "data:image/png;base64," in css:
        css = HERO_DATA_URI.sub(HERO_ASSET, css)
    if "data:image/png;base64," in css:
        sys.exit("unexpected: a base64 payload survived the substitution")
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)

    rules = parse(css, [])
    themes = open("scripts/landing-themes.css", encoding="utf8").read().rstrip()
    header = (
        "/* GENERATED FILE - do not edit by hand.\n"
        "   Regenerate with: python3 scripts/scope-landing-css.py > src/app/landing.css\n"
        f"   Source: {SOURCE} <style> block, selectors scoped under .v7\n"
        "   Declarations are copied through verbatim; see the script for why. */\n"
    )
    sys.stdout.write(
        header
        + "\n"
        + "\n\n".join(r.strip() for r in rules if r.strip())
        + "\n\n"
        + themes
        + "\n"
    )


if __name__ == "__main__":
    main()
