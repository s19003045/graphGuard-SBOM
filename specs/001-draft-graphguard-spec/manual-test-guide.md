# Manual Test Guide: US1 and US2

Date: 2026-03-13
Scope:
- US1 Upload SBOM and review risk summary
- US2 Dependency graph and blast radius

## 1. Goal

This document provides a step-by-step manual test workflow for the current implementation.

## 2. Preconditions

- Node.js 22 is active.
- API project can run locally.
- Web UI dependencies are installed.
- PowerShell terminal is available.

Recommended check:
- dotnet build src/api-server/GraphGuard.sln
- npm run build --prefix src/web-ui

## 3. Start Services

### 3.1 Start API

Command:

  dotnet run --project src/api-server/GraphGuard.API --urls http://localhost:5099

Expected:
- Service starts without fatal errors.
- OpenAPI can be reached in browser:
  http://localhost:5099/openapi/v1.json

### 3.2 Start Web UI

Command:

  npm run dev --prefix src/web-ui

Expected:
- Vite starts and shows local URL.
- Page opens successfully.

Note:
- The current UI calls /api relative path.
- If UI and API are on different ports and no proxy is configured, UI API calls may fail in browser.
- API manual tests in section 4 are still valid and should be executed regardless.

## 4. API Manual Tests

### US1-API-001 Upload SBOM returns accepted

Steps:
1. In PowerShell, create request body and call upload endpoint.

  $body = @{
    projectId = "manual-test-project"
    sourceType = "cyclonedx"
    sbomDocument = @{ bomFormat = "CycloneDX"; components = @() }
  } | ConvertTo-Json -Depth 20

  $upload = Invoke-RestMethod -Method Post -Uri "http://localhost:5099/api/v1/sbom/uploads" -ContentType "application/json" -Body $body
  $upload

Expected:
- HTTP status is accepted.
- Response has snapshotId.
- ingestStatus is queued.

### US1-API-002 Poll status reaches completed or failed

Steps:
1. Reuse snapshotId from previous case.

  $snapshotId = $upload.snapshotId
  1..10 | ForEach-Object {
    $status = Invoke-RestMethod -Method Get -Uri ("http://localhost:5099/api/v1/sbom/uploads/" + $snapshotId)
    $status
    if ($status.ingestStatus -eq "completed" -or $status.ingestStatus -eq "failed") { break }
    Start-Sleep -Seconds 1
  }

Expected:
- ingestStatus transitions to completed or failed.
- For completed, packageCount, vulnerablePackageCount, highRiskLicenseCount are present.
- For failed, failureReason is present.

### US1-API-003 Not found snapshot returns 404

Steps:
1. Query an invalid snapshot id.

  Invoke-WebRequest -Method Get -Uri "http://localhost:5099/api/v1/sbom/uploads/not-exists" -SkipHttpErrorCheck

Expected:
- HTTP status is 404.

### US2-API-001 Dependency graph query returns nodes and edges

Steps:
1. Call dependencies endpoint.

  Invoke-RestMethod -Method Get -Uri "http://localhost:5099/api/v1/projects/sample-project/dependencies?maxDepth=3" | ConvertTo-Json -Depth 20

Expected:
- Response includes projectId, nodes, edges, window.
- Node count and edge count are greater than zero.
- window.maxDepth is 3.

### US2-API-002 Severity filter narrows graph

Steps:
1. Query with severityFilter.

  Invoke-RestMethod -Method Get -Uri "http://localhost:5099/api/v1/projects/sample-project/dependencies?maxDepth=3&severityFilter=critical" | ConvertTo-Json -Depth 20

Expected:
- nodes list is filtered by severity.
- edges correspond to filtered nodes.

### US2-API-003 Package impact returns direct and indirect impacts

Steps:
1. Call package impact endpoint.

  Invoke-RestMethod -Method Get -Uri "http://localhost:5099/api/v1/packages/pkg-npm-ansi-regex-5.0.1/impact" | ConvertTo-Json -Depth 20

Expected:
- Response includes directImpacts and indirectImpacts.
- impactPathCount equals directImpacts count + indirectImpacts count.

## 5. UI Manual Tests

### US1-UI-001 Upload panel interaction

Steps:
1. Open home page.
2. Confirm SBOM Ingestion card is visible.
3. Input project id and source type.
4. Click Upload SBOM.

Expected:
- Submitting state appears.
- Status chip appears after response.
- Error alert appears on network/API failure.

### US2-UI-001 Dependency explorer renders

Steps:
1. Confirm Dependency Explorer section is visible.
2. Verify table renders package rows.
3. Click one row to select package.

Expected:
- Selected row is highlighted.
- Blast Radius panel updates for selected package.

### US2-UI-002 Filter and URL sync

Steps:
1. Change Max Depth, Severity, License Risk filters.
2. Observe URL query parameters.
3. Refresh page.

Expected:
- URL contains maxDepth and optional filters.
- Filter state is restored from URL on refresh.

### US2-UI-003 Export CSV

Steps:
1. In Blast Radius panel, click Export CSV.
2. Open downloaded file.

Expected:
- File name pattern: impact-{packageVersionId}.csv.
- Header includes: projectId, impactPath, depth, impactType.
- Data rows match displayed impacts.

### UI-UX-001 Theme toggle

Steps:
1. Click theme toggle icon in header.
2. Refresh browser.

Expected:
- Theme switches between light and dark.
- Theme choice persists after refresh.

## 6. Test Record Template

Use the template below for each test case.

- Case ID:
- Tester:
- Date:
- Preconditions met: Yes or No
- Steps executed:
- Actual result:
- Expected result met: Pass or Fail
- Evidence: screenshot or output snippet
- Notes:

## 7. Troubleshooting

Issue: API cannot be reached
- Check API process is running on port 5099.
- Check URL is exactly http://localhost:5099.

Issue: UI shows network error for /api calls
- This is expected without proxy when UI and API are on different ports.
- Continue API manual tests in section 4.

Issue: Build succeeds but Vite shows many MUI use client warnings
- Current warnings are non-blocking for this project state.
- Confirm final build output includes built successfully.
