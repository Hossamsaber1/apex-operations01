# Actual local release, persistence and outage drill

Executed with AI assistance on local Windows Docker Desktop, 2026-10-30. Source: `0023f00`; documentation was subsequently updated. The excerpts below record actual command results. See [AI assistance](../docs/ai-usage.md) for the scope of support.

## Release and rollback

From the repository root in PowerShell:

```powershell
$env:APP_VERSION='v1'
docker build -t apex-operations:v1 .
docker compose up -d --no-build --force-recreate --wait --wait-timeout 90
$created=Invoke-RestMethod http://127.0.0.1:3000/api/tasks -Method Post -ContentType application/json -Body '{"title":"Synthetic release persistence drill"}'
docker compose restart store
$env:APP_VERSION='v2'
docker build -t apex-operations:v2 .
docker compose up -d --no-build --force-recreate --wait --wait-timeout 90
Invoke-RestMethod http://127.0.0.1:3000/api/health
$env:APP_VERSION='v1'
docker compose up -d --no-build --force-recreate --wait --wait-timeout 90
Invoke-RestMethod http://127.0.0.1:3000/api/health
$tasks=Invoke-RestMethod http://127.0.0.1:3000/api/tasks
if($created.id -notin $tasks.tasks.id){throw 'Persistence check failed'}
```

Observed output:

```text
task_id=af78e531-f27f-494b-8c3e-7a0406e79432
{"status":"healthy","version":"v2"}
{"status":"healthy","version":"v1"}
PERSISTENCE_AND_ROLLBACK=PASS
apex-operations-api-1     apex-operations:v1   Up 6 seconds (healthy)    127.0.0.1:3000->3000/tcp
apex-operations-store-1   apex-operations:v1   Up 16 seconds (healthy)   3000/tcp, 4000/tcp
```

Both tags use the same application source and runtime config digest `sha256:f1f5c2b24581fcaf8aff4c1650025e5432c88dc0ed4ac78102ea13e41c5c53aa`; APP_VERSION changes the reported release. This demonstrates version selection, recreation and retained data, not recovery from an incompatible code/schema change. Existing synthetic tasks and the named volume were preserved. Deployment scripts were reviewed; the PowerShell equivalent procedure above was executed.

## Incident investigation

Controlled incident began `2026-10-30T19:05:17.9647879Z` (21:05 Cairo). Stopped only `store` using `docker compose stop store`. Readiness returned 503 while liveness continued returning 200:

```text
outage_ready=503 {"status":"not_ready","dependency":"store"}
{"status":"healthy","version":"v1"}
api-1 | {"timestamp":"2026-10-30T19:05:21.185Z","level":"error","event":"dependency_unavailable","error":"timeout"}
```

Cause: intentionally stopped dependency. Diagnosis: correlate readiness dependency failure with JSON `dependency_unavailable` and Compose service state. Recovered using `docker compose start store`, then `docker compose up -d --no-build --wait --wait-timeout 90` with APP_VERSION=v1. Recovery completed `2026-10-30T19:05:33.0646405Z`:

```text
Container apex-operations-api-1 Healthy
Container apex-operations-store-1 Healthy
{"status":"ready","dependency":"store"}
```

No data-volume deletion or production access occurred. Follow-up: add the proposed readiness alert and rehearse a backup restore before any production use.

## CI and security evidence

Run https://github.com/Hossamsaber1/apex-operations01/actions/runs/41111131855 for `0023f00`: `checks=success`, `image=success`, `release-gate=success`, verified through GitHub's public jobs API. Earlier run 41106828554 failed at Trivy. Local reproduction found 10 HIGH findings in bundled package-manager dependencies. After removing unused runtime npm/Yarn/Corepack, Trivy 0.70.0 with `--severity CRITICAL,HIGH --ignore-unfixed` returned exit 0 and zero findings at that threshold. This is point-in-time evidence, not a guarantee about future vulnerability databases.

Intentional failure: historical `intentional-failure.txt` records 8 passing tests and one intentional failing test. It is a local test-run record, **not evidence of an intentionally failing GitHub run**. The checked-in workflow enforces `image.needs: checks` and `release-gate.needs: [checks, image]`. A hosted intentional-failure demo remains optional follow-up evidence; do not claim it has been executed.
