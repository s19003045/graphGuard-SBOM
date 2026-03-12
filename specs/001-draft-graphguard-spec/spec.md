# Feature Specification: GraphGuard SBOM Enterprise Monitoring

**Feature Branch**: `1-draft-graphguard-spec`  
**Created**: 2026-03-12  
**Status**: Draft  
**Input**: Consolidated from `docs/project_des.md`, `docs/frontend_spec.md`, `docs/api-server_spec.md`, and `docs/ai-service_spec.md`

## Overview

GraphGuard SBOM Enterprise Monitoring is a unified platform that helps organizations identify, prioritize, and remediate software supply chain risks across multiple programming languages and projects. The feature set focuses on turning dependency and vulnerability data into actionable security decisions for engineering, security, and compliance stakeholders.

## Problem Statement

Organizations struggle to answer high-impact questions quickly when vulnerabilities appear in transitive dependencies, such as:

- Which projects are affected now?
- How severe is the business impact?
- What remediation path is safest and fastest?
- What actions were taken, by whom, and why?

Without a unified graph-based view and decision workflow, teams face delayed remediation, inconsistent risk handling, and audit gaps.

## Scope

### In Scope

- Multi-language SBOM ingestion and normalization for organization-wide analysis.
- Dependency graph exploration and impact-path analysis.
- Vulnerability and license risk visibility with prioritization.
- Guided remediation recommendations and impact summaries.
- Role-based access control and auditable risk exception workflow.
- Portfolio-level dashboard and project-level investigative workflows.

### Out of Scope

- Automatic code changes or automatic deployment to production.
- Procurement and legal contract workflows outside license risk export.
- Runtime host/infrastructure vulnerability scanning outside software dependency scope.

## User Scenarios & Testing

### Scenario 1: Security Analyst uploads SBOM afnd reviews risk

1. User uploads an SBOM file for a project.
2. System validates and processes the file asynchronously.
3. User receives processing status updates and final findings.
4. User opens project risk details and sees vulnerabilities, license risks, and dependency paths.

Acceptance checks:

- Upload result is acknowledged immediately with a trackable processing status.
- Invalid or malformed files return clear rejection reasons.
- Processed result includes total dependencies, vulnerable dependencies, and high-risk licenses.

### Scenario 2: Engineering Manager performs blast radius analysis

1. User selects a vulnerable package version.
2. System highlights directly and indirectly affected projects.
3. User filters impacted projects by severity, language, and business criticality.
4. User exports the impacted project list for team follow-up.

Acceptance checks:

- The system displays direct and indirect impact separately.
- Filter changes update the visible impact set without losing context.
- Exported data matches the on-screen filtered result.

### Scenario 3: Developer consumes remediation guidance

1. User opens vulnerability details for a project dependency.
2. System presents a concise risk summary and remediation options.
3. User reviews compatibility risk notes and chooses an option.
4. User copies recommended upgrade instructions for execution in their workflow.

Acceptance checks:

- At least one remediation option is shown for every actionable vulnerability.
- Guidance includes expected risk trade-offs (for example: lower risk but more upgrade effort).
- Copy action provides complete, usable instructions.

### Scenario 4: Compliance Officer manages license and exception audit

1. User reviews projects with restricted or high-risk licenses.
2. User creates a time-bound risk exception with required reason.
3. System records the action in audit history.
4. User exports compliance records for internal or external review.

Acceptance checks:

- Exception creation requires reason, owner, and expiration.
- Every exception change is traceable in audit history.
- Export includes who changed what and when.

## Functional Requirements

### Ingestion and Data Preparation

- FR-001: The system shall accept SBOM uploads for at least Node.js and Python ecosystems.
- FR-002: The system shall validate SBOM format and required fields before processing.
- FR-003: The system shall process accepted SBOM uploads asynchronously and expose progress states (queued, processing, completed, failed).
- FR-004: The system shall normalize package identity so cross-project and cross-language dependencies can be analyzed consistently.

### Dependency Graph and Analysis

