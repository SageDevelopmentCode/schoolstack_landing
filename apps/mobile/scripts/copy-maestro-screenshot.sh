#!/usr/bin/env bash
# Copy the latest Maestro visual-capture*.png set into apps/mobile/.artifacts/responsive/
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
search_dirs=()
[[ -d "$MAESTRO_TESTS" ]] && search_dirs+=("$MAESTRO_TESTS")
search_dirs+=("$mobile_dir")

LATEST="$(find "${search_dirs[@]}" -name 'visual-capture.png' -type f -not -path '*/.artifacts/*' -not -path '*/node_modules/*' 2>/dev/null | xargs ls -t 2>/dev/null | head -n 1 || true)"
if [[ -z "$LATEST" ]]; then
  echo "No visual-capture.png found under ${search_dirs[*]}" >&2
  echo "Run a visual capture flow first: npm run mobile:visual:capture -- $FEATURE" >&2
  exit 1
fi

DEST_DIR="$mobile_dir/.artifacts/responsive"
mkdir -p "$DEST_DIR"
DEST="$DEST_DIR/${FEATURE}-${PLATFORM}.png"
cp "$LATEST" "$DEST"
echo "Wrote $DEST (from $LATEST)"

src_dir="$(dirname "$LATEST")"
for extra in "$src_dir"/visual-capture-*.png; do
  [[ -f "$extra" ]] || continue
  # Skip screenshots left over from an earlier run in the same directory.
  [[ "$extra" -ot "$LATEST" ]] && continue
  suffix="$(basename "$extra" .png)"
  suffix="${suffix#visual-capture-}"
  extra_dest="$DEST_DIR/${FEATURE}-${suffix}-${PLATFORM}.png"
  cp "$extra" "$extra_dest"
  echo "Wrote $extra_dest (from $extra)"
done
