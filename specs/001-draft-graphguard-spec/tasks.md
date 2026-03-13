# Tasks: GraphGuard SBOM Enterprise Monitoring

**Input**: Design artifacts from docs/
**Prerequisites**: docs/spec.md, docs/plan.md, docs/research.md, docs/data-model.md, docs/contracts/http-api.md, docs/contracts/realtime-events.md

## Phase 1: Setup

**Goal**: Establish monorepo structure and baseline engineering configuration.

- [X] T001 Create solution and project skeleton in src/api-server/GraphGuard.sln
- [X] T002 Create API host project scaffold in src/api-server/GraphGuard.API/GraphGuard.API.csproj
- [X] T003 Create domain project scaffold in src/api-server/GraphGuard.Domain/GraphGuard.Domain.csproj
- [X] T004 Create infrastructure project scaffold in src/api-server/GraphGuard.Infrastructure/GraphGuard.Infrastructure.csproj
- [X] T005 [P] Create AI service project scaffold in src/ai-service/GraphGuard.AI/GraphGuard.AI.csproj
- [X] T006 [P] Create frontend app scaffold in src/web-ui/package.json
- [X] T007 [P] Add repository-wide ignore and editor settings in .gitignore
- [X] T008 [P] Add environment variable template for local development in deployments/.env.example
- [X] T009 Add local compose baseline for dependent services in deployments/docker-compose.yml

## Phase 2: Foundational

**Goal**: Implement blocking platform capabilities required by all user stories.

- [X] T010 Configure API dependency injection and startup modules in src/api-server/GraphGuard.API/Program.cs
- [X] T011 Define shared API error envelope and middleware in src/api-server/GraphGuard.API/Middleware/ErrorHandlingMiddleware.cs
- [X] T012 Define RBAC roles and policy constants in src/api-server/GraphGuard.Domain/Security/Roles.cs
- [X] T013 Implement authentication and authorization middleware wiring in src/api-server/GraphGuard.API/Security/AuthConfiguration.cs
- [X] T014 Create audit event domain model and repository contract in src/api-server/GraphGuard.Domain/Audit/AuditEvent.cs
- [X] T015 Implement audit persistence adapter in src/api-server/GraphGuard.Infrastructure/Audit/AuditEventRepository.cs
- [X] T016 Define normalized package identity value object in src/api-server/GraphGuard.Domain/Packages/PackageIdentity.cs
- [X] T017 Create shared ingestion status enum and transition guard in src/api-server/GraphGuard.Domain/Sbom/IngestStatus.cs
- [X] T018 Add API contract DTOs for common pagination and filters in src/api-server/GraphGuard.API/Contracts/CommonDtos.cs
- [X] T019 Create frontend route shell and protected layout in src/web-ui/src/app/routes.tsx

## Phase 3: User Story 1 - Upload SBOM and review risk (P1)

**Story Goal**: Security analyst uploads SBOM and receives asynchronous processing status with result summary.

**Independent Test Criteria**:
- Upload request returns accepted response with snapshot identifier.
- Status endpoint shows queued to processing to completed or failed transitions.
- Completed snapshot exposes package and risk summary fields.

- [X] T020 [US1] Implement upload request contract in src/api-server/GraphGuard.API/Contracts/SbomUploadRequest.cs
- [X] T021 [US1] Implement upload accepted response contract in src/api-server/GraphGuard.API/Contracts/SbomUploadAcceptedResponse.cs
- [X] T022 [US1] Implement SBOM upload API endpoint in src/api-server/GraphGuard.API/Controllers/SbomUploadController.cs
- [X] T023 [US1] Implement SBOM snapshot domain model in src/api-server/GraphGuard.Domain/Sbom/SbomSnapshot.cs
- [X] T024 [US1] Implement SBOM snapshot repository contract in src/api-server/GraphGuard.Domain/Sbom/ISbomSnapshotRepository.cs
- [X] T025 [US1] Implement SBOM snapshot repository adapter in src/api-server/GraphGuard.Infrastructure/Sbom/SbomSnapshotRepository.cs
- [X] T026 [US1] Implement asynchronous ingestion queue service in src/api-server/GraphGuard.Infrastructure/Sbom/IngestionQueueService.cs
- [X] T027 [US1] Implement ingestion background worker in src/api-server/GraphGuard.API/Workers/SbomIngestionWorker.cs
- [X] T028 [US1] Implement ingestion status query endpoint in src/api-server/GraphGuard.API/Controllers/SbomStatusController.cs
- [X] T029 [P] [US1] Implement realtime status event publisher in src/api-server/GraphGuard.Infrastructure/Events/IngestionStatusEventPublisher.cs
- [X] T030 [P] [US1] Implement SBOM upload page UI in src/web-ui/src/features/sbom-upload/SbomUploadPage.tsx
- [X] T031 [P] [US1] Implement upload status polling and state store in src/web-ui/src/features/sbom-upload/useSbomUploadStatus.ts
- [X] T032 [US1] Implement findings summary cards UI in src/web-ui/src/features/dashboard/RiskSummaryCards.tsx
- [X] T072 [US1] Implement SBOM file picker upload flow (read local .json and submit as sbomDocument) in src/web-ui/src/features/sbom-upload/SbomUploadPage.tsx
- [X] T073 [US1] Add API-side SBOM payload validation and upload contract hardening for file-based ingestion in src/api-server/GraphGuard.API/Controllers/SbomUploadController.cs

