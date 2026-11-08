#!/usr/bin/env bash
# Run the dev sheet gallery Maestro flow and compare screenshots against baselines.
# Needs the app running on a simulator/emulator in dev or E2E mode; no backend required.
#
# Usage: npm run mobile:visual:gallery -- [ios|android] [--update] [--strict]
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
mobile_dir="$(cd "$script_dir/.." && pwd)"

PLATFORM="${1:-ios}"
shift || true

cd "$mobile_dir"
echo "Running Maestro: .maestro/sheet-gallery.yaml"
maestro test .maestro/sheet-gallery.yaml
node "$script_dir/compare-sheet-gallery.mjs" --platform "$PLATFORM" "$@"
