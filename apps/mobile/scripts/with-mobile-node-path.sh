#!/usr/bin/env bash
set -euo pipefail

# npm workspaces hoist some Expo packages to the repo root while `expo` stays under
# apps/mobile/node_modules. Expo config plugins require `expo/config-plugins`, so EAS/Expo
# CLI commands need the same NODE_PATH as Metro (see package.json start/test scripts).

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$MOBILE_ROOT/../.." && pwd)"

export NODE_PATH="$MOBILE_ROOT/node_modules:$REPO_ROOT/node_modules"

exec "$@"
