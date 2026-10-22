#!/usr/bin/env bash
# Copy the latest Maestro visual-capture.png into apps/mobile/.artifacts/responsive/
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
mobile_dir="$(cd "$script_dir/.." && pwd)"
repo_root="$(cd "$mobile_dir/../.." && pwd)"

FEATURE="${1:-}"
PLATFORM="${2:-ios}"

if [[ -z "$FEATURE" ]]; then
  echo "Usage: $0 <feature-slug> [ios|android]" >&2
  exit 1
fi

MAESTRO_TESTS="${MAESTRO_TESTS_DIR:-$HOME/.maestro/tests}"
if [[ ! -d "$MAESTRO_TESTS" ]]; then
  echo "Maestro tests directory not found: $MAESTRO_TESTS" >&2
  echo "Run a visual capture flow first: npm run mobile:visual:capture -- $FEATURE" >&2
  exit 1
fi

LATEST="$(find "$MAESTRO_TESTS" -name 'visual-capture.png' -type f 2>/dev/null | xargs ls -t 2>/dev/null | head -n 1 || true)"
if [[ -z "$LATEST" ]]; then
  echo "No visual-capture.png found under $MAESTRO_TESTS" >&2
  exit 1
fi

DEST_DIR="$mobile_dir/.artifacts/responsive"
mkdir -p "$DEST_DIR"
DEST="$DEST_DIR/${FEATURE}-${PLATFORM}.png"
cp "$LATEST" "$DEST"
echo "Wrote $DEST (from $LATEST)"
