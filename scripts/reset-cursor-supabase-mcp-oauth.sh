#!/usr/bin/env bash
# Reset Cursor OAuth state for the schoolstack_landing Supabase MCP server.
# Run this with Cursor fully quit (Cmd+Q), then reopen and click Authenticate.
set -euo pipefail

STATE_DB="$HOME/Library/Application Support/Cursor/User/globalStorage/state.vscdb"

if pgrep -xq "Cursor"; then
  echo "Quit Cursor first (Cmd+Q), then run this script again."
  exit 1
fi

if [[ ! -f "$STATE_DB" ]]; then
  echo "Cursor state database not found at:"
  echo "  $STATE_DB"
  exit 1
fi

echo "Clearing Supabase MCP OAuth keys from Cursor state..."

sqlite3 "$STATE_DB" <<'SQL'
DELETE FROM ItemTable
WHERE key LIKE '%schoolstack_landing-supabase%'
   OR key LIKE '%c2Nob29sc3RhY2s%'
   OR key LIKE '%rxrmlfyoqzdpjxztluyd%'
   OR key LIKE '%aHR0cHM6Ly9tY3Auc3VwYWJhc2UuY29tL21jcD9wcm9qZWN0X3JlZj1yeHJtbGZ5b3F6ZHBqeHp0bHV5ZC%';
SQL

rm -rf "$HOME/Library/Application Support/Cursor/User/globalStorage/mcp-oauth-attempts"/*
rm -rf "$HOME/Library/Application Support/Cursor/User/globalStorage/anysphere.cursor-mcp/mcp-oauth-attempts"/*

echo "Done."
echo ""
echo "Next steps:"
echo "  1. Open Cursor and this workspace"
echo "  2. Cmd+Shift+P → MCP: Clear All MCP Tokens (optional extra reset)"
echo "  3. Settings → MCP → supabase → Authenticate (not Logout)"
echo "  4. Complete Supabase login in Safari/Chrome if the browser does not open"
