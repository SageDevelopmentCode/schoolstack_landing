#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
mobile_dir="$(cd "$script_dir/.." && pwd)"

cd "$mobile_dir"
export NODE_PATH="./node_modules:../../node_modules"

APK="android/app/build/outputs/apk/debug/app-debug.apk"
APK_STAMP="${APK}.e2e-stamp"
GRADLE_FILE="android/app/build.gradle"
EMBED_MARKER="schoolstackE2eEmbedBundle"

# Must match hashFiles inputs in .github/workflows/mobile.yml Android cache key.
compute_e2e_apk_cache_key() {
  if [[ -n "${E2E_APK_CACHE_KEY:-}" ]]; then
    printf '%s' "$E2E_APK_CACHE_KEY"
    return
  fi

  local repo_root
  repo_root="$(cd "$mobile_dir/../.." && pwd)"
  (
    cd "$repo_root"
    {
      [[ -f package-lock.json ]] && cat package-lock.json
      [[ -f apps/mobile/package.json ]] && cat apps/mobile/package.json
      [[ -f apps/mobile/app.json ]] && cat apps/mobile/app.json
      if [[ -d apps/mobile/src ]]; then
        find apps/mobile/src -type f | LC_ALL=C sort | while read -r file; do
          cat "$file"
        done
      fi
      if [[ -d apps/mobile/.maestro ]]; then
        find apps/mobile/.maestro -type f | LC_ALL=C sort | while read -r file; do
          cat "$file"
        done
      fi
      [[ -f apps/mobile/scripts/build-android-debug-ci.sh ]] && cat apps/mobile/scripts/build-android-debug-ci.sh
    } | sha256sum | awk '{print $1}'
  )
}

apk_cache_is_valid() {
  [[ -f "$APK" && -f "$APK_STAMP" ]] \
    && [[ "$(tr -d '\r\n' < "$APK_STAMP")" == "$(compute_e2e_apk_cache_key)" ]]
}

write_e2e_env_file() {
  if [[ -z "${EXPO_PUBLIC_SUPABASE_URL:-}" ]]; then
    echo "EXPO_PUBLIC_SUPABASE_URL must be set for Android E2E APK build." >&2
    exit 1
  fi
  if [[ -z "${EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY:-}" ]]; then
    echo "EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be set for Android E2E APK build." >&2
    exit 1
  fi
  if [[ -z "${EXPO_PUBLIC_SITE_URL:-}" ]]; then
    echo "EXPO_PUBLIC_SITE_URL must be set for Android E2E APK build." >&2
    exit 1
  fi

  cat > .env.local <<EOF
EXPO_PUBLIC_SUPABASE_URL=${EXPO_PUBLIC_SUPABASE_URL}
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY}
EXPO_PUBLIC_SITE_URL=${EXPO_PUBLIC_SITE_URL}
EXPO_PUBLIC_E2E=1
EOF
  export EXPO_PUBLIC_E2E=1
}

# Debug variants skip JS bundling by default (Metro expected). CI Maestro needs an
# embedded bundle, so clear debuggableVariants before assembleDebug.
patch_android_embed_bundle() {
  if [[ ! -f "$GRADLE_FILE" ]]; then
    echo "Missing $GRADLE_FILE; cannot patch embedded bundle config." >&2
    exit 1
  fi

  if grep -q "$EMBED_MARKER" "$GRADLE_FILE"; then
    return 0
  fi

  python3 - "$GRADLE_FILE" "$EMBED_MARKER" <<'PY'
import pathlib
import sys

gradle_file = pathlib.Path(sys.argv[1])
marker = sys.argv[2]
text = gradle_file.read_text()
needle = 'bundleCommand = "export:embed"'
insert = (
    f'{needle}\n\n'
    f'    debuggableVariants = [] // {marker}: embed JS in debug APK for Maestro CI'
)
if needle not in text:
    raise SystemExit(f"Could not find {needle!r} in {gradle_file}")
gradle_file.write_text(text.replace(needle, insert, 1))
PY
}

if apk_cache_is_valid; then
  echo "Using cached debug APK at $APK (stamp matches)"
  exit 0
fi

if [[ -f "$APK" ]]; then
  echo "Stale debug APK at $APK; rebuilding..."
  rm -f "$APK" "$APK_STAMP"
fi

if [[ ! -d android ]]; then
  echo "Android project missing; running expo prebuild..."
  npx expo prebuild --platform android
fi

write_e2e_env_file
patch_android_embed_bundle

echo "Building Android debug APK with embedded E2E JS bundle..."
for attempt in 1 2 3; do
  if (cd android && ./gradlew assembleDebug --no-daemon); then
    break
  fi
  if [[ "$attempt" -eq 3 ]]; then
    echo "Gradle assembleDebug failed after 3 attempts" >&2
    exit 1
  fi
  echo "Gradle build failed (attempt $attempt), retrying in 15s..."
  sleep 15
done

if [[ ! -f "$APK" ]]; then
  echo "Debug APK not found after build at $APK" >&2
  exit 1
fi

compute_e2e_apk_cache_key > "$APK_STAMP"
echo "Built debug APK with embedded E2E bundle at $APK"
