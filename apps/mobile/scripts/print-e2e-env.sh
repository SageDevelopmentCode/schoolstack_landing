#!/usr/bin/env bash
set -euo pipefail

platform="${1:-ios}"

if [[ "$platform" == "android" ]]; then
  host="10.0.2.2"
elif [[ "$platform" == "ios" ]]; then
  host="127.0.0.1"
else
  echo "Usage: $0 [ios|android]" >&2
  exit 1
fi

if ! command -v supabase >/dev/null 2>&1; then
  echo "supabase CLI is required. Install from https://supabase.com/docs/guides/cli" >&2
  exit 1
fi

publishable_key="$(
  supabase status --output json 2>/dev/null | jq -r '.PUBLISHABLE_KEY // .ANON_KEY // empty'
)"

if [[ -z "$publishable_key" ]]; then
  echo "Could not read Supabase keys. Run: supabase start && supabase db reset" >&2
  exit 1
fi

cat <<EOF
# Paste into apps/mobile/.env.e2e.local (${platform} simulator/emulator)
EXPO_PUBLIC_SUPABASE_URL=http://${host}:54321
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${publishable_key}
EXPO_PUBLIC_SITE_URL=http://${host}:3100
E2E_ADMIN_EMAIL=e2e-admin@schoolstack.test
E2E_TEST_PASSWORD=E2eTestPassword123!
EOF
