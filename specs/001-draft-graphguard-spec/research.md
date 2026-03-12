# Research Decisions: GraphGuard SBOM Enterprise Monitoring

**Date**: 2026-03-12  
**Input Spec**: `docs/spec.md`

## 1. SBOM Normalization Strategy

Decision:
Use a canonical package identity model with ecosystem-qualified naming and deterministic version normalization.

Rationale:
Cross-language analysis depends on consistent package identity to avoid fragmented graph nodes and false impact-path results.

Alternatives considered:
- Keep source-native naming only: rejected due to duplicate identities across ecosystems.
- Normalize only high-risk packages: rejected due to inconsistent query behavior.

## 2. Asynchronous Ingestion Processing

Decision:
Adopt queue-oriented processing states (`queued`, `processing`, `completed`, `failed`) with externally visible status.

Rationale:
SBOM payload size variance requires decoupled intake and processing to prevent request timeout and improve user feedback.

Alternatives considered:
- Fully synchronous processing: rejected for poor scalability and UX.
- Fire-and-forget without status API: rejected for low operational transparency.

## 3. Blast Radius Query Pattern

Decision:
Model blast radius as dependency-path traversal with direct and indirect impact tiers.

Rationale:
Security triage requires identifying not just impacted projects but path depth to prioritize remediation and communication.

Alternatives considered:
- Project-only impact count: rejected due to missing actionable path context.
- Flat package matching only: rejected due to transitive dependency blind spots.

## 4. Vulnerability Correlation and Refresh

Decision:
Use periodic vulnerability refresh with deterministic matching against tracked package versions.

Rationale:
Periodic refresh provides predictable operations while keeping findings current enough for triage and reporting.

Alternatives considered:
- Real-time feed-only processing: rejected due to external feed reliability risks.
- Manual-only refresh: rejected due to stale posture and delayed action.

## 5. Exception Lifecycle and Auditability

Decision:
Exceptions must include reason, owner, and expiry; all changes create immutable audit events.

Rationale:
Risk exceptions are governance decisions and must be traceable for security accountability and compliance evidence.

Alternatives considered:
- Optional exception metadata: rejected due to audit weakness.
- Mutable audit history: rejected due to compliance risk.

## 6. AI Recommendation Safety

Decision:
AI output must include: summary, recommendation options, and explicit confidence/risk notes with source evidence references.

Rationale:
Security teams need transparent, reviewable guidance; opaque AI advice is unsuitable for enterprise remediation.

Alternatives considered:
- Free-form recommendation text only: rejected due to low trust.
- Fully automated remediation execution: rejected as out of current scope.

## 7. Reporting and Export Scope

Decision:
Provide role-gated exports for posture, blast radius, and license compliance using reproducible filters.

Rationale:
Stakeholders need repeatable evidence packages for operational review and audits.

Alternatives considered:
- Screenshot-based reporting: rejected due to poor reproducibility.
- Unrestricted export access: rejected due to data governance risk.
