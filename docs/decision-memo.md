# Decision memo

## Scope
Prioritize reproducibility, failure handling, safe release, evidence and explanation over feature complexity. Use Node.js built-ins and a separate persistent mock store, explicitly permitted by the assessment. No external database credentials, paid cloud resources or production data.

## Trade-offs
- **Mock store vs PostgreSQL:** simpler and deterministic for a 48-hour exercise; demonstrates persistence/readiness but not SQL administration. One writer only.
- **Manual local deployment vs automated remote CD:** CI blocks unsafe promotion, but remote runner cannot access WSL machine. Manual release is transparent and safer in scope.
- **Tags vs digests:** local version tags demonstrate rollback; production requires immutable digests and external registry.
- **Basic observability vs full stack:** structured logs, health/readiness and incident drill implemented; metrics and alerts proposed, not deployed.
- **No auth/TLS:** loopback-only synthetic local demo; mandatory for internet-facing deployment.

## With more time
Replace mock with PostgreSQL and migrations; add metrics endpoint and Prometheus; pin action/image digests; add SBOM, signed artifacts, backup restore drill and approval-based promotion.
