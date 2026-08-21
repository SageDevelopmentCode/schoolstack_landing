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

metro_pid=""
cleanup() {
  if [[ -n "$metro_pid" ]]; then
    kill "$metro_pid" 2>/dev/null || true
  fi
}
trap cleanup EXIT

npx expo start --dev-client --port 8081 > /tmp/expo-metro.log 2>&1 &
metro_pid=$!

for i in {1..30}; do
  if curl -sf "http://127.0.0.1:8081/status" >/dev/null; then
    break
  fi
  if [[ "$i" -eq 30 ]]; then
    echo "Metro did not start in time" >&2
    cat /tmp/expo-metro.log || true
    exit 1
  fi
  sleep 2
done

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
