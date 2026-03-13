import {
  Alert,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import { useEffect, useState } from "react";

type ComplianceRecord = {
  auditEventId: string;
  actorId: string;
  actionType: string;
  targetType: string;
  targetId: string;
  changeSummary: string;
  eventTimestamp: string;
};

export function AuditTimelineTable() {
  const [records, setRecords] = useState<ComplianceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const abort = new AbortController();

    async function load() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch("/api/v1/reports/license-compliance", { signal: abort.signal });
        if (!response.ok) {
          throw new Error("load failed");
        }

        const payload = (await response.json()) as { records: ComplianceRecord[] };
        setRecords(payload.records ?? []);
      } catch {
        if (!abort.signal.aborted) {
          setErrorMessage("Unable to load audit timeline.");
        }
      } finally {
        if (!abort.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => abort.abort();
  }, []);

  return (
    <Card>
      <CardContent>
        <Stack spacing={1.5}>
          <Typography variant="h6">Audit Timeline</Typography>

          {isLoading && (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={18} />
              <Typography variant="body2">Loading audit records...</Typography>
            </Stack>
          )}

          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          {!isLoading && !errorMessage && (
            <TableContainer sx={{ maxHeight: 360 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Actor</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Target</TableCell>
                    <TableCell>Summary</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.auditEventId}>
                      <TableCell>{new Date(record.eventTimestamp).toLocaleString()}</TableCell>
                      <TableCell>{record.actorId}</TableCell>
                      <TableCell>{record.actionType}</TableCell>
                      <TableCell>{`${record.targetType}:${record.targetId}`}</TableCell>
                      <TableCell>{record.changeSummary}</TableCell>
                    </TableRow>
                  ))}

                  {records.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography variant="body2" color="text.secondary">
                          No audit records available.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
