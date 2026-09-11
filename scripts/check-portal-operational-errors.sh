#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PATTERN_DIRS=(
  "src/components/school-parent"
  "src/components/school-teacher"
  "src/components/school-admin"
  "src/components/classroom-signups"
  "src/components/messages/MessagesInboxLayout.tsx"
)

EXCLUDE_FILES=(
  "SchoolAdminLoginForm.tsx"
  "SchoolTeacherLoginForm.tsx"
  "ParentHomePage.tsx"
)

failures=0

should_skip_file() {
  local file="$1"
  local excluded
  for excluded in "${EXCLUDE_FILES[@]}"; do
    if [[ "$file" == *"$excluded" ]]; then
      return 0
    fi
  done
  return 1
}

check_file() {
  local file="$1"

  if should_skip_file "$file"; then
    return
  fi

  if ! grep -qE 'catch[[:space:]]*(\(|[a-zA-Z_][a-zA-Z0-9_]*)' "$file"; then
    return
  fi

  if ! grep -qE '} catch|\.catch\(' "$file"; then
    return
  fi

  if grep -q 'reportPortalOperationalError\|reportClientOperationalError\|reportPublicApplyOperationalError\|reportEnrollmentChecklistError' "$file"; then
    return
  fi

  if grep -q 'Signup attention is non-blocking\|intentionally silent\|mark-read silently' "$file"; then
    return
  fi

  echo "Missing operational error reporting: $file"
  failures=$((failures + 1))
}

for dir in "${PATTERN_DIRS[@]}"; do
  if [[ -f "$dir" ]]; then
    check_file "$dir"
  else
    while IFS= read -r file; do
      check_file "$file"
    done < <(find "$dir" \( -name '*.tsx' -o -name '*.ts' \))
  fi
done

if [[ "$failures" -gt 0 ]]; then
  echo ""
  echo "$failures file(s) with catch blocks lack operational error reporting."
  exit 1
fi

echo "Portal operational error reporting check passed."
