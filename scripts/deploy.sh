#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
version="${1:?Usage: bash scripts/deploy.sh v1}"
[[ "$version" =~ ^v[0-9]+([.][0-9]+){0,2}$ ]] || { echo 'Use version like v1 or v1.2.3' >&2; exit 2; }
mkdir -p .release-state
previous="$(cat .release-state/current 2>/dev/null || true)"
APP_VERSION="$version" docker compose build
APP_VERSION="$version" docker compose up -d --no-build --force-recreate
for i in $(seq 1 30); do
 if curl -fsS http://127.0.0.1:3000/api/ready >/dev/null; then
  if [[ -n "$previous" && "$previous" != "$version" ]]; then printf '%s
' "$previous" > .release-state/previous; fi
  printf '%s
' "$version" > .release-state/current
  echo "Deployed $version; ready check passed"; exit 0
 fi
 sleep 2
done
echo 'Readiness failed. Inspect: docker compose ps; docker compose logs --tail=100' >&2
exit 1
