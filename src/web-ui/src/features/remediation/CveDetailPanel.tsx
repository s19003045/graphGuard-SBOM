import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import { Card, CardContent, Chip, Divider, Stack, Typography } from "@mui/material";

type CveDetailPanelProps = {
  cveId: string;
  severity: "critical" | "high" | "medium" | "low";
  affectedPackage: string;
  summary: string;
  vector?: string;
};

export function CveDetailPanel({ cveId, severity, affectedPackage, summary, vector }: CveDetailPanelProps) {
  const severityColor =
    severity === "critical" ? "error" : severity === "high" ? "warning" : severity === "medium" ? "info" : "default";

  return (
    <Card>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <BugReportOutlinedIcon color="error" />
            <Typography variant="h6">CVE Detail</Typography>
            <Chip size="small" color={severityColor} label={severity.toUpperCase()} />
          </Stack>

          <Typography variant="subtitle2">{cveId}</Typography>
          <Typography variant="body2" color="text.secondary">
            Affected package: {affectedPackage}
          </Typography>

          <Divider />

          <Typography variant="body2">{summary}</Typography>
          {vector && (
            <Typography variant="caption" color="text.secondary">
              Attack vector: {vector}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
