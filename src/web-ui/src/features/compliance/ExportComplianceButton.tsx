import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import { Alert, Button, Stack, Typography } from "@mui/material";
import { useState } from "react";

type ComplianceRecord = {
  auditEventId: string;
  actorId: string;
  actionType: string;
  targetType: string;
  targetId: string;
  changeSummary: string;
  eventTimestamp: string;
};

function escapeCsv(value: string) {
  const text = value ?? "";
  if (text.includes(",") || text.includes("\"") || text.includes("\n")) {
    return `"${text.replaceAll("\"", "\"\"")}"`;
  }

  return text;
}

export function ExportComplianceButton() {
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onExport = async () => {
    setIsExporting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/v1/reports/license-compliance");
      if (!response.ok) {
        throw new Error("export failed");
      }

      const payload = (await response.json()) as { records: ComplianceRecord[] };
      const rows = payload.records ?? [];

      const header = "auditEventId,actorId,actionType,targetType,targetId,changeSummary,eventTimestamp";
      const body = rows
        .map((row) =>
          [
            row.auditEventId,
            row.actorId,
            row.actionType,
            row.targetType,
            row.targetId,
            row.changeSummary,
            row.eventTimestamp
          ]
            .map(escapeCsv)
            .join(",")
        )
        .join("\n");

      const csv = `${header}\n${body}`;
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `compliance-report-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch {
      setErrorMessage("Unable to export compliance report.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Stack spacing={1}>
      <Button variant="outlined" startIcon={<DownloadOutlinedIcon />} onClick={onExport} disabled={isExporting}>
        {isExporting ? "Exporting..." : "Export Compliance CSV"}
      </Button>
      {errorMessage && (
        <Alert severity="error">
          <Typography variant="body2">{errorMessage}</Typography>
        </Alert>
      )}
    </Stack>
  );
}
