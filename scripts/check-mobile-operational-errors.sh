#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

MOBILE_SRC="$ROOT/apps/mobile/src"

UNSTABLE_DIRS=(
  "$MOBILE_SRC/components"
  "$MOBILE_SRC/contexts"
)

# Catch reporting enforced under these component trees.
# app/parent and app/teacher are thin route shells (no local catch blocks).
CATCH_DIRS=(
  "$MOBILE_SRC/components/school-admin/committees"
  "$MOBILE_SRC/components/school-admin/friday-branch"
  "$MOBILE_SRC/components/parent/committees"
  "$MOBILE_SRC/components/parent"
  "$MOBILE_SRC/components/teacher"
)

failures=0

should_skip_file() {
  local file="$1"
  if [[ "$file" == *".test.ts" ]] || [[ "$file" == *".test.tsx" ]]; then
    return 0
  fi
  return 1
}

check_catch_reporting() {
  local file="$1"

  if should_skip_file "$file"; then
    return
  fi

  if ! grep -qE 'catch[[:space:]]*(\(|\{|[a-zA-Z_])' "$file"; then
    return
  fi

  if ! grep -qE '} catch|\.catch\(' "$file"; then
    return
  fi

  if grep -qE 'reportError\(|reportMobileGlobalOperationalError|reportMobileOperationalError' "$file"; then
    return
  fi

  if grep -qE 'intentionally silent|non-blocking|mark-read silently' "$file"; then
    return
  fi

  echo "Missing mobile operational error reporting: $file"
  failures=$((failures + 1))
}

check_unstable_reporter() {
  local file="$1"

  if should_skip_file "$file"; then
    return
  fi

  if grep -qE 'const reportError = create(SchoolAdmin|Parent|Teacher)PortalErrorReporter|const reportError = createMobileErrorReporter' "$file"; then
    echo "Unstable inline mobile error reporter (use useMobileErrorReporter): $file"
    failures=$((failures + 1))
  fi
}

# Callback-style failures (WebView onError, external opens) never hit a `catch`, so they were
# invisible to Discord. Enforce them across all components.
check_webview_reporting() {
  local file="$1"

  if should_skip_file "$file"; then
    return
  fi

  if ! grep -qE '<WebView([[:space:]>]|$)' "$file"; then
    return
  fi

  if grep -qE 'onError=' "$file" && grep -qE 'reportError\(|reportViewerFailure\(|reportMobileOperationalError' "$file"; then
    return
  fi

  echo "WebView without onError + operational error reporting: $file"
  failures=$((failures + 1))
}

check_bare_external_open() {
  local file="$1"

  if should_skip_file "$file"; then
    return
  fi

  if grep -qE '(^|[^A-Za-z_.])(openBrowserAsync|Linking\.openURL|WebBrowser\.openBrowserAsync)\(' "$file"; then
    echo "Bare openBrowserAsync/Linking.openURL (use openExternalUrlSafely from @/lib/open-external-url): $file"
    failures=$((failures + 1))
  fi
}

for dir in "${UNSTABLE_DIRS[@]}"; do
  while IFS= read -r file; do
    check_unstable_reporter "$file"
    check_webview_reporting "$file"
    check_bare_external_open "$file"
  done < <(find "$dir" \( -name '*.tsx' -o -name '*.ts' \))
done

for dir in "${CATCH_DIRS[@]}"; do
  while IFS= read -r file; do
    check_catch_reporting "$file"
  done < <(find "$dir" \( -name '*.tsx' -o -name '*.ts' \))
done

if [[ "$failures" -gt 0 ]]; then
  echo ""
  echo "$failures mobile operational error issue(s) found."
  exit 1
fi

echo "Mobile operational error reporting check passed."
