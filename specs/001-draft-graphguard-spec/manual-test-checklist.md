# Manual Test Checklist (Quick Run)

Date: 2026-03-13
Scope: US1 + US2

## 1. Environment

- [ ] `dotnet build src/api-server/GraphGuard.sln` passes
- [ ] `npm run build --prefix src/web-ui` passes
- [ ] API started at `http://localhost:5099`
- [ ] Web UI started and reachable

## 2. US1 API

- [ ] POST `/api/v1/sbom/uploads` returns accepted payload
- [ ] Response includes `snapshotId`
- [ ] Initial `ingestStatus` is `queued`
- [ ] GET `/api/v1/sbom/uploads/{snapshotId}` eventually reaches `completed` or `failed`
- [ ] If `completed`, counts are present (`packageCount`, `vulnerablePackageCount`, `highRiskLicenseCount`)
- [ ] If `failed`, `failureReason` is present
- [ ] Invalid snapshot id returns `404`

## 3. US2 API

- [ ] GET `/api/v1/projects/sample-project/dependencies?maxDepth=3` returns `nodes`, `edges`, `window`
- [ ] `window.maxDepth` equals query value
- [ ] GET with `severityFilter=critical` returns filtered result
- [ ] GET `/api/v1/packages/pkg-npm-ansi-regex-5.0.1/impact` returns `directImpacts` and `indirectImpacts`
- [ ] `impactPathCount = directImpacts + indirectImpacts`

## 4. US1 UI

- [ ] SBOM Ingestion card visible
- [ ] Upload action triggers submitting/loading state
- [ ] Status chip updates after upload
- [ ] Error alert shown when API/network fails

## 5. US2 UI

- [ ] Dependency Explorer section visible
- [ ] Graph table shows package rows
- [ ] Clicking row updates selected package
- [ ] Blast Radius panel updates for selected package
- [ ] Filters update URL query (`maxDepth`, `severityFilter`, `licenseRiskFilter`)
- [ ] Refresh preserves filter state from URL
- [ ] Export CSV downloads file with expected columns

## 6. UI/UX

- [ ] Theme toggle switches light/dark
- [ ] Theme preference persists after refresh

## 7. Evidence

- [ ] Capture at least one screenshot for each major section (US1 API, US2 API, US1 UI, US2 UI)
- [ ] Save one sample API response for upload/status/dependencies/impact
- [ ] Record tester, date, and pass/fail summary
