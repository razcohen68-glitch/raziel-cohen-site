#!/usr/bin/env python3
"""Add or refresh a content-hash version on assets/styles.css and assets/script.js
in every HTML page, e.g. assets/styles.css?v=1a2b3c4d.

Run after any change to satya-site/assets/styles.css or script.js:
    python3 tools/bump-assets.py
Idempotent: unchanged files keep their version. Use --check to fail (exit 1)
when any page has a missing or stale version (for CI or a pre-merge check).
"""
import hashlib, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent / "satya-site"
ASSETS = ("styles.css", "script.js")
PAT = re.compile(r'((?:href|src)=")((?:\.\./|/)?assets/(styles\.css|script\.js))(?:\?v=[0-9a-f]+)?(")')

def version(name):
    return hashlib.sha256((ROOT / "assets" / name).read_bytes()).hexdigest()[:8]

def main(check):
    versions = {n: version(n) for n in ASSETS}
    stale = 0
    for page in sorted(list(ROOT.glob("*.html")) + list(ROOT.glob("insights/*.html"))):
        text = page.read_text(encoding="utf-8")
        new = PAT.sub(lambda m: f'{m.group(1)}{m.group(2)}?v={versions[m.group(3)]}{m.group(4)}', text)
        if new != text:
            stale += 1
            if not check:
                page.write_text(new, encoding="utf-8", newline="")
    print(f"versions: {versions}; pages {'stale' if check else 'updated'}: {stale}")
    return 1 if (check and stale) else 0

if __name__ == "__main__":
    sys.exit(main("--check" in sys.argv))
