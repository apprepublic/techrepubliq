#!/usr/bin/env python3
"""
Guards the three frozen constraints from the UX plan (§0).

  1. The OBJ element — material, position, size, scroll animation.
  2. The second section below the hero — the GIF stays, container layout preserved.
  3. Styling consistency (a styling change can't be detected by hash, but the two
     fingerprinted blocks are the ones a careless edit breaks).
  4. Every link that navigates to a page carries target="_top", so the preview breaks
     out of the iframe it's shown in instead of navigating inside it.

Run:  python3 scripts/check-guardrails.py
Exit code 0 = all fingerprints match the recorded baseline.
"""

import hashlib
import re
import sys

HTML = "public/TechRepubliQ-preview_v7.html"

# Recorded 2026-09-15, after PR 1 (commit 9acc338). Update these only on purpose.
BASELINE = {
    "obj_script": "7d963ae7ecfa437bb50d06911dcd8b00",  # <script> block: three.js scene, material, loader, scroll animation
    "panel_card_rule": "e265b1948bcf3038113988436a6e76a3",  # .panel-hero-card { ... } — the GIF container
    "anim_gif": 1,
    "ring3d": 11,
}

failures = []


def read_lines():
    with open(HTML, "rb") as fh:
        return fh.read().split(b"\n")


def block_md5(lines, start_marker, end_marker):
    """md5 of the inclusive line range between the first start marker and the next end marker."""
    start = next((i for i, l in enumerate(lines) if start_marker in l), None)
    if start is None:
        return None, "start marker %r not found" % start_marker
    end = next((i for i in range(start, len(lines)) if end_marker in lines[i]), None)
    if end is None:
        return None, "end marker %r not found after line %d" % (end_marker, start + 1)
    return hashlib.md5(b"\n".join(lines[start : end + 1])).hexdigest(), "%d-%d" % (start + 1, end + 1)


def css_rule_md5(lines, selector):
    needle = (selector + " {").encode()
    start = next((i for i, l in enumerate(lines) if l.strip().startswith(needle)), None)
    if start is None:
        return None, "selector %r not found" % selector
    end = next((i for i in range(start, len(lines)) if lines[i].strip() == b"}"), None)
    if end is None:
        return None, "closing brace for %r not found" % selector
    return hashlib.md5(b"\n".join(lines[start : end + 1])).hexdigest(), "%d-%d" % (start + 1, end + 1)


def check(name, value, expected, where=""):
    ok = value == expected
    if not ok:
        failures.append("%s: got %r, expected %r (%s)" % (name, value, expected, where))
    print("  %-18s %s  %s" % (name, "OK  " if ok else "FAIL", where))
    return ok


def page_links_missing_breakout(lines):
    """Links that navigate to a page but don't break out of the preview iframe.

    Only real page navigations count. In-page anchors must NOT carry target="_top" — it
    would reload the page instead of scrolling — and mailto/tel never navigate the frame.
    """
    missing = []
    for lineno, line in enumerate(lines, 1):
        for match in re.finditer(rb'<a\s[^>]*href="([^"]+)"[^>]*>', line):
            href, tag = match.group(1), match.group(0)
            if href.startswith(b"#") or href.startswith((b"mailto:", b"tel:")):
                continue
            if b'target="_top"' not in tag:
                missing.append((lineno, href.decode("utf-8", "replace")))
    return missing


def main():
    print("Guardrail fingerprints for %s\n" % HTML)
    lines = read_lines()

    # The three.js/OBJ block is the <script> whose body references THREE.OBJLoader.
    start = next(
        (
            i
            for i, l in enumerate(lines)
            if b"<script>" in l and any(b"THREE.OBJLoader" in x for x in lines[i : i + 600])
        ),
        None,
    )
    if start is None:
        failures.append("OBJ <script> block not found")
        obj_md5, obj_where = None, "not found"
    else:
        end = next(i for i in range(start, len(lines)) if b"</script>" in lines[i])
        obj_md5 = hashlib.md5(b"\n".join(lines[start : end + 1])).hexdigest()
        obj_where = "lines %d-%d" % (start + 1, end + 1)

    panel_md5, panel_where = css_rule_md5(lines, ".panel-hero-card")

    check("obj_script", obj_md5, BASELINE["obj_script"], obj_where)
    check("panel_card_rule", panel_md5, BASELINE["panel_card_rule"], panel_where)

    anim = sum(1 for l in lines if b"anim.gif" in l)
    ring = sum(1 for l in lines if b"ring3d" in l)
    check("anim.gif count", anim, BASELINE["anim_gif"], "GIF must stay referenced exactly once")
    check("ring3d count", ring, BASELINE["ring3d"], "OBJ wiring references")

    broken = page_links_missing_breakout(lines)
    check(
        "iframe breakout",
        len(broken),
        0,
        'page links must carry target="_top"',
    )
    for lineno, href in broken:
        print("      line %d: %s" % (lineno, href))

    print()
    if failures:
        print("GUARDRAILS CHANGED:")
        for f in failures:
            print("  - " + f)
        return 1
    print("All guardrails intact.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
