#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
mobile_dir="$(cd "$script_dir/.." && pwd)"

bash "$script_dir/assert-mobile-e2e-env.sh"

cd "$mobile_dir"

APK="android/app/build/outputs/apk/debug/app-debug.apk"
if [[ ! -f "$APK" ]]; then
  echo "Debug APK not found; running expo prebuild and Gradle assembleDebug..."
  npx expo prebuild --platform android
  (cd android && ./gradlew assembleDebug --no-daemon)
else
  echo "Using cached debug APK at $APK"
fi

adb wait-for-device
adb install -r "$APK"
adb reverse tcp:8081 tcp:8081
adb reverse tcp:3100 tcp:3100
adb reverse tcp:54321 tcp:54321

metro_pid=""
cleanup() {
  if [[ -n "$metro_pid" ]]; then
    kill "$metro_pid" 2>/dev/null || true
  fi
}
trap cleanup EXIT

npx expo start --dev-client --port 8081 > /tmp/expo-metro.log 2>&1 &
metro_pid=$!

for i in {1..60}; do
  if curl -sf "http://127.0.0.1:8081/status" >/dev/null; then
    break
  fi
  if [[ "$i" -eq 60 ]]; then
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
