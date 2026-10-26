#!/usr/bin/env bash
# Vendors the frozen CMS schema (cms/SCHEMA_CONTRACT.md, owner: CMS Engineer) into the web app.
# Source of truth stays in ../cms. Do NOT edit web/sanity/{schemaTypes,structure.ts,presentation.ts,seed/} or lib/sanity/fixtures/dataset.json by hand.
# Usage: pnpm sync:cms   (from web/). Vercel builds only web/, so the copy is committed.
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
cms="${CMS_DIR:-$here/../cms}"
[ -f "$cms/SCHEMA_CONTRACT.md" ] || { echo "cms dir not found at $cms" >&2; exit 1; }
rm -rf "$here/sanity/schemaTypes"
cp -R "$cms/schemaTypes" "$here/sanity/schemaTypes"
cp "$cms/structure.ts" "$here/sanity/structure.ts"
cp "$cms/presentation.ts" "$here/sanity/presentation.ts"
# Seed (fixture mode + `sanity dataset import`): ndjson + the image files it references.
rm -rf "$here/sanity/seed/assets" && mkdir -p "$here/sanity/seed/assets"
cp "$cms/seed/seed.ndjson" "$here/sanity/seed/seed.ndjson"
grep -o 'image@file://[^"]*' "$cms/seed/seed.ndjson" | sed 's#.*/##' | sort -u | while read -r f; do cp "$cms/assets/$f" "$here/sanity/seed/assets/$f"; done
node "$here/scripts/build-sanity-fixture.mjs"
ver="$(grep -m1 -o 'v[0-9]\+\.[0-9]\+' "$cms/SCHEMA_CONTRACT.md" || echo unknown)"
printf '%s\n' "Vendored from cms/ (SCHEMA_CONTRACT $ver) on $(date -u +%Y-%m-%dT%H:%MZ) by scripts/sync-cms-schema.sh. Edit in cms/, then re-sync." > "$here/sanity/VENDORED.txt"
echo "synced cms schema $ver"
