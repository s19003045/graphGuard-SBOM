# GraphGuard Release Checklist

Date: 2026-03-13

## 1. Build and Quality Gates

- [ ] `dotnet build src/api-server/GraphGuard.sln` passes
- [ ] `npm run build --prefix src/web-ui` passes
- [ ] No blocking errors in API startup logs
- [ ] No blocking errors in web runtime console

## 2. API Readiness

- [ ] `GET /health` returns healthy status
- [ ] `GET /ready` returns ready status and dependency summary
- [ ] Rate limiting returns `429` when per-minute threshold is exceeded
- [ ] `X-Correlation-Id` is returned in response headers

## 3. Core Functional Verification

- [ ] SBOM upload and status lifecycle works (queued -> processing -> completed/failed)
- [ ] Dependency explorer returns non-empty graph for known project
- [ ] Blast radius endpoint returns direct/indirect impacts
- [ ] Remediation recommendation endpoint returns ranked options
- [ ] Natural language query endpoint returns answer and evidence
- [ ] Risk exception create/update endpoints return audit event references
- [ ] Compliance report export endpoint returns records

## 4. Frontend Verification

- [ ] Dependency table supports pagination, sorting, and search
- [ ] Keyboard activation works on dependency rows (Enter/Space)
- [ ] Compliance dashboard is rendered and operational
- [ ] CSV export for blast radius and compliance works
- [ ] Async loading/error states are consistently shown

## 5. Rollout Notes

- In-memory repositories are currently used for snapshots, graph projections, risk exceptions, and audit events.
- Data resets when API process restarts; this is acceptable for draft/dev stage but must be replaced by persistent storage before production.
- Correlation IDs are generated or propagated via `X-Correlation-Id`; include this header when investigating incidents.
- Default rate limiting is fixed-window by remote IP at 120 requests/minute globally.

## 6. Post-Release Monitoring

- [ ] Watch 5xx error rate for first 30 minutes
- [ ] Watch 429 rate for signs of over-restrictive limits
- [ ] Verify ingestion throughput for large SBOM documents
- [ ] Confirm audit timeline entries are being created for exception actions
