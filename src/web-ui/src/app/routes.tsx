import { Navigate, Route, Routes } from "react-router-dom";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { alpha, Box, Chip, Container, IconButton, Stack, Tooltip, Typography, useTheme } from "@mui/material";
import { RiskSummaryCards } from "../features/dashboard/RiskSummaryCards";
import { DependencyExplorerPage } from "../features/dependency-graph/DependencyExplorerPage";
import { CveDetailPanel } from "../features/remediation/CveDetailPanel";
import { NaturalLanguageQueryWidget } from "../features/remediation/NaturalLanguageQueryWidget";
import { RemediationDialog } from "../features/remediation/RemediationDialog";
import { SbomUploadPage } from "../features/sbom-upload/SbomUploadPage";
import { AppThemeMode } from "../theme/graphGuardTheme";

type AppRoutesProps = {
  themeMode: AppThemeMode;
  onToggleThemeMode: () => void;
};

function ProtectedLayout({ themeMode, onToggleThemeMode }: AppRoutesProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `radial-gradient(circle at 0% 0%, ${alpha(theme.palette.primary.main, 0.16)}, transparent 38%), radial-gradient(circle at 100% 0%, ${alpha(theme.palette.secondary.main, 0.16)}, transparent 34%)`
      }}
    >
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Stack spacing={3}>
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "flex-start", sm: "center" }}>
                <Typography variant="h4">GraphGuard Command Center</Typography>
                <Chip label="SBOM Risk Ops" color="primary" size="small" />
              </Stack>
              <Tooltip title={themeMode === "light" ? "Switch to dark mode" : "Switch to light mode"}>
                <IconButton onClick={onToggleThemeMode} color="primary">
                  {themeMode === "light" ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
                </IconButton>
              </Tooltip>
            </Stack>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Track ingestion health, monitor high-risk dependencies, and act quickly on supply-chain exposure.
            </Typography>
          </Box>
          <RiskSummaryCards />
          <SbomUploadPage />
          <DependencyExplorerPage />
          <CveDetailPanel
            cveId="CVE-2026-12345"
            severity="high"
            affectedPackage="lodash@4.17.15"
            summary="Prototype pollution risk in vulnerable lodash versions when untrusted input is merged without validation."
            vector="network"
          />
          <RemediationDialog findingId="CVE-2026-12345" projectContext="demo-project" />
          <NaturalLanguageQueryWidget />
        </Stack>
      </Container>
    </Box>
  );
}

export function AppRoutes(props: AppRoutesProps) {
  return (
    <Routes>
      <Route path="/" element={<ProtectedLayout {...props} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
