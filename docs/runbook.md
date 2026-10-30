# Operations runbook

## Deploy
From WSL Ubuntu project directory: `bash scripts/deploy.sh v1`. The script builds a version-tagged local image, starts both services, polls readiness for up to 60 seconds, and records the successful version. Verify with `bash scripts/smoke.sh` and `APP_VERSION=v1 docker compose ps`. Ensure Docker Desktop is running.

## Rollback
`bash scripts/rollback.sh v1` (or omit version to use `.release-state/previous`). Requires image already present locally. Verify `curl -fsS http://localhost:3000/api/health` reports the previous version and `/api/ready` returns 200. Persistent data remains. Rollback does **not** undo incompatible data/schema changes.

## Incident response
1. Observe: `APP_VERSION=v1 docker compose ps` and `curl -i http://localhost:3000/api/ready`.
2. Scope: `APP_VERSION=v1 docker compose logs --tail=100 api store`; look for JSON `dependency_unavailable`.
3. Reproduce controlled failure: `APP_VERSION=v1 docker compose stop store` (expect readiness 503, health 200).
4. Recover: `APP_VERSION=v1 docker compose start store`; wait and verify readiness 200.
5. Record timestamps, symptoms, root cause, actions and proof of recovery in `evidence/incident.md`.

## Troubleshooting
- Docker daemon unavailable: start Docker Desktop, enable Ubuntu WSL integration, retry `docker info`.
- Port 3000 in use: `ss -ltnp | grep :3000`; stop the conflicting local process.
- Readiness 503: check store health and logs, confirm `/data` volume is writable.
- Permission denied on volume: inspect volume ownership; do not use root as a shortcut in production.
- CI Trivy failure: inspect CVE and patched base image; rebuild with patched digest; never silently ignore high severity findings.
- Disk/volume issues: `docker system df` and `docker volume ls` (read-only diagnostics); do not prune or remove volumes without backup.

## Metrics and alerts proposal (not deployed)
Track request rate, p95 latency, 5xx error ratio, readiness failures, restart count, disk usage and store availability. Proposed alerts: readiness failing >2 min; 5xx ratio >5% for 5 min with sufficient traffic; volume usage >80%; restart count >3 in 10 min. For production: Prometheus/OpenTelemetry, Grafana and Alertmanager with tuned baselines.

## Backups
For production, snapshot/export persistent data and perform a restore drill. This assessment uses synthetic local data only; no backup automation is claimed.
