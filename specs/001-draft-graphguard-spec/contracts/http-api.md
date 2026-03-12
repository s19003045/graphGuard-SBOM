# HTTP API Contract (Draft)

**Scope**: External service contract for GraphGuard SBOM Enterprise Monitoring  
**Source**: `docs/spec.md`

## 1. Ingestion

### POST /api/v1/sbom/uploads

Purpose:
Submit an SBOM document for asynchronous processing.

Request body (contract level):
- projectId (string, required)
- sourceType (string, required)
- sbomDocument (object|string, required)

Successful response:
- status: accepted
- snapshotId
- ingestStatus: queued

Failure responses:
- validation_error (malformed or unsupported SBOM)
- authorization_error

## 2. Ingestion Status

### GET /api/v1/sbom/uploads/{snapshotId}

Purpose:
Retrieve processing status and summary metrics.

Response fields:
- snapshotId
- ingestStatus (queued|processing|completed|failed)
- packageCount
- vulnerablePackageCount
- highRiskLicenseCount
- failureReason (nullable)

## 3. Dependency and Impact

### GET /api/v1/projects/{projectId}/dependencies

Purpose:
Return dependency graph subset for exploration.

Query parameters:
- maxDepth (optional)
- severityFilter (optional)
- licenseRiskFilter (optional)

Response fields:
- nodes[] (project/package metadata)
- edges[] (dependency relationships)
- paginationOrWindow metadata

### GET /api/v1/packages/{packageVersionId}/impact

Purpose:
Return direct and indirect impacted projects and paths.

Response fields:
- directImpacts[]
- indirectImpacts[]
- impactPathCount

## 4. Findings and Exceptions

### GET /api/v1/projects/{projectId}/findings

Purpose:
Return vulnerability and license findings for triage.

Response fields:
- vulnerabilities[]
- licenses[]
- summary counts by severity/risk class

### POST /api/v1/vulnerabilities/{findingId}/exceptions

Purpose:
Create risk exception with governance metadata.

Request body:
- reason (required)
- owner (required)
- expiresAt (required)

Response fields:
- riskExceptionId
- state
- auditEventId

### PATCH /api/v1/vulnerabilities/{findingId}/exceptions/{riskExceptionId}

Purpose:
Update or revoke exception.

Request body:
- state (active|revoked)
- reason (required for revoke)

## 5. AI Assistance

### POST /api/v1/remediation/recommend

Purpose:
Generate remediation options and risk notes for a finding.

Request body:
- findingId (required)
- projectContext (optional)

Response fields:
- recommendations[]
  - optionRank
  - summary
  - confidenceLevel
  - riskNotes

### POST /api/v1/query/natural-language

Purpose:
Answer security questions using explainable query-backed results.

Request body:
- question (required)

Response fields:
- answerSummary
- evidence
- queryMetadata

## 6. Reporting

### GET /api/v1/reports/posture
### GET /api/v1/reports/impact
### GET /api/v1/reports/license-compliance

Purpose:
Export role-gated reports for audit and stakeholder review.

Common response behavior:
- filter echo (to ensure reproducibility)
- generatedAt
- report payload or downloadable artifact reference

## Contract Notes

- All sensitive operations require authenticated identity and role authorization.
- Risk-state changes must return audit references.
- Error payloads must be actionable but must not expose sensitive internals.
