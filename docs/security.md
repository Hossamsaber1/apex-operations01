# Security and configuration

- No credentials or real personal data; `.env` is gitignored and `.env.example` is safe.
- API binds only to loopback on host. Store is internal-only.
- Both containers use Node image's unprivileged `node` UID 1000; no privileged mode; `cap_drop: ALL`, `no-new-privileges`.
- API filesystem is read-only. Store writes only to mounted `/data` volume.
- Input validation limits task titles; request bodies capped at 10 KB.
- Structured JSON stdout logs exclude request bodies, headers and environment values.
- CI runs `npm audit` and Trivy image scan for fixable HIGH/CRITICAL findings. Zero third-party npm dependencies reduce attack surface; base image vulnerabilities still matter.
- Risk/limitations: HTTP local only; no auth, TLS, rate limiting or concurrent-write safety. Do not expose to internet. GitHub Actions versions should be SHA-pinned in hardened production workflows. Docker image tags are mutable; production should deploy pinned registry digests.
- Cloud proposal (not deployed): single small VM with container runtime, HTTPS reverse proxy, private network for dependency, encrypted persistent disk, secrets manager, backup and monitoring. Start with monthly cost estimates from current provider calculators before provisioning; avoid paid services for this assessment.
