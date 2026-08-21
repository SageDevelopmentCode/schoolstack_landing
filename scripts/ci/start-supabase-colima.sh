#!/usr/bin/env bash
# Bootstrap Colima + local Supabase for macOS GitHub Actions (mobile-e2e-ios).
# Uses virtiofs (not sshfs), symlinks docker.sock for Supabase CLI 2.110+, and retries
# supabase start when Colima crashes during parallel image pulls.
set -euo pipefail

COLIMA_VERSION="${COLIMA_VERSION:-v0.9.1}"
COLIMA_CPU="${COLIMA_CPU:-4}"
COLIMA_MEMORY="${COLIMA_MEMORY:-8}"
COLIMA_DISK="${COLIMA_DISK:-100}"
SUPABASE_START_ATTEMPTS="${SUPABASE_START_ATTEMPTS:-3}"

colima_start_args=(
  --runtime docker
  --vm-type vz
  --mount-type virtiofs
  --cpu "$COLIMA_CPU"
  --memory "$COLIMA_MEMORY"
  --disk "$COLIMA_DISK"
)

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

install_colima() {
  if command -v colima >/dev/null 2>&1; then
    colima version
    return 0
  fi

  echo "Installing Colima ${COLIMA_VERSION}..."
  tmp_dir="$(mktemp -d)"
  trap 'rm -rf "$tmp_dir"' RETURN
  curl -fsSL \
    "https://github.com/abiosoft/colima/releases/download/${COLIMA_VERSION}/colima-$(uname)-$(uname -m)" \
    -o "${tmp_dir}/colima"
  chmod +x "${tmp_dir}/colima"
  sudo install "${tmp_dir}/colima" /usr/local/bin/colima
}

install_dependencies() {
  brew install docker jq
  install_colima
}

start_colima() {
  colima delete -f || true
  colima start "${colima_start_args[@]}"
}

configure_docker_socket() {
  sudo mkdir -p /var/run
  sudo ln -sf "$HOME/.colima/default/docker.sock" /var/run/docker.sock
  export DOCKER_HOST=unix:///var/run/docker.sock
  if [[ -n "${GITHUB_ENV:-}" ]]; then
    echo "DOCKER_HOST=unix:///var/run/docker.sock" >> "$GITHUB_ENV"
  fi
}

wait_for_docker() {
  for _ in $(seq 1 30); do
    if docker info >/dev/null 2>&1; then
      docker info
      return 0
    fi
    sleep 2
  done
  echo "Docker daemon did not become ready in time" >&2
  return 1
}

supabase_start_with_retry() {
  local attempt
  for attempt in $(seq 1 "$SUPABASE_START_ATTEMPTS"); do
    echo "supabase start attempt ${attempt}/${SUPABASE_START_ATTEMPTS}"
    if supabase start; then
      return 0
    fi
    echo "supabase start failed on attempt ${attempt}" >&2
    if [[ "$attempt" -lt "$SUPABASE_START_ATTEMPTS" ]]; then
      echo "Restarting Colima..."
      colima stop || true
      sleep 5
      start_colima
      configure_docker_socket
      wait_for_docker
    fi
  done
  echo "supabase start failed after ${SUPABASE_START_ATTEMPTS} attempts" >&2
  return 1
}

install_dependencies
clean_docker_config
start_colima
configure_docker_socket
wait_for_docker
supabase_start_with_retry
