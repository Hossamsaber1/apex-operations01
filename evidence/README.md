# Evidence index

Current verified evidence: [2026-10-30 release, persistence, rollback, incident and CI record](verified-demo-2026-10-30.md). This includes observed output excerpts, reproduction commands and limitations. Execution assistance is disclosed in [AI assistance](../docs/ai-usage.md). Screenshots have not been newly captured.

Use this directory for actual execution screenshots or logs:

1. `local-tests.txt`: `npm run check 2>&1 | tee evidence/local-tests.txt` (check exit status separately; use `set -o pipefail`).
2. `ci-success.png`: screenshot of successful GitHub Actions run with all jobs green.
3. `ci-failure.png`: intentional broken assertion, failed `checks`, blocked downstream jobs; then revert.
4. `deployment.png`: `docker compose ps`, `/api/health`, `/api/ready`, tasks API.
5. `rollback.png`: v2 then v1 health version outputs plus deploy/rollback logs.
6. `incident.md`: time, controlled store outage, 503 readiness, logs, recovery and verified 200.
7. `security-scan.txt`: actual Trivy/npm audit output, including findings and disposition.

Before submission, remove any secrets, tokens, usernames, paths containing personal data, or private repository details from screenshots/logs. If a check fails, document it honestly; never create fake success evidence.

Historical files predate the current verification. Refer to the dated record above for the latest Docker Desktop and GitHub CI results. Candidate reproduction for the live review is still pending.
