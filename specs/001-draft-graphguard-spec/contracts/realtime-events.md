# Realtime Event Contract (Draft)

**Scope**: Event stream contract for asynchronous processing and workflow updates  
**Source**: `docs/spec.md`

## Event: sbom.ingestion.status.changed

When emitted:
- Any ingest status transition for a snapshot

Payload:
- snapshotId
- projectId
- previousStatus
- currentStatus
- timestamp
- summary (optional when completed)
- failureReason (when failed)

Consumer expectations:
- UI should update ingestion progress indicators
- Final state should trigger finding refresh request

## Event: finding.state.changed

When emitted:
- Vulnerability or license finding state changes

Payload:
- findingId
- projectId
- previousState
- currentState
- reason
- actor
- timestamp

Consumer expectations:
- UI should reflect triage updates without page reload
- Audit timeline view should append event entry

## Event: exception.lifecycle.changed

When emitted:
- Exception created, updated, revoked, or expired

Payload:
- riskExceptionId
- findingId
- state
- owner
- expiresAt
- actor
- timestamp
- auditEventId

Consumer expectations:
- Compliance and triage screens should display latest exception status

## Event: remediation.recommendation.ready

When emitted:
- Recommendation generation completes for a requested finding

Payload:
- findingId
- recommendationSetId
- generatedAt
- recommendationCount

Consumer expectations:
- UI should fetch recommendation details using standard API contract

## Event Delivery Guarantees (Contract-Level)

- Events are at-least-once; consumers must handle deduplication by event identifier.
- Event payloads are append-only compatible; new optional fields may be added.
- Ordering is guaranteed per aggregate key where possible (for example, by snapshotId).
