# Data Model: GraphGuard SBOM Enterprise Monitoring

**Date**: 2026-03-12  
**Source**: `docs/spec.md`

## Entity: Project

Purpose:
Represents a monitored software project owned by an internal team.

Fields:
- projectId (string, required, immutable)
- name (string, required, unique within organization scope)
- language (enum: nodejs, python, mixed, other)
- ownerTeam (string, required)
- businessCriticality (enum: low, medium, high, mission_critical)
- createdAt (datetime, immutable)
- updatedAt (datetime)

Validation rules:
- name must be non-empty and normalized for search
- businessCriticality required for prioritization workflows

Relationships:
- Project 1..* SbomSnapshot
- Project *..* PackageVersion (via dependency graph)
- Project 0..* RiskException

## Entity: SbomSnapshot

Purpose:
Stores one ingest result for a project at a point in time.

Fields:
- snapshotId (string, required, immutable)
- projectId (string, required)
- sourceType (enum: cyclonedx, spdx, other)
- ingestStatus (enum: queued, processing, completed, failed)
- packageCount (integer, >= 0)
- vulnerablePackageCount (integer, >= 0)
- highRiskLicenseCount (integer, >= 0)
- startedAt (datetime)
- completedAt (datetime, nullable)
- failureReason (string, nullable)

Validation rules:
- completedAt required when ingestStatus is completed or failed
- failureReason required when ingestStatus is failed

State transitions:
- queued -> processing
- processing -> completed | failed

Relationships:
- SbomSnapshot *..1 Project

## Entity: PackageVersion

Purpose:
Canonical package identity used for graph analysis.

Fields:
- packageVersionId (string, required, immutable)
- ecosystem (string, required)
- packageName (string, required)
- normalizedName (string, required)
- version (string, required)
- licenseExpression (string, nullable)

Validation rules:
- (ecosystem, normalizedName, version) must be unique
- normalizedName must be deterministic for lookup

Relationships:
- PackageVersion *..* PackageVersion (via DependencyEdge)
- PackageVersion 0..* VulnerabilityFinding
- PackageVersion 0..* LicenseFinding

## Entity: DependencyEdge

Purpose:
Represents dependency relationship between two package versions.

Fields:
- dependencyEdgeId (string, required, immutable)
- fromPackageVersionId (string, required)
- toPackageVersionId (string, required)
- depth (integer, >= 1)
- isDirect (boolean, required)

Validation rules:
- fromPackageVersionId != toPackageVersionId for direct self-edge prevention
- depth must align with traversal semantics

Relationships:
- DependencyEdge *..1 PackageVersion (from)
- DependencyEdge *..1 PackageVersion (to)

## Entity: VulnerabilityFinding

Purpose:
Mapped known vulnerability for a package version.

Fields:
- findingId (string, required, immutable)
- packageVersionId (string, required)
- externalVulnerabilityId (string, required)
- severity (enum: low, medium, high, critical)
- status (enum: open, mitigated, ignored, false_positive)
- firstDetectedAt (datetime)
- lastEvaluatedAt (datetime)

Validation rules:
- externalVulnerabilityId must be non-empty
- status updates require audit event creation

Relationships:
- VulnerabilityFinding *..1 PackageVersion
- VulnerabilityFinding 0..* RemediationRecommendation
- VulnerabilityFinding 0..* RiskException

## Entity: LicenseFinding

Purpose:
Policy evaluation result for package license usage.

Fields:
- licenseFindingId (string, required, immutable)
- packageVersionId (string, required)
- policyClass (enum: allowed, review_required, prohibited)
- riskLevel (enum: low, medium, high)
- evaluatedAt (datetime, required)

Validation rules:
- policyClass must map to organization policy baseline

Relationships:
- LicenseFinding *..1 PackageVersion

## Entity: RiskException

Purpose:
Governance record that defers or suppresses a risk finding.

Fields:
- riskExceptionId (string, required, immutable)
- findingId (string, required)
- reason (string, required)
- owner (string, required)
- expiresAt (datetime, required)
- state (enum: active, revoked, expired)
- createdAt (datetime, required)
- updatedAt (datetime)

Validation rules:
- expiresAt must be after createdAt
- reason and owner required at creation

State transitions:
- active -> revoked
- active -> expired

Relationships:
- RiskException *..1 VulnerabilityFinding
- RiskException 1..* AuditEvent

## Entity: RemediationRecommendation

Purpose:
AI-assisted or rule-generated mitigation proposal for a finding.

Fields:
- recommendationId (string, required, immutable)
- findingId (string, required)
- summary (string, required)
- optionRank (integer, >= 1)
- confidenceLevel (enum: low, medium, high)
- riskNotes (string, required)
- generatedAt (datetime, required)

Validation rules:
- each finding must have unique optionRank values
- riskNotes required for explainability

Relationships:
- RemediationRecommendation *..1 VulnerabilityFinding

## Entity: AuditEvent

Purpose:
Immutable log of sensitive state changes and governance actions.

Fields:
- auditEventId (string, required, immutable)
- actorId (string, required)
- actionType (string, required)
- targetType (string, required)
- targetId (string, required)
- changeSummary (string, required)
- eventTimestamp (datetime, required)

Validation rules:
- audit events are append-only
- actionType must map to approved action taxonomy

Relationships:
- AuditEvent *..1 RiskException (for exception lifecycle)
- AuditEvent may reference VulnerabilityFinding or SbomSnapshot actions via targetType/targetId
