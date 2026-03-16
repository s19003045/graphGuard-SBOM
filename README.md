# GraphGuard SBOM

GraphGuard SBOM is a monorepo for software supply chain visibility and risk management.
It ingests SBOM documents (CycloneDX/SPDX), builds per-project dependency graphs, and provides security/compliance workflows including impact analysis, remediation recommendations, and risk exception auditing.

## Current Scope

- Backend API: ASP.NET Core (`net10.0`)
- Frontend: React + TypeScript + Vite + MUI
- AI service layer: mock/rule-based remediation and natural-language query orchestration
- Data storage: in-memory (development-focused, resets after process restart)

## Key Features

- SBOM upload and async ingestion status tracking
- Dependency Explorer (search, sort, pagination, filters)
- Blast radius / package impact analysis
- CVE remediation recommendations
- Natural language security query endpoint
- Risk exception workflow with audit trail
- License compliance report export (API + UI CSV export)
- Operational hardening:
  - `/health` and `/ready`
  - Correlation ID propagation (`X-Correlation-Id`)
  - Global rate limiting

## Monorepo Structure

```text
graphGuard-SBOM/
├─ docs/                         # specs and setup docs
├─ specs/                        # spec-driven task tracking artifacts
├─ src/
│  ├─ api-server/                # ASP.NET Core API + Domain + Infrastructure
│  ├─ ai-service/                # AI orchestration services
│  └─ web-ui/                    # React frontend
└─ package.json                  # workspace-level metadata
```

## Prerequisites

- .NET SDK 10.x
- Node.js 22.x
- npm (bundled with Node.js)

## Quick Start

### 1) Restore / Install

```bash
# backend
dotnet restore src/api-server/GraphGuard.sln

# frontend
npm install --prefix src/web-ui
```

### 2) Run API

```bash
dotnet run --project src/api-server/GraphGuard.API --urls http://localhost:5099
```

### 3) Run Web UI (new terminal)

```bash
npm run dev --prefix src/web-ui
```

Default URLs:

- API: `http://localhost:5099`
- Web UI (Vite): usually `http://localhost:5173`

### 4) Verify Runtime

```bash
curl -i http://localhost:5099/health
curl -i http://localhost:5099/ready
```

Expected:

- HTTP 200 from both endpoints
- `X-Correlation-Id` response header present

## Build Commands

```bash
# backend
dotnet build src/api-server/GraphGuard.sln

# frontend
npm run build --prefix src/web-ui
```

## Primary API Endpoints

- `POST /api/v1/sbom/uploads`
- `GET /api/v1/sbom/uploads/{snapshotId}`
- `GET /api/v1/projects/{projectId}/dependencies`
- `GET /api/v1/packages/{packageVersionId}/impact`
- `POST /api/v1/remediation/recommend`
- `POST /api/v1/query/natural-language`
- `POST /api/v1/vulnerabilities/{findingId}/exceptions`
- `PATCH /api/v1/vulnerabilities/{findingId}/exceptions/{riskExceptionId}`
- `GET /api/v1/reports/license-compliance`
- `GET /health`
- `GET /ready`

## Development Notes

- Current repositories/stores are in-memory for rapid iteration.
- Restarting the API clears uploaded snapshots, graphs, and exception/audit runtime state.
- This is expected in the current phase; persistence is a recommended next step for production readiness.

## Documentation

- Project description: `docs/project_des.md`
- API-oriented spec notes: `docs/api-server_spec.md`
- Frontend-oriented spec notes: `docs/frontend_spec.md`
- Ubuntu setup guide: `docs/ubuntu-dev-setup.md`
- Release checklist: `docs/release-checklist.md`

## Suggested Next Improvements

1. Replace in-memory stores with persistent storage.
2. Add integration and E2E test coverage for critical flows.
3. Add CI matrix validation for Windows + Ubuntu.
