# Tasks: GraphGuard Production Readiness and Persistent Platform

**Input**: Design documents from `/specs/002-production-readiness/`
**Prerequisites**: plan.md (required), spec.md (required)

## Phase 1: Setup

**Goal**: Prepare production-readiness workstream foundations.

- [ ] T001 Create environment configuration matrix for local/staging/prod in `deployments/.env.example` and supporting docs in `docs/`.
- [ ] T002 Define production appsettings templates and secret-key placeholders in `src/api-server/GraphGuard.API/appsettings*.json`.
- [ ] T003 [P] Add database connection configuration contracts and options classes in `src/api-server/GraphGuard.API/`.

## Phase 2: Foundational

**Goal**: Introduce durable persistence and migration scaffolding that blocks all story work.

- [ ] T004 Add SQL Server persistence package references and baseline setup in `src/api-server/GraphGuard.Infrastructure/GraphGuard.Infrastructure.csproj`.
- [ ] T005 Add Neo4j driver/package references and baseline setup in `src/api-server/GraphGuard.Infrastructure/GraphGuard.Infrastructure.csproj`.
- [ ] T006 Implement SQL schema/migration baseline for snapshots, exceptions, and audit data in `src/api-server/GraphGuard.Infrastructure/`.
- [ ] T007 Implement graph schema/bootstrap and indexes for dependency traversal in `src/api-server/GraphGuard.Infrastructure/Graph/`.
- [ ] T008 Replace DI wiring defaults from in-memory adapters to production adapters behind configuration flags in `src/api-server/GraphGuard.API/Program.cs`.

**Checkpoint**: Persistent infrastructure ready; user stories can proceed.

## Phase 3: User Story 1 - Durable Data for Core Workflows (Priority: P1) 🎯 MVP

**Goal**: Ensure no core data loss across restarts.

**Independent Test**: Upload/ingest, exception update, restart API, verify full data continuity.

- [ ] T009 [P] [US1] Implement durable SBOM snapshot repository in `src/api-server/GraphGuard.Infrastructure/Sbom/`.
- [ ] T010 [P] [US1] Implement durable audit event repository in `src/api-server/GraphGuard.Infrastructure/Audit/`.
- [ ] T011 [P] [US1] Implement durable risk exception repository/service persistence in `src/api-server/GraphGuard.Infrastructure/Exceptions/`.
- [ ] T012 [US1] Implement durable dependency graph projection store in `src/api-server/GraphGuard.Infrastructure/Graph/`.
- [ ] T013 [US1] Add restart-persistence integration test for upload -> graph -> exception flow in `src/api-server/` test project.

## Phase 4: User Story 2 - Production-Grade Security and Access Control (Priority: P2)

**Goal**: Enforce real auth and least-privilege controls for sensitive operations.

**Independent Test**: Validate role-based access behavior for protected endpoints.

- [ ] T014 [P] [US2] Add authentication provider configuration and token validation hardening in `src/api-server/GraphGuard.API/Security/`.
- [ ] T015 [P] [US2] Apply authorization policies to remediation, exception, and export endpoints in `src/api-server/GraphGuard.API/Controllers/`.
- [ ] T016 [US2] Add security integration tests for 401/403/200 role matrices in `src/api-server/` test project.
- [ ] T017 [US2] Add security event audit enrichment (actor/role/context) in `src/api-server/GraphGuard.Infrastructure/Audit/`.

## Phase 5: User Story 3 - AI Service Productionization (Priority: P3)

**Goal**: Make AI guidance resilient, explainable, and observable.

**Independent Test**: Verify normal and degraded AI flows with deterministic fallback.

- [ ] T018 [P] [US3] Implement provider abstraction and timeout/retry policy in `src/ai-service/GraphGuard.AI/Services/`.
- [ ] T019 [P] [US3] Add fallback strategy for remediation and NL query services in `src/ai-service/GraphGuard.AI/Services/`.
- [ ] T020 [US3] Persist AI interaction metadata for explainability in `src/api-server/GraphGuard.Infrastructure/`.
- [ ] T021 [US3] Add API response metadata fields for degraded/fallback mode in `src/api-server/GraphGuard.API/Contracts/`.
- [ ] T022 [US3] Add integration tests for provider failure fallback in `src/api-server/` test project.