## Phase 4: User Story 2 - Blast radius and dependency analysis (P2)

**Story Goal**: Engineering manager can inspect dependency graph and determine direct and indirect impact.

**Independent Test Criteria**:
- Dependency graph query returns traversable nodes and edges by project.
- Blast radius endpoint returns separated direct and indirect impact sets.
- Filter controls update result set while preserving selected context.

- [X] T033 [US2] Implement dependency node and edge contracts in src/api-server/GraphGuard.API/Contracts/DependencyGraphDtos.cs
- [X] T034 [US2] Implement package version and dependency edge entities in src/api-server/GraphGuard.Domain/Graph/DependencyEdge.cs
- [X] T035 [US2] Implement graph query service contract in src/api-server/GraphGuard.Domain/Graph/IDependencyGraphQueryService.cs
- [X] T036 [US2] Implement graph query service adapter in src/api-server/GraphGuard.Infrastructure/Graph/DependencyGraphQueryService.cs
- [X] T037 [US2] Implement project dependency endpoint in src/api-server/GraphGuard.API/Controllers/ProjectDependenciesController.cs
- [X] T038 [US2] Implement blast radius endpoint in src/api-server/GraphGuard.API/Controllers/PackageImpactController.cs
- [X] T039 [US2] Implement circular dependency detection use case in src/api-server/GraphGuard.Domain/Graph/CycleDetectionService.cs
- [X] T040 [P] [US2] Implement dependency explorer page UI in src/web-ui/src/features/dependency-graph/DependencyExplorerPage.tsx
- [X] T041 [P] [US2] Implement blast radius impact panel UI in src/web-ui/src/features/dependency-graph/BlastRadiusPanel.tsx
- [X] T042 [P] [US2] Implement graph filters and query param sync in src/web-ui/src/features/dependency-graph/useGraphFilters.ts
- [X] T043 [US2] Implement impact export action in src/web-ui/src/features/dependency-graph/exportImpactCsv.ts

## Phase 5: User Story 3 - Remediation guidance and explainable AI query (P3)

**Story Goal**: Developer receives remediation options and can ask natural language security questions with explainable results.

**Independent Test Criteria**:
- Remediation endpoint returns ranked options with confidence and risk notes.
- Natural language query endpoint returns answer with evidence metadata.
- UI allows copy-ready remediation instructions for selected option.

- [X] T044 [US3] Implement remediation recommendation contract in src/api-server/GraphGuard.API/Contracts/RemediationDtos.cs
- [X] T045 [US3] Implement recommendation domain entity in src/api-server/GraphGuard.Domain/Remediation/RemediationRecommendation.cs
- [X] T046 [US3] Implement AI recommendation service contract in src/ai-service/GraphGuard.AI/Services/IRemediationService.cs
- [X] T047 [US3] Implement recommendation generation service in src/ai-service/GraphGuard.AI/Services/RemediationService.cs
- [X] T048 [US3] Implement remediation API endpoint in src/api-server/GraphGuard.API/Controllers/RemediationController.cs
- [X] T049 [US3] Implement natural language query contract in src/api-server/GraphGuard.API/Contracts/NaturalLanguageQueryDtos.cs
- [X] T050 [US3] Implement NL query orchestration service in src/ai-service/GraphGuard.AI/Services/NaturalLanguageQueryService.cs
- [X] T051 [US3] Implement natural language query endpoint in src/api-server/GraphGuard.API/Controllers/NaturalLanguageQueryController.cs
- [X] T052 [P] [US3] Implement CVE detail side panel UI in src/web-ui/src/features/remediation/CveDetailPanel.tsx
- [X] T053 [P] [US3] Implement remediation options dialog UI in src/web-ui/src/features/remediation/RemediationDialog.tsx
- [X] T054 [P] [US3] Implement natural language query widget UI in src/web-ui/src/features/remediation/NaturalLanguageQueryWidget.tsx

