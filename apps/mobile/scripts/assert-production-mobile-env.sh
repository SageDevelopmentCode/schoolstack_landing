#!/usr/bin/env bash
set -euo pipefail

site_url="${EXPO_PUBLIC_SITE_URL:-}"

if [[ -z "$site_url" ]]; then
  echo "Production mobile build aborted: EXPO_PUBLIC_SITE_URL is not set." >&2
  exit 1
fi

if echo "$site_url" | grep -qiE 'localhost|127\.0\.0\.1|192\.168\.|:3000|:3100'; then
  echo "Production mobile build aborted: EXPO_PUBLIC_SITE_URL must not point at a local dev server ($site_url)." >&2
  echo "Use https://trymudkitchen.com or run eas build --profile production (sets production URL)." >&2
  exit 1
fi

echo "EXPO_PUBLIC_SITE_URL looks production-safe: $site_url"
