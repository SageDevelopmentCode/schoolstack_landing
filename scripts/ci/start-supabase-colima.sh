#!/usr/bin/env bash
# Bootstrap Colima + local Supabase for macOS GitHub Actions (mobile-e2e-ios).
# Uses virtiofs (not sshfs), symlinks docker.sock for Supabase CLI 2.110+, and retries
# supabase start when Colima crashes or image pulls hang during parallel downloads.
#
# Subcommands:
#   colima   — install Lima/Colima, start VM, configure Docker
#   supabase — pre-pull images and start local Supabase (requires colima step first)
#   (none)   — run both (backward compatible)
set -euo pipefail

COLIMA_VERSION="${COLIMA_VERSION:-v0.9.1}"
LIMA_VERSION="${LIMA_VERSION:-v1.2.1}"
COLIMA_CPU="${COLIMA_CPU:-4}"
COLIMA_MEMORY="${COLIMA_MEMORY:-8}"
COLIMA_DISK="${COLIMA_DISK:-100}"
SUPABASE_START_ATTEMPTS="${SUPABASE_START_ATTEMPTS:-2}"
SUPABASE_START_TIMEOUT_SEC="${SUPABASE_START_TIMEOUT_SEC:-900}"
DOCKER_PULL_ATTEMPTS="${DOCKER_PULL_ATTEMPTS:-5}"
SUPABASE_ECR_REGISTRY="${SUPABASE_ECR_REGISTRY:-public.ecr.aws/supabase}"
# Mobile E2E only needs auth + REST + Postgres; skip Studio, analytics, email, storage, realtime.
SUPABASE_START_EXCLUDE="${SUPABASE_START_EXCLUDE:-studio,vector,logflare,inbucket,storage,realtime}"
SUPABASE_PREPULL_SERVICES="${SUPABASE_PREPULL_SERVICES:-postgres,gotrue,kong,postgrest}"
COLIMA_DIAG_LOG="${COLIMA_DIAG_LOG:-/tmp/colima-bootstrap-diagnostics.log}"

colima_start_args=(
  --runtime docker
  --arch x86_64
  --vm-type vz
  --mount-type virtiofs
  --cpu "$COLIMA_CPU"
  --memory "$COLIMA_MEMORY"
  --disk "$COLIMA_DISK"
)

log() {
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*"
}

clean_docker_config() {
  if [[ ! -f "$HOME/.docker/config.json" ]]; then
    return 0
  fi
  if ! command -v jq >/dev/null 2>&1; then
    return 0
  fi
  jq 'del(.credsStore)' "$HOME/.docker/config.json" > /tmp/docker-config.json
  mv /tmp/docker-config.json "$HOME/.docker/config.json"
}

install_lima() {
  if command -v limactl >/dev/null 2>&1; then
    log "Lima already installed: $(limactl --version)"
    return 0
  fi

  log "Installing Lima ${LIMA_VERSION}..."
  curl -fsSL \
    "https://github.com/lima-vm/lima/releases/download/${LIMA_VERSION}/lima-${LIMA_VERSION:1}-$(uname -s)-$(uname -m).tar.gz" \
    | sudo tar Cxzvm /usr/local
  log "Lima installed: $(limactl --version)"
}

install_colima() {
  if command -v colima >/dev/null 2>&1; then
    log "Colima already installed: $(colima version)"
    return 0
  fi

  log "Installing Colima ${COLIMA_VERSION}..."
  tmp_dir="$(mktemp -d)"
  curl -fsSL \
    "https://github.com/abiosoft/colima/releases/download/${COLIMA_VERSION}/colima-$(uname)-$(uname -m)" \
    -o "${tmp_dir}/colima"
  chmod +x "${tmp_dir}/colima"
  sudo install "${tmp_dir}/colima" /usr/local/bin/colima
  rm -rf "$tmp_dir"
  log "Colima installed: $(colima version)"
}

install_dependencies() {
  log "Installing brew dependencies (coreutils, docker, jq)..."
  brew install coreutils docker jq
  install_lima
  install_colima
}

start_colima() {
  log "Starting Colima VM (cpu=${COLIMA_CPU}, memory=${COLIMA_MEMORY}GB, disk=${COLIMA_DISK}GB)..."
  colima delete -f || true
  colima start "${colima_start_args[@]}"
  log "Colima VM started"
}

