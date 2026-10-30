#!/usr/bin/env bash
set -euo pipefail
base=http://127.0.0.1:3000
curl -fsS "$base/api/health"; echo
curl -fsS "$base/api/ready"; echo
curl -fsS "$base/api/tasks"; echo
curl -fsS -X POST "$base/api/tasks" -H 'content-type: application/json' -d '{"title":"Synthetic demo task"}'; echo
curl -fsS "$base/api/tasks"; echo
