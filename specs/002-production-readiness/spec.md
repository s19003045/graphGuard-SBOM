# Feature Specification: GraphGuard Production Readiness and Persistent Platform

**Feature Branch**: `002-production-readiness`  
**Created**: 2026-03-16  
**Status**: Draft  
**Input**: Consolidated from `docs/project_des.md`, `docs/frontend_spec.md`, `docs/api-server_spec.md`, and `docs/ai-service_spec.md`

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Durable Data for Core Workflows (Priority: P1)

As a security analyst, I need SBOM, graph, exception, and audit data to survive process restarts so that triage and compliance evidence are reliable.

**Why this priority**: Without durable storage, production usage is blocked because risk state and audit evidence can be lost.

**Independent Test**: Upload SBOM, generate findings, create/update exception, restart API, then verify all records remain queryable.

**Acceptance Scenarios**:

1. **Given** an uploaded SBOM and completed ingestion, **When** the API restarts, **Then** dependency graph and status data are still available.
2. **Given** created and updated risk exceptions, **When** the API restarts, **Then** exception state and audit timeline remain intact.

---

### User Story 2 - Production-Grade Security and Access Control (Priority: P2)

As a platform owner, I need real authentication, authorization, and secure configuration so sensitive actions are protected and auditable.

**Why this priority**: Production exposure requires least-privilege access and controlled secret handling.

**Independent Test**: Access protected endpoints with and without required roles and verify policy enforcement plus audit traces.

**Acceptance Scenarios**:

1. **Given** a user without required role, **When** they call exception-management or export endpoints, **Then** request is rejected with 403.
2. **Given** valid credentials and role claims, **When** user performs sensitive actions, **Then** operation succeeds and immutable audit event is recorded.

---

### User Story 3 - AI Service Productionization (Priority: P3)

As a developer and security team member, I need AI outputs to be explainable, policy-aligned, and resilient to provider failures.

**Why this priority**: AI guidance is valuable only if it is trustworthy, observable, and controllable.

**Independent Test**: Execute remediation and natural-language queries under normal and degraded provider conditions and verify deterministic fallback behavior.

**Acceptance Scenarios**:

1. **Given** AI provider is healthy, **When** remediation endpoint is called, **Then** ranked options with evidence metadata are returned.
2. **Given** AI provider is unavailable, **When** remediation or NL query is called, **Then** system returns fallback response with explicit degraded-mode metadata.

---

### User Story 4 - Operational Readiness and Release Safety (Priority: P4)

As an SRE/release owner, I need CI/CD quality gates, observability, and rollback-ready deployment checks to ship safely.

**Why this priority**: Stable releases require predictable validation and operational visibility.

**Independent Test**: Run release pipeline and canary checklist; deploy to staging; verify health, readiness, tracing, alerting, and rollback drill.

**Acceptance Scenarios**:

1. **Given** a release candidate, **When** CI runs, **Then** build, test, security checks, and migration checks must pass before deploy.
2. **Given** a staged deployment, **When** synthetic checks fail, **Then** rollback procedure is executable within target RTO.

---

### Edge Cases

- Database schema migration fails during deployment.
- Partial ingestion writes occur when downstream dependency service is unavailable.
- Neo4j traversal timeouts on large dependency graphs.
- Vector index drift or stale embeddings cause low-quality AI evidence.
- Secret rotation occurs while services are running.
- Rate limiting blocks legitimate burst traffic during incident response.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST replace in-memory repositories with persistent implementations for SBOM snapshots, dependency graph projections, risk exceptions, and audit events.
- **FR-002**: System MUST support SQL Server for transactional records (users, RBAC, projects, scan logs, risk exceptions, audit events).
- **FR-003**: System MUST support Neo4j for dependency graph nodes/edges and blast-radius traversal.
- **FR-004**: System MUST include migration/versioning strategy for relational and graph schema changes.
- **FR-005**: System MUST enforce authentication and role-based authorization on sensitive endpoints.
- **FR-006**: System MUST store and load secrets from environment-based secure configuration for non-local environments.
- **FR-007**: System MUST provide resilient AI execution with provider abstraction, timeout control, and deterministic fallback.
- **FR-008**: System MUST persist AI request/response metadata for explainability and support incident diagnostics.
- **FR-009**: System MUST add contract/integration/E2E tests for upload, graph, remediation, exception, and export workflows.
- **FR-010**: System MUST define CI/CD release gates including build, tests, migration checks, and post-deploy health verification.
- **FR-011**: System MUST expose production observability signals (structured logs, correlation IDs, rate-limit metrics, and endpoint health telemetry).
- **FR-012**: System MUST provide backup and restore runbooks for SQL Server and Neo4j production data.

### Key Entities *(include if feature involves data)*

- **ProjectRecord**: Relational metadata for monitored project and ownership context.
- **SbomSnapshotRecord**: Persistent ingest snapshot and processing status.
- **GraphPackageNode / GraphDependencyEdge**: Graph model for package/version dependencies.
- **RiskExceptionRecord**: Durable exception lifecycle state with owner, reason, expiry.
- **AuditEventRecord**: Immutable change log for sensitive actions.
- **AiInteractionRecord**: Explainability metadata including prompt class, evidence refs, latency, model/fallback path.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of core risk records remain available after planned API restart in staging tests.
- **SC-002**: 95% of dependency and impact queries return within 2 seconds at defined staging load.
- **SC-003**: 100% of sensitive endpoint calls enforce role checks with automated test coverage.
- **SC-004**: AI endpoints maintain successful responses for at least 99% of requests with explicit fallback coverage when provider errors are injected.
- **SC-005**: Release pipeline blocks deployment on failed migration, failed tests, or failing `/ready` checks.
- **SC-006**: Backup-restore drill recovers production-like dataset within agreed RTO (<= 30 minutes) and RPO (<= 15 minutes).