- FR-005: The system shall provide project-level dependency tree exploration with depth-aware traversal.
- FR-006: The system shall provide blast radius analysis for a selected vulnerable package version, including direct and indirect impact paths.
- FR-007: The system shall detect and flag circular dependency paths within a project.
- FR-008: The system shall support interactive filtering by vulnerability severity, project language, and license risk level.

### Vulnerability and Compliance

- FR-009: The system shall continuously match known vulnerabilities against tracked package versions and refresh findings on a recurring schedule.
- FR-010: The system shall classify license findings and flag policy-violating licenses as high risk.
- FR-011: The system shall allow authorized users to create, update, and revoke risk exceptions with mandatory justification and expiry.

### AI-Assisted Decision Support

- FR-012: The system shall provide a plain-language vulnerability summary that includes exploitability context and business impact cues.
- FR-013: The system shall generate at least one remediation path for actionable findings and provide a confidence or risk note for each path.
- FR-014: The system shall support natural-language security questions and return explainable, query-backed results for tracked dependency and vulnerability data.

### Access, Audit, and Reporting

- FR-015: The system shall enforce role-based permissions for sensitive actions (for example: deleting scans, managing exceptions, exporting compliance evidence).
- FR-016: The system shall produce immutable audit records for all risk-state changes and exception actions.
- FR-017: The system shall provide exportable reports for vulnerability posture, impact analysis, and license compliance review.

## Non-Functional Requirements

- NFR-001: Users can complete a standard project risk triage workflow (upload to prioritized finding list) in under 5 minutes for typical project sizes.
- NFR-002: 95% of interactive filtering and drill-down actions return updated results in under 2 seconds under normal operating load.
- NFR-003: The platform maintains at least 99.5% monthly availability for core read and analysis workflows.
- NFR-004: Audit records are retained for at least 12 months and remain searchable by actor, project, and action type.
- NFR-005: All user-visible error states provide recovery guidance (retry, fix input, or contact path) without exposing sensitive internal details.

## Edge Cases

- Very large SBOM input causing prolonged processing.
- Duplicate project uploads for near-identical snapshots.
- Vulnerability feeds with missing metadata or delayed updates.
- Package naming collisions across ecosystems.
- False-positive vulnerabilities requiring exception workflows.
- Simultaneous updates to the same exception record.
- Graph views with dense dependencies that risk visual overload.

## Key Entities

- Project: Business-owned software asset being monitored.
- SBOM Snapshot: Imported dependency inventory state for a project at a point in time.
- Package Version: Normalized component identity and version used by one or more projects.
- Dependency Relationship: Directed edge between package versions indicating usage.
- Vulnerability Finding: Mapped risk record linking a package version to a known issue.
- License Finding: Policy evaluation record for dependency license obligations.
- Risk Exception: Time-bound decision to defer or suppress a finding with justification.
- Remediation Recommendation: Suggested mitigation option with expected impact and risk note.
- Audit Event: Immutable action record with actor, timestamp, and change summary.

## Dependencies

- External vulnerability intelligence source availability.
- Organizational policy definitions for risk and license classification.
- Access to project SBOM generation outputs from development teams.
- Identity provider integration for role-based access and accountability.

## Assumptions

- Teams can supply valid SBOM files generated from their build pipelines.
- Security and legal policies are available and approved before enforcement rollout.
- Users primarily access the platform via desktop browsers in internal networks.
- Risk exception ownership and review cadence are governed by an existing internal process.

## Success Criteria

- SC-001: 90% of newly uploaded projects receive a completed risk assessment view within 10 minutes of upload.
- SC-002: Security teams can identify all affected projects for a newly disclosed high-severity package issue in under 3 minutes.
- SC-003: Mean time from vulnerability discovery to documented remediation decision decreases by at least 30% within one quarter of adoption.
- SC-004: At least 95% of risk exceptions contain complete justification, owner, and expiry metadata at creation time.
- SC-005: Compliance export preparation time for periodic review is reduced by at least 50% compared with the current manual workflow.
- SC-006: At least 80% of users in security triage roles report improved confidence in remediation prioritization after one release cycle.