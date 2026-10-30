#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
target="${1:-$(cat .release-state/previous 2>/dev/null || true)}"
[[ -n "$target" && "$target" =~ ^v[0-9]+([.][0-9]+){0,2}$ ]] || { echo 'No valid rollback version. Usage: bash scripts/rollback.sh v1' >&2; exit 2; }
docker image inspect "apex-operations:$target" >/dev/null || { echo "Missing local image for $target" >&2; exit 1; }
current="$(cat .release-state/current 2>/dev/null || true)"
APP_VERSION="$target" docker compose up -d --no-build --force-recreate
for i in $(seq 1 30); do
 if curl -fsS http://127.0.0.1:3000/api/ready >/dev/null; then
  if [[ -n "$current" && "$current" != "$target" ]]; then printf '%s
' "$current" > .release-state/previous; fi
  printf '%s
' "$target" > .release-state/current
  echo "Rolled back to $target; ready check passed"; exit 0
 fi
 sleep 2
done
echo 'Rollback readiness failed; investigate immediately' >&2
exit 1
