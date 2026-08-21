#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
mobile_dir="$(cd "$script_dir/.." && pwd)"

bash "$script_dir/assert-mobile-e2e-env.sh"

cd "$mobile_dir"

npx expo prebuild --platform android --non-interactive
cd android
./gradlew assembleDebug --no-daemon
cd ..

adb wait-for-device
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
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

npx expo start --dev-client --port 8081 --non-interactive > /tmp/expo-metro.log 2>&1 &
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

maestro test .maestro
