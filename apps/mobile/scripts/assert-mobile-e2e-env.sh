#!/usr/bin/env bash
set -euo pipefail

BLOCKED_SUPABASE_HOSTS=("rxrmlfyoqzdpjxztluyd")
BLOCKED_SITE_HOSTS=("trymudkitchen.com" "schoolstack.com")

supabase_url="${EXPO_PUBLIC_SUPABASE_URL:-}"
site_url="${EXPO_PUBLIC_SITE_URL:-}"

if [[ -z "$supabase_url" ]]; then
  echo "Mobile E2E aborted: EXPO_PUBLIC_SUPABASE_URL is not set." >&2
  echo "Use apps/mobile/.env.e2e.local — never apps/mobile/.env (remote/prod Supabase)." >&2
  exit 1
fi

if [[ -z "$site_url" ]]; then
  echo "Mobile E2E aborted: EXPO_PUBLIC_SITE_URL is not set." >&2
  exit 1
fi

for blocked in "${BLOCKED_SUPABASE_HOSTS[@]}"; do
  if [[ "$supabase_url" == *"$blocked"* ]]; then
    echo "Mobile E2E aborted: refusing blocked Supabase host ($supabase_url)." >&2
    exit 1
  fi
done

if [[ "$supabase_url" != *"127.0.0.1"* && "$supabase_url" != *"localhost"* && "$supabase_url" != *"10.0.2.2"* ]]; then
  echo "Mobile E2E aborted: EXPO_PUBLIC_SUPABASE_URL must point at local Supabase." >&2
  echo "Use http://127.0.0.1:54321 (iOS) or http://10.0.2.2:54321 (Android)." >&2
  exit 1
fi

for blocked in "${BLOCKED_SITE_HOSTS[@]}"; do
  if [[ "$site_url" == *"$blocked"* ]]; then
    echo "Mobile E2E aborted: EXPO_PUBLIC_SITE_URL must not point at production ($site_url)." >&2
    echo "Use http://127.0.0.1:3100 (iOS) or http://10.0.2.2:3100 (Android)." >&2
    exit 1
  fi
done

if [[ "$site_url" != *":3100"* ]]; then
  echo "Mobile E2E aborted: EXPO_PUBLIC_SITE_URL should use port 3100 for E2E ($site_url)." >&2
  exit 1
fi
