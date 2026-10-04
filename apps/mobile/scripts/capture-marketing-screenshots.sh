#!/usr/bin/env bash
# Capture Mud School mobile screens for marketing slide 8 (tuition carousel).
# Fictional Mitchell family — not real school data. See persona SQL + README.
#
# Prereqs: iOS Simulator booted, Expo on screen, mud-school + Mitchell persona seeded.
#
# Usage:
#   1. Paste seed_mud_school_marketing_persona_2026_10_04.sql (after test parent seed)
#   2. Configure tuition/transactions per public/images/marketing/mobile-promo/README.md
#   3. Point mobile app at your Supabase; sign in testparent@gmail.com → Mud School
#   4. Navigate to each screen, then:
#
#   apps/mobile/scripts/capture-marketing-screenshots.sh parent-home
#
# Output: public/images/marketing/mobile-promo/<name>.png

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
OUT_DIR="$ROOT/public/images/marketing/mobile-promo"
mkdir -p "$OUT_DIR"

SLOT="${1:-}"
if [[ -z "$SLOT" ]]; then
  echo "Usage: $0 <parent-home|parent-billing|admin-transactions>"
  echo ""
  echo "Org: mud-school (Mud School). Parent: testparent@gmail.com"
  echo "Persona SQL: supabase/migrations_manual/seed_mud_school_marketing_persona_2026_10_04.sql"
  echo ""
  echo "Screens:"
  echo "  parent-home          Parent tab → Home"
  echo "  parent-billing       Parent tab → Billing / tuition"
  echo "  admin-transactions   School admin → More → Transactions"
  exit 1
fi

case "$SLOT" in
  parent-home) FILE="parent-home.png" ;;
  parent-billing) FILE="parent-billing.png" ;;
  admin-transactions) FILE="admin-transactions.png" ;;
  *)
    echo "Unknown slot: $SLOT"
    exit 1
    ;;
esac

DEST="$OUT_DIR/$FILE"
xcrun simctl io booted screenshot "$DEST"
echo "Wrote $DEST"
echo "Crop to app content (below status bar) if the capture includes simulator chrome."