configure_docker_socket() {
  log "Configuring Docker socket symlink..."
  sudo mkdir -p /var/run
  sudo ln -sf "$HOME/.colima/default/docker.sock" /var/run/docker.sock
  export DOCKER_HOST=unix:///var/run/docker.sock
  if [[ -n "${GITHUB_ENV:-}" ]]; then
    echo "DOCKER_HOST=unix:///var/run/docker.sock" >> "$GITHUB_ENV"
  fi
}

configure_colima_docker_daemon() {
  log "Configuring Docker daemon inside Colima (lower concurrent downloads)..."
  colima ssh -- sudo mkdir -p /etc/docker
  printf '%s\n' \
    '{' \
    '  "max-concurrent-downloads": 2,' \
    '  "max-download-attempts": 5' \
    '}' \
    | colima ssh -- sudo tee /etc/docker/daemon.json >/dev/null
  colima ssh -- sudo systemctl restart docker
}

wait_for_docker() {
  log "Waiting for Docker daemon..."
  for _ in $(seq 1 30); do
    if docker info >/dev/null 2>&1; then
      log "Docker daemon ready"
      docker info
      return 0
    fi
    sleep 2
  done
  echo "Docker daemon did not become ready in time" >&2
  return 1
}

run_with_timeout() {
  local seconds="$1"
  shift
  if command -v timeout >/dev/null 2>&1; then
    timeout "$seconds" "$@"
    return $?
  fi
  if command -v gtimeout >/dev/null 2>&1; then
    gtimeout "$seconds" "$@"
    return $?
  fi
  echo "timeout/gtimeout not found (brew install coreutils)" >&2
  return 127
}

patch_supabase_config_for_ci() {
  log "Patching supabase/config.toml for CI (disable analytics)..."
  if grep -q '^\[analytics\]' supabase/config.toml 2>/dev/null; then
    if grep -A1 '^\[analytics\]' supabase/config.toml | grep -q '^enabled = true'; then
      sed -i.bak '/^\[analytics\]/,/^enabled = true/ s/^enabled = true/enabled = false/' supabase/config.toml
      rm -f supabase/config.toml.bak
    fi
    return 0
  fi

  printf '\n[analytics]\nenabled = false\n' >> supabase/config.toml
}

dump_colima_diagnostics() {
  {
    echo "=== colima status ==="
    colima status 2>&1 || true
    echo
    echo "=== docker info ==="
    docker info 2>&1 || true
    echo
    echo "=== colima hostagent stderr (tail) ==="
    if [[ -f "$HOME/.colima/_lima/colima/ha.stderr.log" ]]; then
      tail -n 80 "$HOME/.colima/_lima/colima/ha.stderr.log" 2>&1 || true
    else
      echo "(ha.stderr.log not found)"
    fi
  } | tee -a "$COLIMA_DIAG_LOG"
}

docker_pull_with_retry() {
  local image="$1"
  local attempt
  for attempt in $(seq 1 "$DOCKER_PULL_ATTEMPTS"); do
    log "docker pull ${image} (attempt ${attempt}/${DOCKER_PULL_ATTEMPTS})"
    if docker pull "$image"; then
      log "docker pull succeeded: ${image}"
      return 0
    fi
    log "docker pull failed for ${image} on attempt ${attempt}" >&2
    sleep $((attempt * 5))
  done
  echo "docker pull failed for ${image} after ${DOCKER_PULL_ATTEMPTS} attempts" >&2
  return 1
}

lookup_service_version() {
  local service_key="$1"
  local services_output="$2"
  local line image_name version

  while IFS= read -r line; do
    if [[ "$line" =~ ^[[:space:]]*supabase/([a-z0-9-]+)[[:space:]]*\|[[:space:]]*([^|[:space:]]+) ]]; then
      image_name="${BASH_REMATCH[1]}"
      version="${BASH_REMATCH[2]}"
      if [[ "$image_name" == "$service_key" ]]; then
        echo "$version"
        return 0
      fi
    fi
    if [[ "$service_key" == "postgrest" && "$line" =~ ^[[:space:]]*postgrest/postgrest[[:space:]]*\|[[:space:]]*([^|[:space:]]+) ]]; then
      echo "${BASH_REMATCH[1]}"
      return 0
    fi
  done <<< "$services_output"

  return 1
}

