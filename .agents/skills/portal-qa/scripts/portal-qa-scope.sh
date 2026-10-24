#!/usr/bin/env bash
# Read-only git triage + JSON scenario scope for portal-qa skill.
# Usage: portal-qa-scope.sh [base-ref] [--uncommitted] [--cached]
# Default base-ref: origin/main

set -euo pipefail

BASE="origin/main"
INCLUDE_UNCOMMITTED=0
INCLUDE_CACHED=0

for arg in "$@"; do
  case "$arg" in
    --uncommitted) INCLUDE_UNCOMMITTED=1 ;;
    --cached) INCLUDE_CACHED=1 ;;
    --*) ;;
    *) BASE="$arg" ;;
  esac
done

HEAD_REF="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "HEAD")"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

echo "=== portal-qa-scope ===" >&2
echo "branch: $HEAD_REF" >&2
echo "base:   $BASE" >&2

cd "$REPO_ROOT"

ARGS=(--base "$BASE")
[[ "$INCLUDE_UNCOMMITTED" == 1 ]] && ARGS+=(--uncommitted)
[[ "$INCLUDE_CACHED" == 1 ]] && ARGS+=(--cached)

node "$SCRIPT_DIR/portal-qa-scope.mjs" "${ARGS[@]}"