## Phase 6: User Story 4 - Operational Readiness and Release Safety (Priority: P4)

**Goal**: Enforce reliable release gates and operational recovery capability.

**Independent Test**: Execute staging pipeline + canary + rollback and verify success criteria.

- [ ] T023 [P] [US4] Create CI quality gates for build/test/migration/readiness checks in `.github/workflows/`.
- [ ] T024 [P] [US4] Add staging deployment validation script and rollback runbook in `deployments/` and `docs/`.
- [ ] T025 [US4] Add backup/restore runbook for SQL Server and Neo4j in `docs/`.
- [ ] T026 [US4] Add production telemetry dashboard/alerts guidance in `docs/`.
- [ ] T027 [US4] Run and document canary release checklist execution in `docs/release-checklist.md`.

## Phase 7: Polish and Cross-Cutting

**Goal**: Close release-quality gaps before production cutover.

- [ ] T028 [P] Update root documentation and architecture notes in `README.md` and `docs/`.
- [ ] T029 Validate rate-limit and correlation-id behavior under load in staging and document tuning outcomes in `docs/`.
- [ ] T030 Run full regression validation across upload, graph, remediation, compliance UI flows in `src/web-ui/` and API tests.

## Phase 8: Frontend Visualization with D3.js

**Goal**: Deliver interactive dependency and blast-radius visualization with D3.js for production use.

- [X] T031 [P] [US2] Add D3.js dependency to web UI and define visualization module boundaries in `src/web-ui/package.json` and `src/web-ui/src/features/dependency-graph/`.
- [X] T032 [US2] Implement interactive force-directed graph renderer (zoom/pan/drag/highlight) in `src/web-ui/src/features/dependency-graph/DependencyGraphCanvas.tsx`.
- [X] T033 [US2] Integrate D3 graph with existing filters, selection state, and impact panel in `src/web-ui/src/features/dependency-graph/DependencyExplorerPage.tsx`.
- [ ] T034 [US2] Add accessibility and keyboard fallback interactions for graph nodes/links in `src/web-ui/src/features/dependency-graph/` and `src/web-ui/src/shared/accessibility/`.
- [ ] T035 [US2] Add frontend performance budget and regression checks for large graph rendering in `src/web-ui/` test/validation setup.

## Dependencies and Execution Order

- Phase order: Setup -> Foundational -> US1 -> US2 -> US3 -> US4 -> Polish
- Story dependency graph:
  - US1 depends on foundational persistent infrastructure.
  - US2 depends on foundational security plumbing and can run with late US1 validation.
  - US3 depends on stable persistence and API contracts from US1/US2.
  - US4 depends on completion of at least US1-US3 core behavior.
  - D3 visualization stream (T031-T035) depends on stable US2 graph contracts and should start after API query payloads are confirmed.

## Parallel Execution Examples

- Setup parallel group: T003 with T001/T002 once config targets are agreed.
- Foundational parallel group: T004/T005 can run together before T006/T007.
- US1 parallel group: T009/T010/T011 can run in parallel before T012/T013.
- US3 parallel group: T018/T019 can run in parallel before T020-T022.
- US4 parallel group: T023/T024 can run in parallel before final checklist execution.
- Frontend visualization parallel group: T031 can run with backend hardening; T034/T035 can run in parallel after T032 scaffold is available.

## Implementation Strategy

- MVP first: complete Phase 1 + 2 + US1 to remove production blocker (data durability).
- Incremental hardening: add US2 security, then US3 AI reliability, then US4 release operations.
- Visualization rollout: execute Phase 8 after US2 contract stability and before final release candidate freeze.
- Final gate: execute Phase 7 + Phase 8 with documented evidence prior to production go-live.