## Phase 6: User Story 4 - Compliance exception and audit export (P4)

**Story Goal**: Compliance officer can manage risk exceptions and export governance evidence.

**Independent Test Criteria**:
- Exception creation requires reason, owner, and expiration.
- Exception updates create immutable audit entries.
- Compliance export contains actor, action, target, and timestamp metadata.

- [X] T055 [US4] Implement vulnerability and license finding entities in src/api-server/GraphGuard.Domain/Findings/VulnerabilityFinding.cs
- [X] T056 [US4] Implement risk exception entity and state transitions in src/api-server/GraphGuard.Domain/Exceptions/RiskException.cs
- [X] T057 [US4] Implement exception command contracts in src/api-server/GraphGuard.API/Contracts/RiskExceptionDtos.cs
- [X] T058 [US4] Implement exception service contract in src/api-server/GraphGuard.Domain/Exceptions/IRiskExceptionService.cs
- [X] T059 [US4] Implement exception service adapter in src/api-server/GraphGuard.Infrastructure/Exceptions/RiskExceptionService.cs
- [X] T060 [US4] Implement exception create and update endpoints in src/api-server/GraphGuard.API/Controllers/RiskExceptionController.cs
- [X] T061 [US4] Implement compliance report export endpoint in src/api-server/GraphGuard.API/Controllers/ComplianceReportController.cs
- [X] T062 [P] [US4] Implement compliance dashboard page UI in src/web-ui/src/features/compliance/ComplianceDashboardPage.tsx
- [X] T063 [P] [US4] Implement exception management form UI in src/web-ui/src/features/compliance/RiskExceptionForm.tsx
- [X] T064 [P] [US4] Implement audit timeline table UI in src/web-ui/src/features/compliance/AuditTimelineTable.tsx
- [X] T065 [US4] Implement compliance export action UI in src/web-ui/src/features/compliance/ExportComplianceButton.tsx

## Phase 7: Polish and Cross-Cutting

**Goal**: Complete operational hardening, quality gates, and release readiness checks.

- [X] T066 Add health and readiness endpoints in src/api-server/GraphGuard.API/Controllers/HealthController.cs
- [X] T067 Implement structured logging enrichment and correlation in src/api-server/GraphGuard.API/Observability/LoggingConfiguration.cs
- [X] T068 Add API rate limiting and abuse safeguards in src/api-server/GraphGuard.API/Security/RateLimitingConfiguration.cs
- [X] T069 Add frontend loading and empty state standards in src/web-ui/src/shared/ui/AsyncState.tsx
- [X] T070 Add accessibility and keyboard interaction refinements for graph and dialogs in src/web-ui/src/shared/accessibility/a11yEnhancements.ts
- [X] T071 Add release checklist and rollout notes in docs/release-checklist.md

## Dependencies and Execution Order

- Phase order: Setup -> Foundational -> US1 -> US2 -> US3 -> US4 -> Polish
- Story dependency graph:
  - US1 is MVP baseline and has no story dependency.
  - US2 depends on US1 ingestion outputs.
  - US3 depends on US1 findings availability and can run in parallel with late US2 UI refinements.
  - US4 depends on US1 findings and foundational audit capabilities; can run in parallel with US3 after T055.

## Parallel Execution Examples

- US1 parallel group: T029, T030, T031 can run after T028 starts returning status payloads.
- US2 parallel group: T040, T041, T042 can run in parallel once T037 and T038 contracts are stable.
- US3 parallel group: T052, T053, T054 can run in parallel once T048 and T051 response contracts are finalized.
- US4 parallel group: T062, T063, T064 can run in parallel once T060 endpoint payloads are stable.

## Implementation Strategy

- MVP first: complete Phase 1, Phase 2, and Phase 3 (US1) for end-to-end ingestion and triage baseline.
- Incremental delivery: add US2 for impact analysis, then US3 for AI assist, then US4 for compliance governance.
- Hardening last: execute Phase 7 to close operational quality gates before production rollout.
