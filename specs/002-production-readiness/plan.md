# Implementation Plan: GraphGuard Production Readiness and Persistent Platform

**Branch**: `002-production-readiness` | **Date**: 2026-03-16 | **Spec**: `specs/002-production-readiness/spec.md`
**Input**: Feature specification from `/specs/002-production-readiness/spec.md`

## Summary

This phase transitions GraphGuard from development-grade in-memory behavior to production-ready operation by introducing durable data stores (SQL Server + Neo4j), hardening access/security, productionizing AI orchestration, and enforcing CI/CD operational gates.

## Technical Context

**Language/Version**: C# (.NET 10), TypeScript (Node.js 22)  
**Primary Dependencies**: ASP.NET Core, React, Vite, MUI, Neo4j .NET driver (planned), SQL Server provider/ORM (planned)  
**Storage**: SQL Server + Neo4j (+ optional vector store such as Azure AI Search or Qdrant for AI memory)  
**Testing**: .NET test stack + frontend test/E2E stack (to be finalized in research)  
**Target Platform**: Linux/Windows containerized deployment  
**Project Type**: Web platform (API + AI service + frontend)  
**Performance Goals**: p95 graph/filter queries <= 2s; stable ingestion throughput under production-like payloads  
**Constraints**: No data loss on restart; role-gated sensitive actions; migration-safe releases  
**Scale/Scope**: Organization-level multi-project dependency monitoring and compliance evidence generation

## Constitution Check

- Security/accountability gates: PASS (explicit RBAC + immutable audit requirements)
- Reliability gates: PASS (backup/restore, health/readiness, CI deploy gates)
- Explainability gates: PASS (AI metadata persistence + fallback behavior)
- Clarification gaps: OPEN
  - Vector store final selection (Azure AI Search vs Qdrant)
  - ORM strategy for SQL Server persistence in API layer

## Project Structure

### Documentation (this feature)

```text
specs/002-production-readiness/
├── plan.md
├── spec.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── api-server/
│   ├── GraphGuard.API/
│   ├── GraphGuard.Domain/
│   └── GraphGuard.Infrastructure/
├── ai-service/
│   └── GraphGuard.AI/
└── web-ui/

docs/
deployments/
```

**Structure Decision**: Keep existing monorepo structure and add production adapters/configuration in current API and infrastructure projects.

## Phase Plan

### Phase 0 - Research and Tech Decisions

- Finalize SQL Server persistence strategy (EF Core vs lightweight data access approach).
- Finalize Neo4j integration strategy for write/read projections and query patterns.
- Finalize AI provider strategy and vector memory option.
- Define migration/versioning and rollback approach.

### Phase 1 - Data and Contract Design

- Define relational schema and migration baseline for durable entities.
- Define graph model persistence contracts for package/version/edge writes.
- Define AI interaction telemetry contract (prompt class, model path, fallback, latency, evidence refs).
- Define backup/restore and environment configuration contracts.

### Phase 2 - Implementation Streams

- Stream A: Replace in-memory repositories with SQL Server + Neo4j adapters.
- Stream B: Harden authn/authz and sensitive endpoint policy enforcement.
- Stream C: Productionize AI orchestration with fallback and explainability telemetry.
- Stream D: Add CI/CD quality gates and deployment-time readiness checks.
- Stream E: Add integration/E2E coverage for critical journeys.

### Phase 3 - Validation and Release Readiness

- Run migration and rollback drills in staging.
- Run load/perf validation for graph and ingestion workflows.
- Run backup/restore drill with target RTO/RPO.
- Execute release checklist and canary verification before production promotion.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Multiple storage engines (SQL + Neo4j) | Workload-optimized persistence for transactional and graph queries | Single relational store would degrade traversal and blast-radius analysis performance |
| Optional vector store | Needed for policy-aligned semantic memory and explainability quality | Pure prompt-only approach reduces consistency and evidence quality |
