#!/usr/bin/env bash
set -euo pipefail

# Ensures EAS production environment has EXPO_PUBLIC_* vars required to inline
# into both store builds (build.production.environment) and OTA (eas update --environment production).

required=(
  EXPO_PUBLIC_SITE_URL
  EXPO_PUBLIC_SUPABASE_URL
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
)

if ! command -v eas >/dev/null 2>&1; then
  echo "Production OTA aborted: eas CLI is not installed (npm i -g eas-cli)." >&2
  exit 1
fi

if ! list_output="$(eas env:list production --format long 2>&1)"; then
  echo "Production OTA aborted: could not list EAS production environment." >&2
  echo "$list_output" >&2
  exit 1
fi

check_var() {
  local name="$1"
  local block

  block="$(printf '%s\n' "$list_output" | awk -v n="$name" '
    /^Name / && $2 == n { capture=1 }
    capture { print }
    capture && /^———/ { exit }
  ')"

  if [[ -z "$block" ]]; then
    echo "Production OTA aborted: missing $name on EAS production environment." >&2
    echo "Create it with: eas env:create production --name $name --value \"...\" --visibility plaintext|sensitive" >&2
    echo "See apps/mobile/DEPLOY.md § One-time setup." >&2
    exit 1
  fi

  if printf '%s\n' "$block" | grep -q '^Visibility    SECRET'; then
    echo "Production OTA aborted: $name uses SECRET visibility and cannot be inlined into OTA JS bundles." >&2
    echo "Recreate with --visibility plaintext or sensitive." >&2
    exit 1
  fi

  local value_line
  value_line="$(printf '%s\n' "$block" | awk '/^Value / { print; exit }')"
  if [[ -z "$value_line" ]]; then
    echo "Production OTA aborted: $name has no value on EAS production environment." >&2
    exit 1
  fi

  local value="${value_line#Value         }"
  if [[ "$value" == "(empty)" ]] || [[ -z "$value" ]]; then
    echo "Production OTA aborted: $name is empty on EAS production environment." >&2
    exit 1
  fi
}

for name in "${required[@]}"; do
  check_var "$name"
done

echo "EAS production environment has required EXPO_PUBLIC_* variables for build and OTA."
