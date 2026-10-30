#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MOBILE_SRC="$ROOT/apps/mobile/src"
STORY_SHEET="$MOBILE_SRC/components/story/story-bottom-sheet.tsx"

failures=0

fail() {
  echo "error: $1" >&2
  failures=$((failures + 1))
}

if rg -q 'keyboardVerticalOffset=\{0\}' "$MOBILE_SRC" 2>/dev/null; then
  fail "keyboardVerticalOffset={0} under apps/mobile/src"
  rg 'keyboardVerticalOffset=\{0\}' "$MOBILE_SRC" || true
fi

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  [[ "$file" == *".test."* ]] && continue
  [[ "$file" == *"bottom-sheet-shell.tsx" ]] && continue
  if rg -q 'useKeyboardHeight|MessageThreadKeyboardLayout|ParentKeyboardAwareScrollView|keyboardVerticalOffset=\{insets\.top\}|keyboard: verified on device' "$file"; then
    continue
  fi
  fail "KeyboardAvoidingView without approved keyboard handling: ${file#$ROOT/}"
done < <(rg -l 'KeyboardAvoidingView' "$MOBILE_SRC" 2>/dev/null || true)

story_sheet_hardened=false
if [[ -f "$STORY_SHEET" ]] && rg -q 'useKeyboardHeight' "$STORY_SHEET"; then
  story_sheet_hardened=true
fi

if [[ "$story_sheet_hardened" != true ]]; then
  while IFS= read -r file; do
    [[ -z "$file" ]] && continue
    [[ "$file" == *".test."* ]] && continue
    [[ "$file" == *"story-bottom-sheet.tsx" ]] && continue
    rg -q 'TextInput' "$file" || continue
    rg -q 'ParentBottomSheet|keyboard: verified on device' "$file" && continue
    fail "StoryBottomSheet with TextInput (harden StoryBottomSheet or use ParentBottomSheet): ${file#$ROOT/}"
  done < <(rg -l 'StoryBottomSheet' "$MOBILE_SRC" 2>/dev/null || true)
fi

if [[ "$failures" -gt 0 ]]; then
  echo "check-mobile-keyboard-patterns: $failures error(s)" >&2
  exit 1
fi

echo "check-mobile-keyboard-patterns: ok"
exit 0
