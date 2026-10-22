#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
mobile_dir="$(cd "$script_dir/.." && pwd)"
env_file="$mobile_dir/.env.e2e.local"

FEATURE="${1:-}"
PLATFORM="${2:-ios}"

if [[ -z "$FEATURE" ]]; then
  echo "Usage: npm run mobile:visual:capture -- <feature-slug> [ios|android]" >&2
  echo "" >&2
  echo "Features:" >&2
  echo "  school-admin-dashboard" >&2
  echo "  school-admin-admissions-list" >&2
  echo "  school-admin-submission-detail" >&2
  echo "  school-admin-students" >&2
  echo "  parent-home" >&2
  echo "  parent-messages" >&2
  echo "  parent-billing" >&2
  echo "  parent-committees" >&2
  echo "  teacher-home" >&2
  echo "  teacher-messages" >&2
  echo "  parent-coop-teaching-schedule" >&2
  echo "  parent-coop-more-menu" >&2
  exit 1
fi

case "$FEATURE" in
  school-admin-dashboard) FLOW="visual/school-admin-dashboard.yaml" ;;
  school-admin-admissions-list) FLOW="visual/school-admin-admissions-list.yaml" ;;
  school-admin-submission-detail) FLOW="visual/school-admin-submission-detail.yaml" ;;
  school-admin-students) FLOW="visual/school-admin-students.yaml" ;;
  parent-home) FLOW="visual/parent-home.yaml" ;;
  parent-messages) FLOW="visual/parent-messages.yaml" ;;
  parent-billing) FLOW="visual/parent-billing.yaml" ;;
  parent-committees) FLOW="visual/parent-committees.yaml" ;;
  teacher-home) FLOW="visual/teacher-home.yaml" ;;
  teacher-messages) FLOW="visual/teacher-messages.yaml" ;;
  parent-coop-teaching-schedule) FLOW="visual/parent-coop-teaching-schedule.yaml" ;;
  parent-coop-more-menu) FLOW="visual/parent-coop-more-menu.yaml" ;;
  *)
    echo "Unknown feature slug: $FEATURE" >&2
    exit 1
    ;;
esac

if [[ ! -f "$env_file" ]]; then
  echo "Missing $env_file" >&2
  echo "Run: npm run mobile:e2e:env -- ios > apps/mobile/.env.e2e.local" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$env_file"
set +a

bash "$script_dir/assert-mobile-e2e-env.sh"

cd "$mobile_dir"
echo "Running Maestro: .maestro/$FLOW"
maestro test ".maestro/$FLOW"
bash "$script_dir/copy-maestro-screenshot.sh" "$FEATURE" "$PLATFORM"
