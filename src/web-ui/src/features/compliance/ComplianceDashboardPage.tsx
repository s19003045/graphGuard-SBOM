import { Stack, Typography } from "@mui/material";
import { AuditTimelineTable } from "./AuditTimelineTable";
import { ExportComplianceButton } from "./ExportComplianceButton";
import { RiskExceptionForm } from "./RiskExceptionForm";

export function ComplianceDashboardPage() {
  return (
    <Stack spacing={2}>
      <Typography variant="h5">Compliance Command Center</Typography>
      <RiskExceptionForm />
      <ExportComplianceButton />
      <AuditTimelineTable />
    </Stack>
  );
}
