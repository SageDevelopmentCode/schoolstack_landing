#!/usr/bin/env bash
# Capture iOS visual screenshots for program co-op teaching schedule + More menu (curriculum/supply).
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/../../.." && pwd)"

PLATFORM="${1:-ios}"

echo "==> parent-coop-teaching-schedule"
bash "$repo_root/apps/mobile/scripts/run-visual-capture.sh" parent-coop-teaching-schedule "$PLATFORM"

echo "==> parent-coop-more-menu"
bash "$repo_root/apps/mobile/scripts/run-visual-capture.sh" parent-coop-more-menu "$PLATFORM"

echo "==> verify artifacts"
node "$repo_root/scripts/verify-parent-coop-visual-checklist.mjs" --artifacts-only
