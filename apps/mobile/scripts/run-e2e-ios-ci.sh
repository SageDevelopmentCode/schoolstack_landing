#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
mobile_dir="$(cd "$script_dir/.." && pwd)"

bash "$script_dir/assert-mobile-e2e-env.sh"

cd "$mobile_dir"
export NODE_PATH="./node_modules:../../node_modules"

APP_PATH="$(find ios/build/Build/Products/Debug-iphonesimulator -maxdepth 1 -name '*.app' 2>/dev/null | head -1 || true)"
if [[ -z "$APP_PATH" ]]; then
  echo "Built .app not found in cache; running expo prebuild and xcodebuild..."
  npx expo prebuild --platform ios

  xcodebuild \
    -workspace ios/MudKitchen.xcworkspace \
    -scheme MudKitchen \
    -configuration Debug \
    -sdk iphonesimulator \
    -derivedDataPath ios/build \
    CODE_SIGNING_ALLOWED=NO

  APP_PATH="$(find ios/build/Build/Products/Debug-iphonesimulator -maxdepth 1 -name '*.app' | head -1)"
  if [[ -z "$APP_PATH" ]]; then
    echo "Built .app not found after xcodebuild" >&2
    find ios/build -name '*.app' || true
    exit 1
  fi
else
  echo "Using cached .app at $APP_PATH"
fi

SIMULATOR_ID="$(
  xcrun simctl list devices available | grep -E 'iPhone [0-9]+' | head -1 | sed -E 's/.* \(([0-9A-F-]+)\).*/\1/'
)"
if [[ -z "$SIMULATOR_ID" ]]; then
  echo "No available iPhone simulator found" >&2
  xcrun simctl list devices available
  exit 1
fi

xcrun simctl boot "$SIMULATOR_ID" || true
open -a Simulator

xcrun simctl install booted "$APP_PATH"

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

# Skip React Native DevTools Electron install (not needed for Maestro).
# Force IPv4 so --host localhost binds 127.0.0.1, matching the wait curl.
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

echo "Warming iOS bundle..."
bundle_url="http://127.0.0.1:8081/.expo/.virtual-metro-entry.bundle?platform=ios&dev=true&minify=false"
if ! curl -sf --max-time 180 "$bundle_url" >/dev/null; then
  echo "Failed to warm iOS bundle from $bundle_url" >&2
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

if ! run_maestro; then
  echo "Maestro failed; capturing simulator log..." >&2
  xcrun simctl spawn booted log show --last 5m > /tmp/ios-simulator.log 2>&1 || true
  exit 1
fi