prepull_supabase_images() {
  local services_output service_key version image
  services_output="$(supabase services 2>/dev/null || true)"
  if [[ -z "$services_output" ]]; then
    log "Could not read supabase services output; skipping pre-pull" >&2
    return 0
  fi

  log "Pre-pulling heavy Supabase images sequentially..."
  IFS=',' read -r -a prepull_services <<< "$SUPABASE_PREPULL_SERVICES"
  for service_key in "${prepull_services[@]}"; do
    service_key="${service_key// /}"
    if ! version="$(lookup_service_version "$service_key" "$services_output")"; then
      log "No version found for ${service_key}; skipping pre-pull" >&2
      continue
    fi
    image="${SUPABASE_ECR_REGISTRY}/${service_key}:${version}"
    docker_pull_with_retry "$image"
  done
  log "Pre-pull complete"
}

build_supabase_start_cmd() {
  SUPABASE_START_CMD=(supabase start)
  local service
  IFS=',' read -r -a excluded <<< "$SUPABASE_START_EXCLUDE"
  for service in "${excluded[@]}"; do
    service="${service// /}"
    if [[ -n "$service" ]]; then
      SUPABASE_START_CMD+=(-x "$service")
    fi
  done
}

cleanup_after_failed_start() {
  log "Cleaning up after failed supabase start..."
  supabase stop --no-backup 2>/dev/null || true
  dump_colima_diagnostics
}

restart_colima_stack() {
  log "Restarting Colima..."
  colima stop || true
  sleep 5
  start_colima
  configure_docker_socket
  configure_colima_docker_daemon
  wait_for_docker
}

supabase_start_with_retry() {
  local attempt
  local -a start_cmd=()

  patch_supabase_config_for_ci
  prepull_supabase_images
  build_supabase_start_cmd
  start_cmd=("${SUPABASE_START_CMD[@]}")

  for attempt in $(seq 1 "$SUPABASE_START_ATTEMPTS"); do
    log "supabase start attempt ${attempt}/${SUPABASE_START_ATTEMPTS} (timeout ${SUPABASE_START_TIMEOUT_SEC}s, exclude ${SUPABASE_START_EXCLUDE})"
    set +e
    run_with_timeout "$SUPABASE_START_TIMEOUT_SEC" "${start_cmd[@]}"
    local exit_code=$?
    set -e

    if [[ "$exit_code" -eq 0 ]]; then
      log "supabase start succeeded on attempt ${attempt}"
      return 0
    fi

    if [[ "$exit_code" -eq 124 ]]; then
      log "supabase start timed out after ${SUPABASE_START_TIMEOUT_SEC}s on attempt ${attempt}" >&2
    else
      log "supabase start failed with exit code ${exit_code} on attempt ${attempt}" >&2
    fi

    cleanup_after_failed_start

    if [[ "$attempt" -lt "$SUPABASE_START_ATTEMPTS" ]]; then
      restart_colima_stack
      prepull_supabase_images
    fi
  done

  log "supabase start failed after ${SUPABASE_START_ATTEMPTS} attempts" >&2
  return 1
}

run_colima_bootstrap() {
  : >"$COLIMA_DIAG_LOG"
  log "=== Colima bootstrap start ==="
  install_dependencies
  clean_docker_config
  start_colima
  configure_docker_socket
  configure_colima_docker_daemon
  wait_for_docker
  log "=== Colima bootstrap complete ==="
}

run_supabase_bootstrap() {
  touch "$COLIMA_DIAG_LOG"
  log "=== Supabase bootstrap start ==="
  if [[ ! -S "${DOCKER_HOST#unix://}" ]] && [[ ! -S "/var/run/docker.sock" ]]; then
    log "Warning: Docker socket may not be ready; continuing anyway" >&2
  fi
  supabase_start_with_retry
  log "=== Supabase bootstrap complete ==="
}

subcommand="${1:-all}"

case "$subcommand" in
  colima)
    run_colima_bootstrap
    ;;
  supabase)
    run_supabase_bootstrap
    ;;
  all|"")
    run_colima_bootstrap
    run_supabase_bootstrap
    ;;
  *)
    echo "Unknown subcommand: $subcommand (expected: colima, supabase, or all)" >&2
    exit 1
    ;;
esac
