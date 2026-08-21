#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
mobile_dir="$(cd "$script_dir/.." && pwd)"

bash "$script_dir/assert-mobile-e2e-env.sh"

cd "$mobile_dir"
export NODE_PATH="./node_modules:../../node_modules"

bash "$script_dir/build-android-debug-ci.sh"

APK="android/app/build/outputs/apk/debug/app-debug.apk"

wait_for_emulator_ready() {
  adb wait-for-device
  for i in {1..60}; do
    if [[ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" == "1" ]] \
      && adb shell pm list packages >/dev/null 2>&1; then
      return 0
    fi
    sleep 2
  done
  echo "Emulator not ready after 120s" >&2
  exit 1
}

wait_for_emulator_ready

# android-emulator-runner sets disable-animations: true; Reanimated entering
# animations and the splash fade need animator scale restored for Maestro visibility.
adb shell settings put global animator_duration_scale 1
adb shell settings put global transition_animation_scale 1
adb shell settings put global window_animation_scale 1

adb install -r "$APK"
adb reverse tcp:8081 tcp:8081
adb reverse tcp:3100 tcp:3100
adb reverse tcp:54321 tcp:54321

wait_for_emulator_ready

cat > .env.e2e.ci <<EOF
EXPO_PUBLIC_SUPABASE_URL=${EXPO_PUBLIC_SUPABASE_URL}
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY}
EXPO_PUBLIC_SITE_URL=${EXPO_PUBLIC_SITE_URL}
EXPO_PUBLIC_E2E=1
EOF
set -a
# shellcheck disable=SC1091
source .env.e2e.ci
set +a
cp .env.e2e.ci .env.local

metro_pid=""
cleanup() {
  if [[ -n "$metro_pid" ]]; then
    kill "$metro_pid" 2>/dev/null || true
  fi
}
trap cleanup EXIT

dump_metro_diagnostics() {
  echo "----- expo-metro.log -----" >&2
  cat /tmp/expo-metro.log || true
  echo "----- curl 127.0.0.1:8081/status -----" >&2
  curl -v --max-time 2 "http://127.0.0.1:8081/status" || true
  echo "----- listeners on 8081 -----" >&2
  ss -lntp 2>/dev/null | grep 8081 || lsof -nP -iTCP:8081 -sTCP:LISTEN || true
}

# Skip React Native DevTools Electron install (chrome-sandbox fails on GHA Ubuntu).
# Force IPv4 so --host localhost binds 127.0.0.1, matching adb reverse and the wait curl.
export EXPO_UNSTABLE_HEADLESS=1
export NODE_OPTIONS="${NODE_OPTIONS:+$NODE_OPTIONS }--dns-result-order=ipv4first"

npx expo start --port 8081 --host localhost > /tmp/expo-metro.log 2>&1 &
metro_pid=$!

for i in {1..60}; do
  if ! kill -0 "$metro_pid" 2>/dev/null; then
    echo "Metro process exited before becoming ready" >&2
    dump_metro_diagnostics
    exit 1
  fi
  if curl -sf --max-time 2 "http://127.0.0.1:8081/status" >/dev/null; then
    break
  fi
  if [[ "$i" -eq 60 ]]; then
    echo "Metro did not start in time" >&2
    dump_metro_diagnostics
    exit 1
  fi
  sleep 2
done

echo "Warming Android bundle..."
bundle_url="http://127.0.0.1:8081/.expo/.virtual-metro-entry.bundle?platform=android&dev=true&minify=false"
if ! curl -sf --max-time 180 "$bundle_url" >/dev/null; then
  echo "Failed to warm Android bundle from $bundle_url" >&2
  dump_metro_diagnostics
  exit 1
fi

run_maestro() {
  maestro_flows=()
  if [[ "${MAESTRO_FLOWS:-.maestro}" == ".maestro" ]]; then
    maestro test .maestro
  else
    for flow in ${MAESTRO_FLOWS}; do
      if [[ "$flow" == .maestro/* ]]; then
        maestro_flows+=("$flow")
      else
        maestro_flows+=(".maestro/$flow")
      fi
    done
    maestro test "${maestro_flows[@]}"
  fi
}

is_transient_adb_failure() {
  local log_file="$1"
  grep -qiE 'device offline|Device server died' "$log_file"
}

maestro_ok=false
for attempt in 1 2; do
  maestro_log="/tmp/maestro-run-${attempt}.log"
  if run_maestro 2>&1 | tee "$maestro_log"; then
    maestro_ok=true
    break
  fi
  if [[ "$attempt" -eq 1 ]] && is_transient_adb_failure "$maestro_log"; then
    echo "Maestro hit transient ADB failure; waiting for emulator and retrying..." >&2
    wait_for_emulator_ready
    continue
  fi
  break
done

if [[ "$maestro_ok" != true ]]; then
  echo "Maestro failed; capturing adb logcat..." >&2
  adb logcat -d > /tmp/adb-logcat.log 2>&1 || true
  exit 1
fi
