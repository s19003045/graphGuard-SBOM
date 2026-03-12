# Quickstart: GraphGuard SBOM Enterprise Monitoring

This quickstart describes a practical implementation sequence based on `docs/spec.md` and `docs/plan.md`.

## 1. Milestone Sequence

1. Milestone A: Ingestion and status tracking
2. Milestone B: Findings and dependency exploration
3. Milestone C: Impact analysis and exception workflow
4. Milestone D: AI-assisted remediation guidance
5. Milestone E: Reporting, audit completeness, and hardening

## 2. Milestone Exit Criteria

### Milestone A

- SBOM upload accepted with asynchronous status lifecycle
- Failed and malformed inputs produce clear error reasons
- Snapshot summary metrics available after completion

### Milestone B

- Project dependency views with depth and filtering
- Findings list includes vulnerability and license risks

### Milestone C

- Blast radius analysis exposes direct and indirect impact
- Exception create/update/revoke workflow enforces required metadata
- Audit trail generated for each risk-state change

### Milestone D

- Remediation options returned with confidence/risk notes
- Natural-language query returns explainable evidence-backed result

### Milestone E

- Role-gated posture/impact/license exports available
- Non-functional checks pass for responsiveness and reliability targets

## 3. Validation Checklist (Execution-Level)

- Primary user scenarios from `docs/spec.md` can be executed end-to-end.
- FR-001..FR-017 all have at least one implementation and validation task.
- NFR-001..NFR-005 are mapped to measurable checks.
- No sensitive action path bypasses RBAC and audit logging.

## 4. Suggested Learning-Oriented Build Rhythm

- Build in thin vertical slices: one user scenario at a time.
- For each slice, include: contract definition, implementation, tests, and short retrospective note.
- Keep a changelog of architectural decisions to support later design reviews.
