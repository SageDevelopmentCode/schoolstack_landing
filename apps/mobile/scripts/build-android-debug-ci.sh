#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
mobile_dir="$(cd "$script_dir/.." && pwd)"

cd "$mobile_dir"
export NODE_PATH="./node_modules:../../node_modules"

APK="android/app/build/outputs/apk/debug/app-debug.apk"

if [[ -f "$APK" ]]; then
  echo "Using cached debug APK at $APK"
  exit 0
fi

if [[ ! -d android ]]; then
  echo "Android project missing; running expo prebuild..."
  npx expo prebuild --platform android
fi

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

echo "Built debug APK at $APK"
