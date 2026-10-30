# Apex Operations — local DevOps assessment

Zero-dependency Node.js API with a persistent mock store. Synthetic local data only.

## Requirements and setup

Docker Desktop running Linux containers and Docker Compose v2+; Git. Node.js 22+ and npm are needed only for host-side tests. Clone this repository and run commands from its root.

### Windows PowerShell

```powershell
$env:APP_VERSION='v1'
docker compose build
docker compose up -d --no-build --wait --wait-timeout 90
docker compose ps
Invoke-RestMethod http://127.0.0.1:3000/api/health
Invoke-RestMethod http://127.0.0.1:3000/api/ready
Invoke-RestMethod http://127.0.0.1:3000/api/tasks -Method Post -ContentType application/json -Body '{"title":"Synthetic demo task"}'
Invoke-RestMethod http://127.0.0.1:3000/api/tasks
```

Compose supplies the defaults; `.env.example` documents the optional version setting. Never commit `.env` or credentials. Port 3000 must be free. The store has no published host port.

### Bash / WSL

```bash
bash scripts/deploy.sh v1
bash scripts/smoke.sh
```

## Tests and CI

```bash
npm ci --ignore-scripts
npm run check
npm audit --audit-level=high
```

Eight automated checks cover health, readiness (including dependency failure), task creation, validation, unknown routes and disk persistence. CI checks must pass before the image job; image build, non-root verification and Trivy must pass before the release gate. The gate validates Compose; local deployment remains manual and does not enforce CI approval itself.

Successful CI for source commit `0023f00`: https://github.com/Hossamsaber1/apex-operations01/actions/runs/41111131855

## Release, rollback and persistence

In PowerShell, deploy a second version with `$env:APP_VERSION='v2'`, then `docker compose build` and `docker compose up -d --no-build --force-recreate --wait --wait-timeout 90`. Confirm `/api/health` reports `v2`.

Rollback without rebuilding: set `$env:APP_VERSION='v1'`, run `docker image inspect apex-operations:v1`, then `docker compose up -d --no-build --force-recreate --wait --wait-timeout 90`. Verify health reports `v1`, readiness succeeds, and tasks are retained. Bash equivalents: `bash scripts/deploy.sh v2` then `bash scripts/rollback.sh v1`.

The named `task_data` volume survives recreation. `docker compose down` stops/removes containers; **do not use `down -v`** unless intentionally deleting demo data. Rollback does not reverse data migrations. In this demonstration v1/v2 use identical source and different version configuration; it proves image selection and persistence, not code/schema migration compatibility.

## Review material

- [Architecture](docs/architecture.md), [runbook](docs/runbook.md), [security](docs/security.md), [decision memo](docs/decision-memo.md).
- [Evidence index](evidence/README.md) and [AI-use disclosure](docs/ai-usage.md).
- Metrics/alerts and cloud hosting are proposals, not deployed services. No paid resources are required.
