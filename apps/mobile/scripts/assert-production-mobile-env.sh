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

health_url="${site_url%/}/api/health"
if ! health_result="$(curl -sS -o /dev/null --max-time 15 -w '%{http_code} %{redirect_url}' "$health_url")"; then
  echo "Production mobile build aborted: could not reach $health_url." >&2
  exit 1
fi

health_status="${health_result%% *}"
health_redirect="${health_result#* }"

# Following a redirect drops the Authorization header, so every authenticated API call would 401.
if [[ "$health_status" == 3* ]]; then
  echo "Production mobile build aborted: EXPO_PUBLIC_SITE_URL redirects ($health_status) to ${health_redirect:-another URL}." >&2
  echo "Redirects strip the Authorization header. Point EXPO_PUBLIC_SITE_URL at the final host or fix the Vercel primary domain." >&2
  exit 1
fi

if [[ "$health_status" != "200" ]]; then
  echo "Production mobile build aborted: $health_url returned HTTP $health_status (expected 200)." >&2
  exit 1
fi

echo "EXPO_PUBLIC_SITE_URL looks production-safe: $site_url"
