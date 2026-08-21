#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
mobile_dir="$(cd "$script_dir/.." && pwd)"
env_file="$mobile_dir/.env.e2e.local"

if [[ ! -f "$env_file" ]]; then
  echo "Missing $env_file" >&2
  echo "Create it from the iOS block in apps/mobile/.env.e2e.example" >&2
  echo "Or run: npm run mobile:e2e:env -- ios > apps/mobile/.env.e2e.local" >&2
  exit 1
fi

if ! curl -sf "http://127.0.0.1:54321/rest/v1/" >/dev/null 2>&1; then
  echo "Warning: local Supabase does not appear to be running on :54321" >&2
  echo "Run: supabase start && supabase db reset && npm run seed:e2e" >&2
fi

if ! curl -sf "http://127.0.0.1:3100" >/dev/null 2>&1; then
  echo "Warning: Next.js does not appear to be running on :3100" >&2
  echo "Run: npm run dev:next -- -p 3100" >&2
fi

if ! curl -sf "http://127.0.0.1:8081/status" >/dev/null 2>&1; then
  echo "Warning: Metro does not appear to be running on :8081" >&2
  echo "Run: cd apps/mobile && set -a && source .env.e2e.local && set +a && npm run ios" >&2
fi

set -a
# shellcheck disable=SC1090
source "$env_file"
set +a

bash "$script_dir/assert-mobile-e2e-env.sh"

cd "$mobile_dir"
maestro test .maestro
