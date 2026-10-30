# Architecture

```mermaid
flowchart TD
  Git[Git push] --> CI[GitHub Actions: checks]
  CI -->|pass| Image[Docker build + Trivy]
  Image -->|pass| Gate[Compose release gate]
  Gate -->|manual local action| Deploy[WSL: deploy.sh]
  Deploy --> API[API container :3000 / non-root]
  API -->|internal network| Store[Mock store container :4000 / non-root]
  Store --> Volume[(Docker named volume)]
  API --> Logs[JSON stdout logs + Docker rotation]
```

Liveness checks API process; readiness calls store health. No public port on store. Both containers drop Linux capabilities and forbid privilege escalation. Data volume persists across Compose restarts. Rollback changes image version, not stored data; schema migrations require independent rollback planning.
