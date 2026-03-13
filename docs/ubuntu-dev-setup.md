# Ubuntu Development Setup Guide

Date: 2026-03-13
Project: GraphGuard SBOM

## 1. Prerequisites

- Ubuntu 22.04 LTS or newer
- Git
- .NET SDK 10.x
- Node.js 22.x
- npm (bundled with Node.js)

## 2. Install Required Tooling

### 2.1 System packages

```bash
sudo apt update
sudo apt install -y git curl ca-certificates gnupg
```

### 2.2 Install .NET SDK 10.x

```bash
wget https://packages.microsoft.com/config/ubuntu/$(lsb_release -rs)/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb

sudo apt update
sudo apt install -y dotnet-sdk-10.0
```

Verify:

```bash
dotnet --info
```

### 2.3 Install Node.js 22.x with nvm

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# restart terminal or source profile
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

nvm install 22
nvm use 22
node -v
npm -v
```

## 3. Clone and Initialize Workspace

```bash
git clone <your-repo-url>
cd graphGuard-SBOM
```

## 4. Build Commands

### 4.1 Backend

```bash
dotnet build src/api-server/GraphGuard.sln
```

### 4.2 Frontend

```bash
npm install --prefix src/web-ui
npm run build --prefix src/web-ui
```

## 5. Run Locally

### 5.1 Start API server

```bash
dotnet run --project src/api-server/GraphGuard.API --urls http://localhost:5099
```

### 5.2 Start web UI (new terminal)

```bash
nvm use 22
npm run dev --prefix src/web-ui
```

## 6. Runtime Verification

Check health endpoints:

```bash
curl -i http://localhost:5099/health
curl -i http://localhost:5099/ready
```

Expected:

- HTTP 200 for both endpoints
- `X-Correlation-Id` present in response headers

## 7. Linux-Specific Notes

- Path separators use `/` (not `\\`).
- Case sensitivity matters in Linux file systems.
- If API data appears to reset after restart, this is expected in current in-memory implementation.

## 8. Troubleshooting

### 8.1 Port 5099 already in use

```bash
sudo lsof -i :5099
kill -9 <PID>
```

### 8.2 Node version mismatch

```bash
nvm use 22
node -v
```

### 8.3 Build uses stale artifacts

```bash
dotnet clean src/api-server/GraphGuard.sln
dotnet build src/api-server/GraphGuard.sln
```

### 8.4 Frontend dependency issues

```bash
rm -rf src/web-ui/node_modules src/web-ui/package-lock.json
npm install --prefix src/web-ui
```
